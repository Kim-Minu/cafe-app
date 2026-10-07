'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Order, OrderStatus } from '@/types/cafe';
import { getOrdersByIdsAction, getOrdersByUserIdAction } from '@/features/order/actions';
import { useAuth } from '@/features/auth/AuthContext';
import {
  getOrdersFromLocalStorage,
  getOrderIdsFromLocalStorage,
  saveOrderToLocalStorage,
  updateOrderInLocalStorage,
  removeOrderFromLocalStorage,
  clearOrdersFromLocalStorage,
} from '@/lib/storage/orderStorage';
import { useSSE } from '@/lib/sse/useSSE';
import { formatSimplePrice } from '@/lib/utils';
import { CafeTopNavbar } from '@/components/CafeTopNavbar';
import { MobileFNB } from '@/components/MobileFNB';
import {
  Coffee,
  Clock,
  ArrowLeft,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  ShoppingBag,
  ExternalLink,
  RotateCcw,
  Trash2,
} from 'lucide-react';

const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; desc: string; badgeClass: string; cardBorder: string }
> = {
  PENDING: {
    label: '접수 대기',
    desc: '주문이 매장에 접수되어 주방 확인 중입니다.',
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-200',
    cardBorder: 'border-amber-200 bg-white shadow-xs',
  },
  PREPARING: {
    label: '메뉴 제조 중',
    desc: '바리스타가 정성껏 음료를 제조하고 있습니다.',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200 animate-pulse',
    cardBorder: 'border-[#1e4033]/30 bg-emerald-50/20 shadow-xs',
  },
  READY: {
    label: '픽업 준비 완료',
    desc: '메뉴가 준비되었습니다! 픽업대에서 픽업해 주세요.',
    badgeClass: 'bg-blue-600 text-white font-black',
    cardBorder: 'border-blue-500 bg-blue-50/30 ring-2 ring-blue-500/20 shadow-md',
  },
  COMPLETED: {
    label: '픽업 완료',
    desc: '픽업이 완료되었습니다. 이용해 주셔서 감사합니다.',
    badgeClass: 'bg-stone-100 text-stone-600 border-stone-200',
    cardBorder: 'border-stone-200 bg-white',
  },
  CANCELLED: {
    label: '주문 취소',
    desc: '주문이 취소되었습니다.',
    badgeClass: 'bg-rose-100 text-rose-700 border-rose-200',
    cardBorder: 'border-rose-200 bg-white opacity-70',
  },
};

