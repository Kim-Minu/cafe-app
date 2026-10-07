'use client';

import { useState } from 'react';
import { Order, OrderStatus } from '@/types/cafe';
import { KDSOrderCard } from './KDSOrderCard';
import { useSSE } from '@/lib/sse/useSSE';
import { updateOrderStatusAction } from '@/features/order/actions';
import { playDingDong, unlockAudio } from '@/lib/audio';
import { CafeTopNavbar } from '@/components/CafeTopNavbar';
import { useAuth } from '@/features/auth/AuthContext';
import { Volume2, VolumeX, Lock, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface KDSViewProps {
  initialOrders: Order[];
}

export function KDSView({ initialOrders }: KDSViewProps) {
  const { isAdmin, login } = useAuth();
  const [adminEmail, setAdminEmail] = useState('admin@gmail.com');
  const [adminPassword, setAdminPassword] = useState('password1234');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError('');
    const res = await login(adminEmail, adminPassword);
    setIsLoggingIn(false);
    if (!res.success) {
      setLoginError(res.error || '관리자/스태프 로그인에 실패했습니다.');
    }
  };

  // Handle audio toggle & browser autoplay policy unlock
  const handleToggleAudio = () => {
    if (!isAudioEnabled) {
      unlockAudio();
      playDingDong();
      setIsAudioEnabled(true);
    } else {
      setIsAudioEnabled(false);
    }
  };

  // Real-time SSE updates
  useSSE({
    onMessage: (msg) => {
      if (msg.type === 'ORDER_CREATED') {
        const newOrder: Order = msg.data;
        setOrders((prev) => [newOrder, ...prev.filter((o) => o.id !== newOrder.id)]);
        if (isAudioEnabled) {
          playDingDong();
        }
      } else if (
        msg.type === 'ORDER_STATUS_CHANGED' ||
        msg.type === 'ORDER_CANCELLED'
      ) {
        const updated: Order = msg.data;
        setOrders((prev) =>
          prev.map((o) => (o.id === updated.id ? updated : o))
        );
      } else if (msg.type === 'INIT' && msg.data?.orders) {
        setOrders(msg.data.orders);
      }
    },
  });

  const handleUpdateStatus = async (orderId: string, nextStatus: OrderStatus) => {
    // Optimistic local update
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? { ...o, status: nextStatus, updatedAt: new Date().toISOString() }
          : o
      )
    );

    const res = await updateOrderStatusAction(orderId, nextStatus);
    if (!res.success) {
      alert(res.error);
    }
  };

  // Active kitchen orders: PENDING, PREPARING
  const activeOrders = orders.filter((o) =>
    ['PENDING', 'PREPARING'].includes(o.status)
  );

  // Guard: If not admin/staff, show access guard
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#f7f6f0] flex flex-col font-sans select-none text-[#191c1b]">
        <CafeTopNavbar />

        <div className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-[#e8ece7] shadow-sm text-center">
            <div className="w-14 h-14 rounded-2xl bg-amber-100 text-[#1e4033] flex items-center justify-center mx-auto mb-4">
              <Lock className="w-7 h-7" />
            </div>

            <span className="text-xs font-black uppercase tracking-widest text-[#1e4033]">
              STAFF & ADMIN ACCESS REQUIRED
            </span>
            <h2 className="text-2xl font-black text-[#191c1b] tracking-tight mt-1">
              주방(KDS) 전용 화면입니다
            </h2>
            <p className="text-xs text-stone-500 font-medium mt-2 leading-relaxed">
              주방 디스플레이 시스템은 매장 관리자(admin@gmail.com) 계정으로 인증된 경우에만 접근할 수 있습니다.
            </p>

            {loginError && (
              <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-bold text-red-600">
                {loginError}
              </div>
            )}

            <form onSubmit={handleAdminLogin} className="mt-6 space-y-3 text-left">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  관리자/스태프 이메일
                </label>
                <input
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#1e4033]"
                  placeholder="admin@gmail.com"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  비밀번호
                </label>
                <input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#1e4033]"
                  placeholder="password1234"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full mt-2 py-3 bg-[#1e4033] hover:bg-[#274f3e] disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-sm flex items-center justify-center gap-1.5 transition-all"
              >
                <span>{isLoggingIn ? '인증 확인 중...' : '관리자 인증 및 주방 입장'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="mt-6 pt-4 border-t border-stone-100 flex items-center justify-between text-xs">
              <Link href="/order" className="text-stone-500 hover:text-[#1e4033] font-bold">
                ← 주문 화면으로 돌아가기
              </Link>
              <Link href="/pickup-board" className="text-[#1e4033] hover:underline font-bold">
                주문 현황판 보기 →
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f6f0] flex flex-col font-sans select-none text-[#191c1b]">
      {/* Top Navigation Bar matching screen_3.png */}
      <CafeTopNavbar activeTab="kitchen" />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto w-full px-8 py-6 flex-1 flex flex-col">
        {/* Section Header matching screen_3.png */}
        <div className="flex items-end justify-between pb-6">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#1e4033]">
              KITCHEN
            </span>
            <h1 className="text-3xl font-black text-[#191c1b] tracking-tight mt-1">
              좋은 한 잔을 만드는 공간
            </h1>
            <p className="text-sm text-stone-500 font-medium mt-1">
              진행 중 {activeOrders.length}건 · 먼저 접수한 주문부터 표시합니다.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleToggleAudio}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-xs font-bold transition shadow-2xs ${
                isAudioEnabled
                  ? 'bg-[#1e4033] text-white border-[#1e4033]'
                  : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
              }`}
            >
              {isAudioEnabled ? (
                <>
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>주문 알림 켜짐</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-3.5 h-3.5 text-stone-400" />
                  <span>알림 음소거 (클릭해 켜기)</span>
                </>
              )}
            </button>

            <span className="px-3 py-1.5 rounded-xl bg-white border border-stone-200 text-stone-400 text-xs font-semibold">
              실시간 연동 중
            </span>
          </div>
        </div>

        {/* 3-Column Order Cards Grid matching screen_3.png */}
        {activeOrders.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-white rounded-3xl border border-[#e8ece7] my-6">
            <div className="w-16 h-16 rounded-full bg-[#e8ece7] flex items-center justify-center text-[#1e4033] mb-4">
              ☕
            </div>
            <h2 className="text-xl font-bold text-[#191c1b]">
              대기 중인 제조 주문이 없습니다
            </h2>
            <p className="text-sm text-stone-500 mt-1">
              새 주문이 들어오면 실시간으로 카드와 차임벨이 울립니다.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {activeOrders.map((order) => (
              <KDSOrderCard
                key={order.id}
                order={order}
                onUpdateStatus={handleUpdateStatus}
              />
            ))}
          </div>
        )}
      </main>

      {/* Footer matching screen_3.png */}
      <footer className="text-center py-6 text-xs text-stone-400 font-medium">
        CAFE CORE · 좋은 하루의 한 잔
      </footer>
    </div>
  );
}
