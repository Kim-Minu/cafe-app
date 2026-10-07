import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Order, OrderStatus, OrderSource } from '@/types/cafe';

const ORDERS_COLLECTION = 'orders';

/**
 * [CREATE / UPSERT] Cloud Firestore 'orders' 컬렉션에 주문 저장
 */
export async function saveOrderToFirestore(order: Order): Promise<boolean> {
  try {
    const docRef = doc(db, ORDERS_COLLECTION, order.id);
    await setDoc(
      docRef,
      {
        id: order.id,
        orderNumber: order.orderNumber,
        orderSource: order.orderSource,
        tableNumber: order.tableNumber || '',
        orderType: order.orderType,
        status: order.status,
        items: order.items,
        totalAmount: order.totalAmount,
        customerNote: order.customerNote || '',
        userId: order.userId || '',
        userEmail: order.userEmail || '',
        customerName: order.customerName || '',
        createdAt: order.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
    return true;
  } catch (error) {
    console.warn('[Firestore] 주문 저장 실패:', error);
    return false;
  }
}

/**
 * [READ - 단건] Cloud Firestore에서 단일 주문 조회
 */
export async function getOrderFromFirestore(orderId: string): Promise<Order | null> {
  try {
    const docRef = doc(db, ORDERS_COLLECTION, orderId);
    const snap = await getDoc(docRef);

    if (!snap.exists()) {
      return null;
    }

    const data = snap.data();
    return {
      id: snap.id,
      orderNumber: data.orderNumber,
      orderSource: data.orderSource as OrderSource,
      tableNumber: data.tableNumber || undefined,
      orderType: data.orderType,
      status: data.status as OrderStatus,
      items: data.items || [],
      totalAmount: data.totalAmount || 0,
      customerNote: data.customerNote || undefined,
      userId: data.userId || undefined,
      userEmail: data.userEmail || undefined,
      customerName: data.customerName || undefined,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  } catch (error) {
    console.warn('[Firestore] 단일 주문 조회 실패:', error);
    return null;
  }
}

/**
 * [READ - 목록] Cloud Firestore에서 주문 목록 필터 및 조회
 */
export async function fetchOrdersFromFirestore(options?: {
  status?: OrderStatus;
  userId?: string;
  orderSource?: OrderSource;
  limitCount?: number;
}): Promise<Order[]> {
  try {
    const constraints: any[] = [];

    if (options?.status) {
      constraints.push(where('status', '==', options.status));
    }
    if (options?.userId) {
      constraints.push(where('userId', '==', options.userId));
    }
    if (options?.orderSource) {
      constraints.push(where('orderSource', '==', options.orderSource));
    }

    // 기본 정렬: 최신 등록순
    constraints.push(orderBy('createdAt', 'desc'));

    if (options?.limitCount) {
      constraints.push(limit(options.limitCount));
    }

    const q = query(collection(db, ORDERS_COLLECTION), ...constraints);
    const snapshot = await getDocs(q);
    const orders: Order[] = [];

    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      orders.push({
        id: docSnap.id,
        orderNumber: data.orderNumber,
        orderSource: data.orderSource as OrderSource,
        tableNumber: data.tableNumber || undefined,
        orderType: data.orderType,
        status: data.status as OrderStatus,
        items: data.items || [],
        totalAmount: data.totalAmount || 0,
        customerNote: data.customerNote || undefined,
        userId: data.userId || undefined,
        userEmail: data.userEmail || undefined,
        customerName: data.customerName || undefined,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      });
    });

    return orders;
  } catch (error) {
    console.warn('[Firestore] 주문 목록 조회 실패:', error);
    return [];
  }
}

/**
 * [UPDATE - 상태 변경] 주문 상태 업데이트
 */
export async function updateOrderStatusInFirestore(
  orderId: string,
  status: OrderStatus
): Promise<boolean> {
  try {
    const docRef = doc(db, ORDERS_COLLECTION, orderId);
    await updateDoc(docRef, {
      status,
      updatedAt: new Date().toISOString(),
    });
    return true;
  } catch (error) {
    console.warn('[Firestore] 주문 상태 업데이트 실패:', error);
    return false;
  }
}

/**
 * [UPDATE - 부분 필드 수정]
 */
export async function updateOrderInFirestore(
  orderId: string,
  data: Partial<Order>
): Promise<boolean> {
  try {
    const docRef = doc(db, ORDERS_COLLECTION, orderId);
    const updatePayload: Record<string, any> = {
      ...data,
      updatedAt: new Date().toISOString(),
    };
    delete updatePayload.id; // ID 필드는 docRef로 고정
    await updateDoc(docRef, updatePayload);
    return true;
  } catch (error) {
    console.warn('[Firestore] 주문 정보 수정 실패:', error);
    return false;
  }
}

/**
 * [DELETE - 완전 삭제]
 */
export async function deleteOrderFromFirestore(orderId: string): Promise<boolean> {
  try {
    const docRef = doc(db, ORDERS_COLLECTION, orderId);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.warn('[Firestore] 주문 삭제 실패:', error);
    return false;
  }
}
