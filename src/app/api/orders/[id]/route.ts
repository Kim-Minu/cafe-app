import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  getOrderById as getMemoryOrderById,
  changeOrderStatus,
  cancelOrder,
} from '@/lib/db/store';
import {
  getOrderFromFirestore,
  updateOrderStatusInFirestore,
  updateOrderInFirestore,
  deleteOrderFromFirestore,
} from '@/features/order/firestore';
import { broadcastSSE } from '@/lib/sse/broadcaster';
import { OrderStatus } from '@/types/cafe';

const UpdateOrderSchema = z.object({
  status: z.enum(['PENDING', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED']).optional(),
  customerNote: z.string().max(200).optional(),
  tableNumber: z.string().optional(),
});

/**
 * [GET] /api/orders/[id]
 * 단일 주문 상세 조회
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 1. Firestore에서 조회
    let order = await getOrderFromFirestore(id);

    // 2. 인메모리 폴백
    if (!order) {
      order = getMemoryOrderById(id) || null;
    }

    if (!order) {
      return NextResponse.json(
        { success: false, error: '해당 주문을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: order,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || '주문 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

/**
 * [PATCH] /api/orders/[id]
 * 주문 상태 변경 및 필드 수정
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = UpdateOrderSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: '입력된 수정 정보가 올바르지 않습니다.' },
        { status: 400 }
      );
    }

    // 1. 인메모리 스토어 업데이트
    let updatedOrder = parsed.data.status
      ? changeOrderStatus(id, parsed.data.status)
      : getMemoryOrderById(id);

    // 2. Firestore 동시 업데이트
    if (parsed.data.status) {
      await updateOrderStatusInFirestore(id, parsed.data.status);
    }
    if (parsed.data.customerNote !== undefined || parsed.data.tableNumber !== undefined) {
      await updateOrderInFirestore(id, {
        customerNote: parsed.data.customerNote,
        tableNumber: parsed.data.tableNumber,
      });
    }

    // 인메모리에 없었더라도 Firestore에서 갱신 후 가져오기
    if (!updatedOrder) {
      updatedOrder = await getOrderFromFirestore(id);
    }

    if (!updatedOrder) {
      return NextResponse.json(
        { success: false, error: '해당 주문을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 3. 상태 변경 SSE 브로드캐스트
    if (parsed.data.status) {
      broadcastSSE('ORDER_STATUS_CHANGED', updatedOrder);
    }

    return NextResponse.json({
      success: true,
      message: '주문 정보가 성공적으로 업데이트되었습니다.',
      data: updatedOrder,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || '주문 업데이트 실패' },
      { status: 500 }
    );
  }
}

/**
 * [DELETE] /api/orders/[id]
 * 주문 삭제 또는 주문 취소
 * (?hard=true 인 경우 Firestore 완전 삭제, 기본값은 상태를 CANCELLED로 변경)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const hardDelete = searchParams.get('hard') === 'true';

    if (hardDelete) {
      // 1. Firestore 하드 삭제
      await deleteOrderFromFirestore(id);
      cancelOrder(id);
    } else {
      // 2. 소프트 삭제 (상태 CANCELLED 변경)
      await updateOrderStatusInFirestore(id, 'CANCELLED');
      cancelOrder(id);
    }

    // SSE 알림 전송
    broadcastSSE('ORDER_CANCELLED', { id, hardDelete });

    return NextResponse.json({
      success: true,
      message: hardDelete
        ? '주문이 영구 삭제되었습니다.'
        : '주문이 정상적으로 취소되었습니다.',
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || '주문 삭제 실패' },
      { status: 500 }
    );
  }
}
