'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useKioskCartStore } from '../store/kioskCartStore';
import { createOrderAction } from '@/features/order/actions';
import { formatSimplePrice } from '@/lib/utils';
import { CreditCard, Smartphone, Loader2, CheckCircle2, X } from 'lucide-react';

interface KioskPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function KioskPaymentModal({ isOpen, onClose }: KioskPaymentModalProps) {
  const router = useRouter();
  const [step, setStep] = useState<'SELECT' | 'PROCESSING' | 'SUCCESS'>('SELECT');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { items, orderType, getTotalAmount, clearCart } = useKioskCartStore();
  const totalAmount = getTotalAmount();

  useEffect(() => {
    if (isOpen) {
      setStep('SELECT');
      setErrorMessage(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleStartPayment = async (method: 'CARD' | 'PAY') => {
    setStep('PROCESSING');
    setErrorMessage(null);

    // Simulate 2s card terminal communication
    setTimeout(async () => {
      try {
        const res = await createOrderAction({
          orderSource: 'KIOSK',
          orderType,
          items,
        });

        if (!res.success) {
          setErrorMessage(res.error);
          setStep('SELECT');
          return;
        }

        setStep('SUCCESS');
        setTimeout(() => {
          clearCart();
          onClose();
          router.push(`/kiosk/complete?orderId=${res.data.id}`);
        }, 800);
      } catch (err: any) {
        setErrorMessage(err.message || '결제 승인 처리 중 에러가 발생했습니다.');
        setStep('SELECT');
      }
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-6 animate-fade-in">
      <div className="relative w-full max-w-lg bg-white rounded-3xl p-8 shadow-2xl text-center">
        {step !== 'PROCESSING' && (
          <button
            onClick={onClose}
            className="absolute top-6 right-6 w-10 h-10 rounded-xl bg-stone-100 text-stone-500 flex items-center justify-center hover:bg-stone-200"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-semibold">
            {errorMessage}
          </div>
        )}

        {step === 'SELECT' && (
          <div className="space-y-6">
            <div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-100 text-amber-800">
                결제 방법 선택
              </span>
              <h3 className="text-2xl font-black text-stone-900 mt-2">
                결제하실 수단을 선택해 주세요
              </h3>
              <p className="text-3xl font-black text-amber-900 mt-3">
                {formatSimplePrice(totalAmount)}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <button
                type="button"
                onClick={() => handleStartPayment('CARD')}
                className="flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-stone-200 hover:border-amber-700 hover:bg-amber-50/50 transition-all group active:scale-95"
              >
                <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <CreditCard className="w-8 h-8" />
                </div>
                <span className="text-base font-extrabold text-stone-900">
                  신용 / 체크카드
                </span>
                <span className="text-xs text-stone-500 mt-1">IC칩 삽입</span>
              </button>

              <button
                type="button"
                onClick={() => handleStartPayment('PAY')}
                className="flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-stone-200 hover:border-amber-700 hover:bg-amber-50/50 transition-all group active:scale-95"
              >
                <div className="w-16 h-16 rounded-2xl bg-sky-100 text-sky-800 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Smartphone className="w-8 h-8" />
                </div>
                <span className="text-base font-extrabold text-stone-900">
                  간편 결제
                </span>
                <span className="text-xs text-stone-500 mt-1">삼성/애플페이</span>
              </button>
            </div>
          </div>
        )}

        {step === 'PROCESSING' && (
          <div className="py-8 space-y-6">
            <div className="w-20 h-20 rounded-full bg-[#e8ece7] text-[#1e4033] flex items-center justify-center mx-auto animate-pulse">
              <Loader2 className="w-10 h-10 animate-spin" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-stone-900">
                IC 카드를 투입구에 꽂아주세요
              </h3>
              <p className="text-sm text-stone-500 mt-2">
                결제가 완료될 때까지 카드를 뽑지 마세요...
              </p>
            </div>
            <div className="p-3 bg-[#e8ece7] rounded-xl text-xs font-semibold text-[#1e4033]">
              결제 금액: {formatSimplePrice(totalAmount)}
            </div>
          </div>
        )}

        {step === 'SUCCESS' && (
          <div className="py-8 space-y-4">
            <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-black text-stone-900">
              결제가 완료되었습니다!
            </h3>
            <p className="text-sm text-stone-500">
              주문표를 출력하고 주문 번호를 발급합니다...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
