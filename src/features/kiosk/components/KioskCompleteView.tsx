'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Order } from '@/types/cafe';
import { formatSimplePrice } from '@/lib/utils';
import { CheckCircle2, QrCode, ArrowRight, Store, Package } from 'lucide-react';
import Link from 'next/link';

interface KioskCompleteViewProps {
  order: Order;
}

export function KioskCompleteView({ order }: KioskCompleteViewProps) {
  const router = useRouter();
  const [countdown, setCountdown] = useState(15);
  const [origin, setOrigin] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setOrigin(window.location.origin);
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push('/kiosk');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  const trackingUrl = `${origin}/status/${order.id}`;
  // Use a reliable QR Code API generator image
  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
    trackingUrl
  )}`;

  return (
    <div className="h-screen w-screen bg-stone-100 flex items-center justify-center p-8 select-none font-sans">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl p-10 flex flex-col md:flex-row items-center justify-between gap-10 border border-stone-200">
        {/* Left: Order Number & Message */}
        <div className="flex-1 space-y-6 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs">
            <CheckCircle2 className="w-4 h-4" />
            <span>주문이 성공적으로 접수되었습니다</span>
          </div>

          <div>
            <span className="text-sm font-bold text-stone-400 block mb-1">
              고객님의 주문 번호
            </span>
            <div className="text-7xl font-black text-amber-900 tracking-tight">
              #{order.orderNumber}
            </div>
            <div className="flex items-center gap-2 mt-2 text-stone-500 font-semibold text-sm">
              {order.orderType === 'HERE' ? (
                <span className="flex items-center gap-1.5 bg-stone-100 px-3 py-1 rounded-lg">
                  <Store className="w-4 h-4" /> 매장 식사
                </span>
              ) : (
                <span className="flex items-center gap-1.5 bg-stone-100 px-3 py-1 rounded-lg">
                  <Package className="w-4 h-4" /> 포장 주문
                </span>
              )}
              <span className="text-stone-300">•</span>
              <span>총 {formatSimplePrice(order.totalAmount)}</span>
            </div>
          </div>

          <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200/80 text-xs text-stone-600 space-y-1">
            <p className="font-bold text-stone-800">주문 내역 안내</p>
            <p className="line-clamp-2">
              {order.items.map((i) => `${i.menuName} x${i.quantity}`).join(', ')}
            </p>
            <p className="text-stone-400 text-[11px] pt-1">
              음료가 준비되면 매장 전광판에서 주문 번호 #{order.orderNumber}을 호출해 드립니다.
            </p>
          </div>

          <div className="pt-2 flex items-center gap-4">
            <Link
              href="/kiosk"
              className="px-8 py-4 bg-amber-800 hover:bg-amber-900 text-white rounded-2xl font-black text-base shadow-md inline-flex items-center gap-2 transition-colors"
            >
              <span>처음 화면으로 ({countdown}초)</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>

        {/* Right: Phone Tracking QR Code */}
        <div className="shrink-0 bg-amber-50/70 border-2 border-dashed border-amber-300 rounded-3xl p-6 text-center flex flex-col items-center max-w-xs shadow-xs">
          <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mb-3">
            <QrCode className="w-5 h-5" />
          </div>
          <h3 className="font-black text-stone-900 text-base mb-1">
            스마트폰으로 실시간 확인
          </h3>
          <p className="text-xs text-stone-500 mb-4 px-2 leading-relaxed">
            카메라로 아래 QR을 스캔하시면 자리에서 편안하게 제조 상태를 확인하실 수 있습니다.
          </p>

          <div className="w-44 h-44 bg-white p-2.5 rounded-2xl shadow-sm border border-stone-200">
            <img
              src={qrApiUrl}
              alt="주문 확인 QR 코드"
              className="w-full h-full object-contain"
            />
          </div>

          <span className="text-[11px] text-amber-800 font-bold mt-3">
            진동 및 픽업 호출 지원
          </span>
        </div>
      </div>
    </div>
  );
}
