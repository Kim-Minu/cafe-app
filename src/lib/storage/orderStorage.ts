import { Order } from '@/types/cafe';

const STORAGE_ORDERS_KEY = 'cafecore_saved_orders';
const STORAGE_ORDER_IDS_KEY = 'cafecore_user_orders';

/**
 * 안전하게 localStorage에 주문 저장 (객체 전체 및 ID 목록 동시 보관)
 */
export function saveOrderToLocalStorage(order: Order): void {
  if (typeof window === 'undefined') return;
  try {
    // 1. 주문 객체 리스트 보관
    const savedOrders = getOrdersFromLocalStorage();
    const existingIdx = savedOrders.findIndex((o) => o.id === order.id);

    if (existingIdx >= 0) {
      savedOrders[existingIdx] = order;
    } else {
      savedOrders.unshift(order);
    }

    localStorage.setItem(STORAGE_ORDERS_KEY, JSON.stringify(savedOrders.slice(0, 50)));

    // 2. 주문 ID 리스트 호환 보관
    const savedIds = getOrderIdsFromLocalStorage();
    if (!savedIds.includes(order.id)) {
      savedIds.unshift(order.id);
      localStorage.setItem(STORAGE_ORDER_IDS_KEY, JSON.stringify(savedIds.slice(0, 50)));
    }
  } catch (error) {
    console.warn('[orderStorage] 주문 로컬스토리지 저장 실패:', error);
  }
}

/**
 * localStorage에 저장된 전체 주문 목록 조회 (더미 주문 ord-101~108 자동 정제)
 */
export function getOrdersFromLocalStorage(): Order[] {
  if (typeof window === 'undefined') return [];
  try {
    // 레거시 더미 키 잔여물 정리
    localStorage.removeItem('cafe_orders');

    const raw = localStorage.getItem(STORAGE_ORDERS_KEY);
    if (!raw) return [];
    const parsed: Order[] = JSON.parse(raw);
    const cleaned = parsed.filter((o) => !/^ord-10[1-8]$/.test(o.id));
    if (cleaned.length !== parsed.length) {
      localStorage.setItem(STORAGE_ORDERS_KEY, JSON.stringify(cleaned));
    }
    return cleaned;
  } catch (error) {
    console.warn('[orderStorage] 주문 로컬스토리지 파싱 실패:', error);
    return [];
  }
}

/**
 * localStorage에 저장된 주문 ID 목록 조회 (더미 ID 자동 정제)
 */
export function getOrderIdsFromLocalStorage(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_ORDER_IDS_KEY);
    if (!raw) return [];
    const parsed: string[] = JSON.parse(raw);
    const cleaned = parsed.filter((id) => !/^ord-10[1-8]$/.test(id));
    if (cleaned.length !== parsed.length) {
      localStorage.setItem(STORAGE_ORDER_IDS_KEY, JSON.stringify(cleaned));
    }
    return cleaned;
  } catch (error) {
    return [];
  }
}

/**
 * localStorage 주문 상태 및 필드 업데이트
 */
export function updateOrderInLocalStorage(orderId: string, updates: Partial<Order>): void {
  if (typeof window === 'undefined') return;
  try {
    const orders = getOrdersFromLocalStorage();
    const targetIdx = orders.findIndex((o) => o.id === orderId);
    if (targetIdx >= 0) {
      orders[targetIdx] = {
        ...orders[targetIdx],
        ...updates,
        updatedAt: updates.updatedAt || new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_ORDERS_KEY, JSON.stringify(orders));
    }
  } catch (error) {
    console.warn('[orderStorage] 주문 로컬스토리지 업데이트 실패:', error);
  }
}

/**
 * 특정 주문을 localStorage에서 삭제
 */
export function removeOrderFromLocalStorage(orderId: string): void {
  if (typeof window === 'undefined') return;
  try {
    const orders = getOrdersFromLocalStorage().filter((o) => o.id !== orderId);
    localStorage.setItem(STORAGE_ORDERS_KEY, JSON.stringify(orders));

    const ids = getOrderIdsFromLocalStorage().filter((id) => id !== orderId);
    localStorage.setItem(STORAGE_ORDER_IDS_KEY, JSON.stringify(ids));
  } catch (error) {
    console.warn('[orderStorage] 주문 로컬스토리지 삭제 실패:', error);
  }
}

/**
 * localStorage의 모든 주문 기록 삭제
 */
export function clearOrdersFromLocalStorage(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_ORDERS_KEY);
    localStorage.removeItem(STORAGE_ORDER_IDS_KEY);
  } catch (error) {
    console.warn('[orderStorage] 주문 로컬스토리지 초기화 실패:', error);
  }
}
