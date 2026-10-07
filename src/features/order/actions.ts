'use server';

import { z } from 'zod';
import {
  createNewOrder,
  changeOrderStatus,
  updateMenuItemSoldOut,
  cancelOrder,
  getOrderById,
  getAllOrders,
  getMenuItems,
} from '@/lib/db/store';
import {
  saveOrderToFirestore,
  updateOrderStatusInFirestore,
  getOrderFromFirestore,
  fetchOrdersFromFirestore,
} from './firestore';
import { broadcastSSE } from '@/lib/sse/broadcaster';
import { Order, OrderStatus } from '@/types/cafe';

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

const CreateOrderInputSchema = z.object({
  orderSource: z.enum(['KIOSK', 'MOBILE']),
  tableNumber: z.string().optional(),
  orderType: z.enum(['HERE', 'TOGO']),
  items: z.array(OrderItemSchema).min(1, '주문 항목은 1개 이상이어야 합니다.'),
  customerNote: z.string().max(200).optional(),
  userId: z.string().optional(),
  userEmail: z.string().optional(),
  customerName: z.string().optional(),
});

export type ActionResult<T = unknown> =
  | { success: true; data: T }
  | { success: false; error: string };

export async function createOrderAction(input: unknown): Promise<ActionResult<Order>> {
  try {
    const parsed = CreateOrderInputSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message || '입력값이 올바르지 않습니다.' };
    }

    const newOrder = createNewOrder(parsed.data);

    // Save to Cloud Firestore
    saveOrderToFirestore(newOrder).catch((err) => {
      console.warn('[Firestore] 주문 비동기 저장 오류:', err);
    });

    // Broadcast real-time order creation event to KDS & Admin
    broadcastSSE('ORDER_CREATED', newOrder);

    return { success: true, data: newOrder };
  } catch (err: any) {
    return { success: false, error: err.message || '주문 생성에 실패했습니다.' };
  }
}

const UpdateStatusSchema = z.object({
  orderId: z.string(),
  nextStatus: z.enum(['PENDING', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED']),
});

export async function updateOrderStatusAction(
  orderId: string,
  nextStatus: OrderStatus
): Promise<ActionResult<Order>> {
  try {
    const parsed = UpdateStatusSchema.safeParse({ orderId, nextStatus });
    if (!parsed.success) {
      return { success: false, error: '잘못된 주문 상태 변경 요청입니다.' };
    }

    const updated = changeOrderStatus(orderId, nextStatus);
    if (!updated) {
      return { success: false, error: '해당 주문을 찾을 수 없습니다.' };
    }

    // Sync status with Firestore
    updateOrderStatusInFirestore(orderId, nextStatus).catch((err) => {
      console.warn('[Firestore] 주문 상태 업데이트 오류:', err);
    });

    // Broadcast to KDS, customer screen, pickup display, and admin
    broadcastSSE('ORDER_STATUS_CHANGED', updated);

    return { success: true, data: updated };
  } catch (err: any) {
    return { success: false, error: err.message || '상태 변경에 실패했습니다.' };
  }
}

export async function toggleMenuItemSoldOutAction(
  menuId: string,
  isSoldOut: boolean
): Promise<ActionResult<{ menuId: string; isSoldOut: boolean }>> {
  try {
    const updated = updateMenuItemSoldOut(menuId, isSoldOut);
    if (!updated) {
      return { success: false, error: '해당 메뉴를 찾을 수 없습니다.' };
    }

    broadcastSSE('MENU_UPDATED', { menuItems: getMenuItems() });

    return { success: true, data: { menuId, isSoldOut } };
  } catch (err: any) {
    return { success: false, error: err.message || '품절 처리에 실패했습니다.' };
  }
}

export async function cancelOrderAction(orderId: string): Promise<ActionResult<Order>> {
  try {
    const cancelled = cancelOrder(orderId);
    if (!cancelled) {
      return { success: false, error: '해당 주문을 찾을 수 없습니다.' };
    }

    // Sync cancelled status with Firestore
    updateOrderStatusInFirestore(orderId, 'CANCELLED').catch((err) => {
      console.warn('[Firestore] 주문 취소 상태 업데이트 오류:', err);
    });

    broadcastSSE('ORDER_CANCELLED', cancelled);
    return { success: true, data: cancelled };
  } catch (err: any) {
    return { success: false, error: err.message || '주문 취소에 실패했습니다.' };
  }
}

export async function getOrderStateAction(orderId: string): Promise<ActionResult<Order>> {
  const order = getOrderById(orderId);
  if (!order) {
    return { success: false, error: '주문 정보를 찾을 수 없습니다.' };
  }
  return { success: true, data: order };
}

export async function getOrdersByIdsAction(orderIds: string[]): Promise<ActionResult<Order[]>> {
  try {
    const orders: Order[] = [];
    for (const id of orderIds) {
      let order = getOrderById(id);
      if (!order) {
        order = (await getOrderFromFirestore(id)) || undefined;
      }
      if (order) {
        orders.push(order);
      }
    }
    return { success: true, data: orders };
  } catch (err: any) {
    return { success: false, error: err.message || '주문 목록을 가져오지 못했습니다.' };
  }
}

export async function getOrdersByUserIdAction(userId: string): Promise<ActionResult<Order[]>> {
  try {
    const firestoreOrders = await fetchOrdersFromFirestore({ userId });
    const memoryOrders = getAllOrders().filter((o) => o.userId === userId);

    const map = new Map<string, Order>();
    for (const o of firestoreOrders) map.set(o.id, o);
    for (const o of memoryOrders) map.set(o.id, o);

    const merged = Array.from(map.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return { success: true, data: merged };
  } catch (err: any) {
    return { success: false, error: err.message || '회원 주문 내역 조회 실패' };
  }
}

export async function getAllOrdersCombined(): Promise<Order[]> {
  try {
    const firestoreOrders = await fetchOrdersFromFirestore({ limitCount: 200 });
    const memoryOrders = getAllOrders();

    const map = new Map<string, Order>();
    for (const o of firestoreOrders) map.set(o.id, o);
    for (const o of memoryOrders) map.set(o.id, o);

    return Array.from(map.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } catch (err) {
    console.warn('[Orders] 전체 주문 로드 오류 (메모리 폴백):', err);
    return getAllOrders();
  }
}
