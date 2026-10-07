'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useMobileCartStore } from '@/features/mobile-order/store/cartStore';
import { formatSimplePrice } from '@/lib/utils';
import { createOrderAction } from '@/features/order/actions';
import { saveOrderToLocalStorage } from '@/lib/storage/orderStorage';
import { CafeTopNavbar } from '@/components/CafeTopNavbar';
import { MobileFNB } from '@/components/MobileFNB';
import { useAuth } from '@/features/auth/AuthContext';
import {
  ArrowLeft,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  Store,
  Package,
  ChevronRight,
  Loader2,
  Coffee,
} from 'lucide-react';

export default function CartPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    items,
    orderType,
    tableNumber,
    customerNote,
    setOrderType,
    setCustomerNote,
    updateQuantity,
    removeItem,
    clearCart,
    getTotalAmount,
    getTotalCount,
  } = useMobileCartStore();

  const totalCount = getTotalCount();
  const totalAmount = getTotalAmount();

  const handleCheckout = async () => {
    if (totalCount === 0) return;

    try {
      setIsSubmitting(true);
      setErrorMessage(null);

      const res = await createOrderAction({
        orderSource: 'MOBILE',
        tableNumber: tableNumber || undefined,
        orderType,
        items,
        customerNote: customerNote.trim() || undefined,
        userId: user?.uid,
        userEmail: user?.email,
        customerName: user?.displayName,
      });

      if (!res.success) {
        setErrorMessage(res.error);
        setIsSubmitting(false);
        return;
      }

      // Save full order and ID to localStorage
      saveOrderToLocalStorage(res.data);

      clearCart();
      router.push(`/status/${res.data.id}`);
    } catch (err: any) {
      setErrorMessage(err.message || '주문 요청 중 오류가 발생했습니다.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f6f0] pb-32 flex flex-col font-sans">
      <div className="hidden md:block">
        <CafeTopNavbar activeTab="cart" />
      </div>

      <main className="flex-1 max-w-lg w-full mx-auto px-4 py-5">
        {/* Top Header */}
        <div className="flex items-center justify-between mb-4">
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
              <h1 className="text-xl font-black text-[#191c1b]">장바구니</h1>
              <p className="text-[11px] text-stone-500">
                담긴 메뉴를 확인하고 주문을 완료하세요
              </p>
            </div>
          </div>

          {items.length > 0 && (
            <button
              type="button"
              onClick={() => {
                if (confirm('장바구니를 모두 비우시겠습니까?')) {
                  clearCart();
                }
              }}
              className="text-xs text-stone-500 hover:text-rose-600 font-bold flex items-center gap-1 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>전체 비우기</span>
            </button>
          )}
        </div>

        {/* Empty State */}
        {items.length === 0 ? (
          <div className="bg-white rounded-3xl border border-[#e8ece7] p-10 text-center shadow-xs mt-6">
            <div className="w-16 h-16 rounded-full bg-[#f4f6f4] flex items-center justify-center text-stone-400 mx-auto mb-4">
              <ShoppingBag className="w-8 h-8 text-[#1e4033]" />
            </div>
            <h3 className="text-base font-bold text-stone-800 mb-1">
              장바구니가 비어 있습니다
            </h3>
            <p className="text-xs text-stone-500 mb-6">
              원하시는 음료와 디저트를 장바구니에 담아보세요!
            </p>
            <Link
              href="/order"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#1e4033] hover:bg-[#274f3e] text-white rounded-xl text-sm font-bold shadow-sm transition-all"
            >
              <Coffee className="w-4 h-4" />
              <span>메뉴 담으러 가기</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Order Type Toggle (매장 / 포장) */}
            <div className="bg-white rounded-2xl p-3 border border-[#e8ece7] shadow-xs">
              <span className="text-xs font-bold text-stone-500 block mb-2">
                이용 방법 선택
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setOrderType('HERE')}
                  className={`py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                    orderType === 'HERE'
                      ? 'bg-[#1e4033] text-white shadow-xs'
                      : 'bg-[#f4f6f4] text-stone-600 hover:bg-[#e8ece7]'
                  }`}
                >
                  <Store className="w-4 h-4" />
                  <span>매장 이용 {tableNumber ? `(테이블 ${tableNumber}번)` : ''}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setOrderType('TOGO')}
                  className={`py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                    orderType === 'TOGO'
                      ? 'bg-[#1e4033] text-white shadow-xs'
                      : 'bg-[#f4f6f4] text-stone-600 hover:bg-[#e8ece7]'
                  }`}
                >
                  <Package className="w-4 h-4" />
                  <span>포장하기 (테이크아웃)</span>
                </button>
              </div>
            </div>

            {/* Items List */}
            <div className="bg-white rounded-2xl p-4 border border-[#e8ece7] shadow-xs space-y-3.5">
              <div className="flex items-center justify-between border-b border-[#e8ece7] pb-2.5">
                <span className="text-xs font-black text-stone-700">
                  주문 항목 ({totalCount}개)
                </span>
                <Link
                  href="/order"
                  className="text-xs font-bold text-[#1e4033] hover:underline flex items-center"
                >
                  <span>+ 메뉴 추가</span>
                </Link>
              </div>

              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start justify-between py-2 border-b border-stone-100 last:border-0 last:pb-0"
                >
                  <div className="flex-1 pr-3">
                    <h4 className="font-bold text-stone-900 text-sm">
                      {item.menuName}
                    </h4>
                    {item.selectedOptions && item.selectedOptions.length > 0 && (
                      <p className="text-[11px] text-stone-400 mt-0.5 leading-relaxed">
                        {item.selectedOptions.map((o) => o.optionName).join(', ')}
                      </p>
                    )}
                    <p className="text-xs font-extrabold text-[#1e4033] mt-1.5">
                      {formatSimplePrice(item.itemTotal)}
                    </p>
                  </div>

                  {/* Quantity Controls & Delete */}
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="flex items-center border border-[#e8ece7] rounded-lg bg-stone-50 overflow-hidden">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-7 h-7 flex items-center justify-center text-stone-600 hover:bg-[#e8ece7] transition-colors"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-7 text-center font-bold text-xs text-stone-800">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-7 h-7 flex items-center justify-center text-stone-600 hover:bg-[#e8ece7] transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="w-7 h-7 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Customer Note */}
            <div className="bg-white rounded-2xl p-4 border border-[#e8ece7] shadow-xs">
              <label className="block text-xs font-bold text-stone-700 mb-1.5">
                바리스타에게 요청사항
              </label>
              <textarea
                value={customerNote}
                onChange={(e) => setCustomerNote(e.target.value)}
                placeholder="예: 얼음 적게 넣어주세요, 시럽 반만 넣어주세요"
                rows={2}
                maxLength={200}
                className="w-full text-xs p-3 rounded-xl border border-[#e8ece7] focus:outline-none focus:ring-2 focus:ring-[#1e4033] focus:border-transparent resize-none bg-[#fdfdfc]"
              />
            </div>

            {/* Price Summary */}
            <div className="bg-white rounded-2xl p-4 border border-[#e8ece7] shadow-xs space-y-2 text-xs">
              <div className="flex justify-between text-stone-500">
                <span>총 주문 수량</span>
                <span className="font-bold text-stone-800">{totalCount}잔</span>
              </div>
              <div className="flex justify-between text-stone-500">
                <span>상품 금액</span>
                <span className="font-bold text-stone-800">
                  {formatSimplePrice(totalAmount)}
                </span>
              </div>
              <div className="flex justify-between text-stone-500">
                <span>할인 금액</span>
                <span className="font-bold text-stone-800">0원</span>
              </div>
              <div className="border-t border-[#e8ece7] pt-2 flex justify-between items-baseline">
                <span className="font-extrabold text-stone-900 text-sm">
                  최종 결제 금액
                </span>
                <span className="font-black text-lg text-[#1e4033]">
                  {formatSimplePrice(totalAmount)}
                </span>
              </div>
            </div>

            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-bold text-red-600 text-center">
                {errorMessage}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Sticky Bottom Checkout Bar (when items exist) */}
      {items.length > 0 && (
        <div className="fixed bottom-16 inset-x-0 z-30 p-3 bg-gradient-to-t from-[#f7f6f0] via-[#f7f6f0]/95 to-transparent pointer-events-none">
          <div className="max-w-lg mx-auto pointer-events-auto">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleCheckout}
              className="w-full py-4 px-6 bg-[#1e4033] hover:bg-[#274f3e] disabled:opacity-50 text-white rounded-2xl font-black text-base shadow-lg flex items-center justify-between transition-transform active:scale-[0.98] cursor-pointer touch-manipulation"
            >
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5" />
                <span>총 {totalCount}개 주문하기</span>
              </div>
              <div className="flex items-center gap-1.5">
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>주문 처리 중...</span>
                  </>
                ) : (
                  <>
                    <span>{formatSimplePrice(totalAmount)}</span>
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Persistent Mobile Bottom Navigation Bar (FNB) */}
      <MobileFNB activeTab="cart" />
    </div>
  );
}
