'use client';

import { useState, useEffect } from 'react';
import { Order, OrderStatus } from '@/types/cafe';
import { formatSimplePrice, formatElapsedMinutes } from '@/lib/utils';
import { useSSE } from '@/lib/sse/useSSE';
import { playPickupChime, triggerMobileVibration } from '@/lib/audio';
import { cancelOrderAction } from '@/features/order/actions';
import {
  CheckCircle2,
  Clock,
  Coffee,
  Sparkles,
  Store,
  Package,
  ArrowLeft,
  Home,
  Receipt,
} from 'lucide-react';
import Link from 'next/link';
import { MobileFNB } from '@/components/MobileFNB';

interface LiveOrderStatusViewProps {
  initialOrder: Order;
}

const STATUS_STEPS: { status: OrderStatus; label: string; desc: string }[] = [
  { status: 'PENDING', label: '주문 접수', desc: '주문이 주방에 전달되었습니다' },
  { status: 'PREPARING', label: '제조 중', desc: '바리스타가 정성껏 제조 중입니다' },
  { status: 'READY', label: '제조 완료', desc: '픽업대에서 음료를 수령해 주세요' },
  { status: 'COMPLETED', label: '수령 완료', desc: '즐거운 시간 되세요!' },
];

export function LiveOrderStatusView({ initialOrder }: LiveOrderStatusViewProps) {
  const [order, setOrder] = useState<Order>(initialOrder);
  const [isCancelling, setIsCancelling] = useState(false);
  const [elapsed, setElapsed] = useState('');

  // Keep live elapsed time
  useEffect(() => {
    const update = () => setElapsed(formatElapsedMinutes(order.createdAt));
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [order.createdAt]);

  // Real-time SSE updates
  useSSE({
    onMessage: (msg) => {
      if (
        (msg.type === 'ORDER_STATUS_CHANGED' || msg.type === 'ORDER_CANCELLED') &&
        msg.data?.id === order.id
      ) {
        const prevStatus = order.status;
        const nextStatus = msg.data.status;
        setOrder(msg.data);

        // If newly transitioned to READY, vibrate and chime!
        if (prevStatus !== 'READY' && nextStatus === 'READY') {
          playPickupChime();
          triggerMobileVibration([300, 150, 300, 150, 500]);
        }
      }
    },
  });

  const handleCancel = async () => {
    if (!confirm('정말로 주문을 취소하시겠습니까?')) return;
    try {
      setIsCancelling(true);
      const res = await cancelOrderAction(order.id);
      if (res.success) {
        setOrder(res.data);
      } else {
        alert(res.error);
      }
    } finally {
      setIsCancelling(false);
    }
  };

  const getStepIndex = (st: OrderStatus) => {
    if (st === 'CANCELLED') return -1;
    return STATUS_STEPS.findIndex((s) => s.status === st);
  };

  const currentStepIdx = getStepIndex(order.status);
  const isReady = order.status === 'READY';
  const isCancelled = order.status === 'CANCELLED';

  return (
    <div className="min-h-screen bg-[#f7f6f0] flex flex-col max-w-lg mx-auto pb-12 shadow-sm border-x border-[#e8ece7]">
      {/* Top Header */}
      <header className="bg-white border-b border-[#e8ece7] px-4 py-3.5 flex items-center justify-between sticky top-0 z-10">
        <Link
          href="/order"
          className="flex items-center gap-1.5 text-xs text-stone-600 hover:text-stone-900 font-bold"
        >
          <ArrowLeft className="w-4 h-4 text-[#1e4033]" />
          <span>메뉴판으로 돌아가기</span>
        </Link>
        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#e8ece7] text-[#1e4033]">
          실시간 주문 상태
        </span>
      </header>

      <main className="p-4 space-y-4 flex-1">
        {/* Main Status Hero Card */}
        <div
          className={`p-6 rounded-3xl border shadow-sm transition-all duration-300 text-center relative overflow-hidden ${
            isReady
              ? 'bg-[#274f3e] text-white border-[#1e4033] ring-4 ring-[#274f3e]/30'
              : isCancelled
              ? 'bg-stone-200 text-stone-700 border-stone-300'
              : 'bg-white text-stone-900 border-[#e8ece7]'
          }`}
        >
          {isReady && (
            <div className="absolute top-3 right-3 text-[#fef3c7]">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
          )}

          <div className="space-y-1">
            <span
              className={`inline-block text-xs font-bold px-3 py-1 rounded-full ${
                isReady
                  ? 'bg-[#fef3c7] text-[#92400e]'
                  : 'bg-[#e8ece7] text-[#1e4033]'
              }`}
            >
              주문 번호
            </span>
            <div className="text-5xl font-black tracking-tight my-2">
              #{order.orderNumber}
            </div>
            <div className="flex items-center justify-center gap-2 text-xs font-medium opacity-80">
              <span className="flex items-center gap-1">
                {order.orderType === 'HERE' ? (
                  <>
                    <Store className="w-3.5 h-3.5" />
                    <span>매장 {order.tableNumber ? `(테이블 ${order.tableNumber})` : ''}</span>
                  </>
                ) : (
                  <>
                    <Package className="w-3.5 h-3.5" />
                    <span>포장 (테이크아웃)</span>
                  </>
                )}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>{elapsed} 경과</span>
              </span>
            </div>
          </div>

          {/* Headline Message */}
          <div className="mt-5 pt-4 border-t border-black/10">
            {isReady ? (
              <div className="space-y-1">
                <h2 className="text-2xl font-black tracking-tight text-white">
                  음료가 준비되었습니다! 🎉
                </h2>
                <p className="text-sm font-medium text-emerald-100">
                  픽업대에서 주문 번호 #{order.orderNumber}을 확인해 주세요.
                </p>
              </div>
            ) : isCancelled ? (
              <div className="space-y-1 text-stone-600">
                <h2 className="text-xl font-bold">주문이 취소되었습니다</h2>
                <p className="text-xs">매장 카운터에 문의해 주시기 바랍니다.</p>
              </div>
            ) : (
              <div className="space-y-1">
                <h2 className="text-xl font-black text-stone-800">
                  {order.status === 'PREPARING'
                    ? '음료를 정성껏 제조 중입니다 ☕'
                    : '주문이 접수되어 대기 중입니다 ⏳'}
                </h2>
                <p className="text-xs text-stone-500">
                  제조가 완료되면 화면과 알림으로 즉시 안내해 드립니다.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Step Progress Timeline */}
        {!isCancelled && (
          <div className="bg-white rounded-3xl p-5 border border-[#e8ece7] shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider">
              진행 단계
            </h3>

            <div className="space-y-3">
              {STATUS_STEPS.map((step, idx) => {
                const isPassed = currentStepIdx >= idx;
                const isCurrent = currentStepIdx === idx;

                return (
                  <div key={step.status} className="flex items-start gap-3.5">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                          isPassed
                            ? 'bg-[#1e4033] text-white'
                            : 'bg-stone-100 text-stone-400'
                        } ${isCurrent ? 'ring-4 ring-[#e8ece7]' : ''}`}
                      >
                        {isPassed ? (
                          <CheckCircle2 className="w-4 h-4" />
                        ) : (
                          <span>{idx + 1}</span>
                        )}
                      </div>
                      {idx < STATUS_STEPS.length - 1 && (
                        <div
                          className={`w-0.5 h-6 my-1 ${
                            currentStepIdx > idx ? 'bg-[#1e4033]' : 'bg-stone-200'
                          }`}
                        />
                      )}
                    </div>

                    <div className="flex-1 pt-0.5">
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-sm font-bold ${
                            isCurrent
                              ? 'text-[#1e4033]'
                              : isPassed
                              ? 'text-stone-800'
                              : 'text-stone-400'
                          }`}
                        >
                          {step.label}
                        </span>
                        {isCurrent && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#e8ece7] text-[#1e4033]">
                            현재 진행 중
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-stone-500 mt-0.5">{step.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Order Items Details */}
        <div className="bg-white rounded-3xl p-5 border border-[#e8ece7] shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-[#f2f4f1] pb-2">
            <h3 className="text-sm font-bold text-stone-900">주문 내역</h3>
            <span className="text-xs text-stone-500 font-medium">
              총 {order.items.reduce((s, i) => s + i.quantity, 0)}개
            </span>
          </div>

          <div className="divide-y divide-[#f2f4f1] space-y-2">
            {order.items.map((item) => (
              <div key={item.id} className="pt-2 flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-stone-800">
                      {item.menuName}
                    </span>
                    <span className="text-xs font-semibold text-stone-500">
                      x{item.quantity}
                    </span>
                  </div>
                  {item.selectedOptions.length > 0 && (
                    <p className="text-xs text-stone-500 mt-0.5">
                      {item.selectedOptions.map((o) => o.optionName).join(', ')}
                    </p>
                  )}
                </div>
                <span className="text-sm font-bold text-stone-900">
                  {formatSimplePrice(item.itemTotal)}
                </span>
              </div>
            ))}
          </div>

          {order.customerNote && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 mt-2">
              <span className="font-bold">요청사항: </span>
              {order.customerNote}
            </div>
          )}

          <div className="border-t border-[#f2f4f1] pt-3 flex items-center justify-between">
            <span className="text-sm text-stone-500 font-medium">총 결제 금액</span>
            <span className="text-lg font-black text-[#1e4033]">
              {formatSimplePrice(order.totalAmount)}
            </span>
          </div>
        </div>

        {/* Action Buttons: 홈으로 가기 & 내 주문 목록 */}
        <div className="flex gap-2 pt-2">
          <Link
            href="/"
            className="flex-1 py-3 px-4 rounded-2xl bg-white border border-[#e8ece7] text-[#191c1b] text-xs font-bold hover:bg-stone-50 transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
          >
            <Home className="w-4 h-4 text-[#1e4033]" />
            <span>홈으로 가기</span>
          </Link>
          <Link
            href="/orders"
            className="flex-1 py-3 px-4 rounded-2xl bg-[#1e4033] text-white text-xs font-bold hover:bg-[#274f3e] transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
          >
            <Receipt className="w-4 h-4" />
            <span>내 주문 목록</span>
          </Link>
        </div>
      </main>

      {/* Persistent Mobile FNB for PWA App navigation */}
      <MobileFNB activeTab="orders" />
    </div>
  );
}
