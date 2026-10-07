'use client';

import { useState, useEffect } from 'react';
import { Order } from '@/types/cafe';
import { useSSE } from '@/lib/sse/useSSE';
import { playPickupChime, unlockAudio } from '@/lib/audio';
import {
  Coffee,
  Clock,
  CheckCircle2,
  Volume2,
  VolumeX,
  Sparkles,
  Megaphone,
} from 'lucide-react';
import Link from 'next/link';

interface PickupBoardViewProps {
  initialOrders: Order[];
}

export function PickupBoardView({ initialOrders }: PickupBoardViewProps) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const [latestReadyId, setLatestReadyId] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('ko-KR', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleAudio = () => {
    if (!isAudioEnabled) {
      unlockAudio();
      playPickupChime();
      setIsAudioEnabled(true);
    } else {
      setIsAudioEnabled(false);
    }
  };

  useSSE({
    onMessage: (msg) => {
      if (
        msg.type === 'ORDER_STATUS_CHANGED' ||
        msg.type === 'ORDER_CREATED' ||
        msg.type === 'ORDER_CANCELLED'
      ) {
        if (msg.type === 'ORDER_STATUS_CHANGED') {
          const updated: Order = msg.data;
          if (updated.status === 'READY') {
            setLatestReadyId(updated.id);
            if (isAudioEnabled) {
              playPickupChime();
            }
          }
        }

        if (msg.type === 'ORDER_CREATED') {
          setOrders((prev) => [msg.data, ...prev]);
        } else {
          setOrders((prev) =>
            prev.map((o) => (o.id === msg.data.id ? msg.data : o))
          );
        }
      } else if (msg.type === 'INIT' && msg.data?.orders) {
        setOrders(msg.data.orders);
      }
    },
  });

  // Preparing orders (PENDING or PREPARING)
  const preparingOrders = orders
    .filter((o) => o.status === 'PREPARING' || o.status === 'PENDING')
    .slice(0, 12);

  // Ready orders (READY)
  const readyOrders = orders.filter((o) => o.status === 'READY').slice(0, 6);

  return (
    <div className="min-h-screen bg-[#f7f6f0] flex flex-col justify-between p-8 font-sans select-none text-[#191c1b]">
      {/* Top Header matching screen_4.png */}
      <header className="flex items-center justify-between pb-6 border-b border-[#e8ece7]/70">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-[#1e4033] flex items-center justify-center text-white shadow-sm">
            <Coffee className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-[#191c1b] tracking-tight">
              CAFE CORE
            </h1>
            <p className="text-xs text-stone-500 font-medium">카페 코어 송파점</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <button
            type="button"
            onClick={handleToggleAudio}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition ${
              isAudioEnabled
                ? 'bg-[#1e4033] text-white border-[#1e4033]'
                : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
            }`}
          >
            {isAudioEnabled ? (
              <>
                <Volume2 className="w-4 h-4" />
                <span>알림음 켜짐</span>
              </>
            ) : (
              <>
                <VolumeX className="w-4 h-4 text-stone-400" />
                <span>알림음 끄기</span>
              </>
            )}
          </button>

          <Link
            href="/"
            className="text-xs text-stone-400 hover:text-stone-700 underline"
          >
            허브
          </Link>

          <div className="text-3xl font-bold text-stone-800 tracking-tight flex items-center gap-2">
            <span className="text-stone-300 font-light">|</span>
            <span>{currentTime || '14:32'}</span>
          </div>
        </div>
      </header>

      {/* Main Title matching screen_4.png */}
      <div className="py-6 text-center">
        <h2 className="text-4xl font-black text-[#191c1b] tracking-tight">
          당신의 한 잔을 준비하고 있어요
        </h2>
        <p className="text-base text-stone-500 mt-2 font-medium">
          픽업 가능한 주문번호를 확인해 주세요.
        </p>
      </div>

      {/* 2-Split Panels matching screen_4.png */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 max-w-7xl mx-auto w-full my-2">
        {/* Left Panel: 제조 중 */}
        <section className="bg-[#e8ece7] rounded-3xl p-7 flex flex-col shadow-xs">
          {/* Header */}
          <div className="flex items-center gap-3 pb-6">
            <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-[#1e4033] shadow-2xs">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="text-2xl font-black text-[#191c1b]">제조 중</h3>
            <span className="text-xs font-bold text-stone-500 ml-auto">
              {preparingOrders.length}건
            </span>
          </div>

          {/* Numbers Grid */}
          {preparingOrders.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-stone-400 font-medium">
              현재 제조 중인 주문이 없습니다.
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-4 flex-1 items-start">
              {preparingOrders.map((ord) => (
                <div
                  key={ord.id}
                  className="bg-white rounded-2xl py-8 flex items-center justify-center shadow-xs border border-[#dce2db] transition-transform hover:scale-[1.02]"
                >
                  <span className="text-4xl font-black text-[#1e4033] tracking-tight">
                    {ord.orderNumber}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Right Panel: 픽업 가능 */}
        <section className="bg-[#274f3e] text-white rounded-3xl p-7 flex flex-col shadow-md">
          {/* Header */}
          <div className="flex items-center gap-3 pb-6">
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h3 className="text-2xl font-black text-white">픽업 가능</h3>
            <span className="text-xs font-bold text-emerald-200 ml-auto">
              {readyOrders.length}건
            </span>
          </div>

          {/* Big Numbers Grid */}
          {readyOrders.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-emerald-100/60 font-medium">
              호출 대기 중인 주문이 없습니다.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-5 flex-1 items-center">
              {readyOrders.map((ord, idx) => {
                const isLatest = ord.id === latestReadyId || idx === readyOrders.length - 1;

                return (
                  <div
                    key={ord.id}
                    className={`relative rounded-3xl py-12 flex flex-col items-center justify-center transition-all ${
                      isLatest
                        ? 'border-2 border-[#fef3c7] bg-white/10 shadow-xl'
                        : 'bg-white/10'
                    }`}
                  >
                    {isLatest && (
                      <div className="absolute top-3 right-3 text-[#fef3c7] flex gap-0.5">
                        <Sparkles className="w-5 h-5 animate-pulse" />
                      </div>
                    )}

                    <span className="text-6xl md:text-7xl font-black text-white tracking-tight">
                      {ord.orderNumber}
                    </span>

                    {isLatest && (
                      <div className="absolute -bottom-3.5 px-4 py-1 rounded-full bg-[#fef3c7] text-[#92400e] text-xs font-black shadow-md flex items-center gap-1">
                        <span>방금 완료</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* Bottom Bar matching screen_4.png */}
      <footer className="pt-6 flex items-center justify-center gap-2 text-stone-600 font-semibold text-sm">
        <Megaphone className="w-4 h-4 text-stone-500" />
        <span>픽업대에서 주문번호를 알려주세요</span>
      </footer>
    </div>
  );
}