export default function MyOrdersPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'ALL' | 'ACTIVE' | 'DONE'>('ALL');

  // 로컬스토리지 및 사용자 ID 기준 주문 조회 & 서버 동기화
  const loadAndSyncOrders = useCallback(async () => {
    try {
      // 1. 로컬스토리지에서 즉시 조회 (더미 데이터 ord-101 ~ ord-108 필터링)
      const localOrders = getOrdersFromLocalStorage().filter(
        (o) => !/^ord-10[1-8]$/.test(o.id)
      );

      if (localOrders.length > 0) {
        setOrders(
          [...localOrders].sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
        );
        setIsLoading(false);
      }

      // 2. 서버에서 주문 조회
      let serverOrders: Order[] = [];

      // 2-A. 로그인 사용자인 경우: Firestore에서 회원 ID 기준 주문 내역 조회
      if (user?.uid) {
        const userRes = await getOrdersByUserIdAction(user.uid);
        if (userRes.success && userRes.data) {
          serverOrders = userRes.data;
        }
      }

      // 2-B. 로컬스토리지에 보관된 주문 ID들도 함께 조회 (비회원/기기 주문 병합)
      const orderIds = getOrderIdsFromLocalStorage().filter(
        (id) => !/^ord-10[1-8]$/.test(id)
      );

      if (orderIds.length > 0) {
        const idRes = await getOrdersByIdsAction(orderIds);
        if (idRes.success && idRes.data) {
          const existingIds = new Set(serverOrders.map((o) => o.id));
          for (const o of idRes.data) {
            if (!existingIds.has(o.id)) {
              serverOrders.push(o);
            }
          }
        }
      }

      // 3. 서버 최신 주문들을 로컬스토리지에 반영 및 화면 업데이트
      if (serverOrders.length > 0) {
        serverOrders.forEach((order) => {
          saveOrderToLocalStorage(order);
        });

        const sorted = [...serverOrders].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setOrders(sorted);
      } else if (localOrders.length === 0) {
        setOrders([]);
      }
    } catch (e) {
      console.error('주문 내역 조회 오류:', e);
    } finally {
      setIsLoading(false);
    }
  }, [user?.uid]);

  useEffect(() => {
    loadAndSyncOrders();
  }, [loadAndSyncOrders]);

  // 실시간 주문 상태 변경 반영 (SSE) -> 화면 및 로컬스토리지 동시 갱신
  useSSE({
    onMessage: (msg) => {
      if (msg.type === 'ORDER_STATUS_CHANGED' || msg.type === 'ORDER_CANCELLED') {
        const orderId = msg.data.id;
        if (orderId) {
          updateOrderInLocalStorage(orderId, msg.data);
          setOrders((prev) =>
            prev.map((o) => (o.id === orderId ? { ...o, ...msg.data } : o))
          );
        }
      }
    },
  });

  const handleRemoveOrder = (orderId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('이 주문 내역을 목록에서 삭제하시겠습니까?')) {
      removeOrderFromLocalStorage(orderId);
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
    }
  };

  const handleClearAll = () => {
    if (confirm('전체 주문 내역을 삭제하시겠습니까?')) {
      clearOrdersFromLocalStorage();
      setOrders([]);
    }
  };

  const filteredOrders = orders.filter((order) => {
    if (activeTab === 'ACTIVE') {
      return (
        order.status === 'PENDING' ||
        order.status === 'PREPARING' ||
        order.status === 'READY'
      );
    }
    if (activeTab === 'DONE') {
      return order.status === 'COMPLETED' || order.status === 'CANCELLED';
    }
    return true;
  });

  const activeCount = orders.filter(
    (o) => o.status === 'PENDING' || o.status === 'PREPARING' || o.status === 'READY'
  ).length;

  return (
    <div className="min-h-screen bg-[#f7f6f0] pb-24 md:pb-12 flex flex-col font-sans">
      <div className="hidden md:block">
        <CafeTopNavbar activeTab="orders" />
      </div>

      <main className="flex-1 max-w-lg w-full mx-auto px-4 py-5">
        {/* Header Bar */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                if (window.history.length > 1) {
                  router.back();
                } else {
                  router.push('/order');
                }
              }}
              className="w-9 h-9 rounded-full bg-white border border-[#e8ece7] flex items-center justify-center text-stone-600 hover:text-black shadow-xs cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-[#191c1b]">내 주문 내역</h1>
                {user && (
                  <span className="px-2 py-0.5 rounded-full bg-[#1e4033] text-white text-[10px] font-black">
                    {user.displayName}님
                  </span>
                )}
              </div>
              <p className="text-[11px] text-stone-500">
                주문하신 메뉴와 실시간 제조 진행 상태를 확인하세요
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => loadAndSyncOrders()}
              title="새로고침"
              className="p-2 rounded-xl bg-white border border-[#e8ece7] text-stone-600 hover:bg-stone-50 transition-colors shadow-2xs cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            {orders.length > 0 && (
              <button
                type="button"
                onClick={handleClearAll}
                title="전체 기록 삭제"
                className="p-2 rounded-xl bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors shadow-2xs cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 p-1.5 bg-[#e8ece7] rounded-2xl mb-5">
          <button
            type="button"
            onClick={() => setActiveTab('ALL')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeTab === 'ALL'
                ? 'bg-white text-[#1e4033] shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            전체 내역 ({orders.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('ACTIVE')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer ${
              activeTab === 'ACTIVE'
                ? 'bg-[#1e4033] text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <span>제조 진행 중</span>
            {activeCount > 0 && (
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                  activeTab === 'ACTIVE'
                    ? 'bg-emerald-400 text-stone-950'
                    : 'bg-emerald-700 text-white'
                }`}
              >
                {activeCount}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('DONE')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeTab === 'DONE'
                ? 'bg-white text-[#1e4033] shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            완료 / 취소 ({orders.length - activeCount})
          </button>
        </div>

        {/* Content List */}
        {isLoading ? (
          <div className="py-20 text-center">
            <div className="w-8 h-8 border-3 border-[#1e4033] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-stone-500 font-semibold">주문 내역을 불러오는 중...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white rounded-3xl border border-[#e8ece7] p-10 text-center shadow-xs my-4">
            <div className="w-16 h-16 rounded-full bg-[#f4f6f4] text-[#1e4033] flex items-center justify-center mx-auto mb-4">
              <Coffee className="w-8 h-8 opacity-70" />
            </div>
            <h3 className="text-base font-bold text-stone-900 mb-1">
              {activeTab === 'ACTIVE'
                ? '현재 제조 중인 주문이 없습니다'
                : activeTab === 'DONE'
                ? '완료된 주문이 없습니다'
                : '아직 주문 내역이 없습니다'}
            </h3>
            <p className="text-xs text-stone-500 mb-6 leading-relaxed">
              카페 코어의 신선하고 깊은 스페셜티 커피를
              <br />
              지금 편리하게 주문해 보세요.
            </p>
            <Link
              href="/order"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#1e4033] hover:bg-[#274f3e] text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>음료 주문하러 가기</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => {
              const statusCfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDING;
              const formattedDate = new Date(order.createdAt).toLocaleDateString('ko-KR', {
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={order.id}
                  onClick={() => router.push(`/status/${order.id}`)}
                  className={`rounded-3xl border p-4 transition-all hover:shadow-md cursor-pointer ${statusCfg.cardBorder}`}
                >
                  {/* Top Bar: Order Number & Status Badge */}
                  <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-[#1e4033]">
                        주문 #{order.orderNumber}
                      </span>
                      {order.tableNumber && (
                        <span className="px-1.5 py-0.5 rounded-md bg-stone-100 text-stone-700 text-[10px] font-bold">
                          테이블 {order.tableNumber}
                        </span>
                      )}
                      <span className="px-1.5 py-0.5 rounded-md bg-stone-100 text-stone-500 text-[10px] font-medium">
                        {order.orderType === 'HERE' ? '매장' : '포장'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-bold border ${statusCfg.badgeClass}`}
                      >
                        {statusCfg.label}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => handleRemoveOrder(order.id, e)}
                        title="기록 삭제"
                        className="text-stone-300 hover:text-stone-500 p-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Status Helper Message */}
                  <div className="flex items-center gap-2 text-[11px] text-stone-600 bg-stone-50/80 px-3 py-2 rounded-xl mb-3">
                    <Clock className="w-3.5 h-3.5 text-[#1e4033] shrink-0" />
                    <span className="truncate">{statusCfg.desc}</span>
                  </div>

                  {/* Menu Items List */}
                  <div className="space-y-1.5 mb-3">
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between text-xs text-stone-800"
                      >
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="font-bold truncate">{item.menuName}</span>
                          <span className="text-stone-500 font-medium shrink-0">
                            × {item.quantity}
                          </span>
                        </div>
                        <span className="font-semibold shrink-0">
                          {formatSimplePrice(item.itemTotal)}원
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Footer Bar: Date & Total Amount */}
                  <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-[11px] text-stone-400">
                    <span>{formattedDate}</span>
                    <div className="flex items-center gap-1 font-bold text-stone-900 text-xs">
                      <span>총 결제금액:</span>
                      <span className="text-[#1e4033] font-black text-sm">
                        {formatSimplePrice(order.totalAmount)}원
                      </span>
                      <ChevronRight className="w-4 h-4 text-stone-400 ml-0.5" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <MobileFNB activeTab="orders" />
    </div>
  );
}
