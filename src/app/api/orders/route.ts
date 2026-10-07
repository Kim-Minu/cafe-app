import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  createNewOrder,
  getAllOrders as getMemoryOrders,
} from '@/lib/db/store';
import {
  saveOrderToFirestore,
  fetchOrdersFromFirestore,
} from '@/features/order/firestore';
import { broadcastSSE } from '@/lib/sse/broadcaster';
import { OrderStatus, OrderSource } from '@/types/cafe';

const SelectedOptionSchema = z.object({
  groupId: z.string(),
  groupName: z.string(),
  optionId: z.string(),
  optionName: z.string(),
  additionalPrice: z.number(),
});

const OrderItemSchema = z.object({
  id: z.string(),
  menuItemId: z.string(),
  menuName: z.string(),
  basePrice: z.number().nonnegative(),
  unitPrice: z.number().nonnegative(),
  quantity: z.number().int().positive(),
  selectedOptions: z.array(SelectedOptionSchema),
  itemTotal: z.number().nonnegative(),
});

const CreateOrderBodySchema = z.object({
  orderSource: z.enum(['KIOSK', 'MOBILE']),
  tableNumber: z.string().optional(),
  orderType: z.enum(['HERE', 'TOGO']),
  items: z.array(OrderItemSchema).min(1, '주문 항목은 1개 이상이어야 합니다.'),
  customerNote: z.string().max(200).optional(),
  userId: z.string().optional(),
  userEmail: z.string().optional(),
  customerName: z.string().optional(),
});

/**
 * [GET] /api/orders
 * 주문 목록 조회 (Firestore 연동 + 로컬 캐시 폴백)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as OrderStatus | null;
    const source = searchParams.get('source') as OrderSource | null;
    const userId = searchParams.get('userId') || undefined;
    const limitParam = searchParams.get('limit');
    const limitCount = limitParam ? parseInt(limitParam, 10) : 50;

    // 1. Firestore에서 조회 시도
    let orders = await fetchOrdersFromFirestore({
      status: status || undefined,
      orderSource: source || undefined,
      userId,
      limitCount,
    });

    // 2. Firestore 조회 결과가 비어있거나 실패한 경우 인메모리 스토어 폴백
    if (!orders || orders.length === 0) {
      let memoryOrders = getMemoryOrders();
      if (status) {
        memoryOrders = memoryOrders.filter((o) => o.status === status);
      }
      if (source) {
        memoryOrders = memoryOrders.filter((o) => o.orderSource === source);
      }
      if (userId) {
        memoryOrders = memoryOrders.filter((o) => o.userId === userId);
      }
      orders = memoryOrders.slice(0, limitCount);
    }

    return NextResponse.json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || '주문 목록을 가져오는 데 실패했습니다.' },
      { status: 500 }
    );
  }
}

/**
 * [POST] /api/orders
 * 신규 주문 생성 (Firestore 저장 + 인메모리 동기화 + SSE 브로드캐스트)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = CreateOrderBodySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: parsed.error.issues[0]?.message || '올바른 주문 데이터 형식이 아닙니다.',
          details: parsed.error.issues,
        },
        { status: 400 }
      );
    }

    // 1. 인메모리 스토어에 주문 생성
    const newOrder = createNewOrder(parsed.data);

    // 2. Cloud Firestore 'orders' 컬렉션에 비동기 영구 저장
    saveOrderToFirestore(newOrder).catch((err) => {
      console.warn('[Firestore] 비동기 주문 저장 실패 경고:', err);
    });

    // 3. KDS, 대시보드, 픽업보드로 실시간 SSE 이벤트 브로드캐스팅
    broadcastSSE('ORDER_CREATED', newOrder);

    return NextResponse.json(
      {
        success: true,
        message: '주문이 성공적으로 접수되었습니다.',
        data: newOrder,
      },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || '주문 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
