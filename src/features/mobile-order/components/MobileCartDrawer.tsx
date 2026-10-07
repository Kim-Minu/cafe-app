'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useMobileCartStore } from '../store/cartStore';
import { formatSimplePrice } from '@/lib/utils';
import { createOrderAction } from '@/features/order/actions';
import { saveOrderToLocalStorage } from '@/lib/storage/orderStorage';
import { useAuth } from '@/features/auth/AuthContext';
import { ShoppingBag, X, Plus, Minus, Trash2, Store, Package, Loader2, ChevronRight } from 'lucide-react';

export function MobileCartDrawer() {
  const router = useRouter();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
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

  if (totalCount === 0) return null;

  const handleCheckout = async () => {
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
      setIsOpen(false);
      router.push(`/status/${res.data.id}`);
    } catch (err: any) {
      setErrorMessage(err.message || '주문 요청 중 오류가 발생했습니다.');
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Sticky Bottom Bar (Matching s0_bottom.png) */}
      <div className="fixed bottom-16 inset-x-0 z-30 px-3 py-2 bg-gradient-to-t from-[#f7f6f0] via-[#f7f6f0]/95 to-transparent pointer-events-none">
        <div className="max-w-lg mx-auto bg-white rounded-2xl border border-[#e8ece7] shadow-xl p-3 flex items-center justify-between pointer-events-auto">
          <Link
            href="/cart"
            className="flex items-center gap-3 hover:opacity-90 transition-opacity cursor-pointer touch-manipulation active:opacity-80"
          >
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-[#f4f6f4] flex items-center justify-center text-[#1e4033]">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <span className="absolute -top-1 -right-1 bg-[#1e4033] text-white text-[11px] font-black rounded-full w-5 h-5 flex items-center justify-center">
                {totalCount}
              </span>
            </div>
            <div>
              <div className="font-bold text-[#191c1b] text-base leading-tight">
                {totalCount}잔 · {formatSimplePrice(totalAmount)}
              </div>
              <div className="text-[12px] text-[#1e4033] font-bold flex items-center gap-0.5 mt-0.5">
                <span>장바구니 보기</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <Link
              href="/orders"
              className="text-xs font-bold text-stone-500 hover:text-stone-800 px-2 py-1 cursor-pointer touch-manipulation active:opacity-80"
            >
              내 주문
            </Link>
            <Link
              href="/cart"
              className="flex items-center gap-1.5 px-5 py-3 bg-[#1e4033] hover:bg-[#274f3e] text-white rounded-xl font-bold text-sm shadow-sm transition-opacity active:opacity-80 cursor-pointer touch-manipulation"
            >
              <span>주문하기</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Full Checkout Sheet Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-xs animate-fade-in">
          <button
            type="button"
            aria-label="닫기"
            className="absolute inset-0 w-full h-full bg-transparent border-0 cursor-pointer"
            onClick={() => !isSubmitting && setIsOpen(false)}
          />

          <div className="relative z-10 w-full max-w-lg rounded-t-3xl bg-white p-5 shadow-2xl max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#e8ece7] pb-3">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-[#1e4033]" />
                <h3 className="text-lg font-bold text-[#191c1b]">
                  주문 내역 ({totalCount}개)
                </h3>
                {tableNumber && (
                  <span className="text-xs bg-[#e8ece7] text-[#1e4033] font-bold px-2.5 py-0.5 rounded-full">
                    테이블 {tableNumber}번
                  </span>
                )}
              </div>
              <button
                onClick={() => setIsOpen(false)}
                disabled={isSubmitting}
                className="rounded-full p-2 text-stone-400 hover:bg-stone-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="my-2 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
                {errorMessage}
              </div>
            )}

            {/* Body */}
            <div className="overflow-y-auto py-3 space-y-4 flex-1 pr-1">
              {/* Order Type Toggle */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-600">이용 방식</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setOrderType('HERE')}
                    className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-semibold transition-all ${
                      orderType === 'HERE'
                        ? 'border-[#1e4033] bg-[#e8ece7] text-[#1e4033] ring-1 ring-[#1e4033]'
                        : 'border-[#e8ece7] text-stone-600'
                    }`}
                  >
                    <Store className="w-4 h-4" />
                    <span>매장 이용 {tableNumber ? `(테이블 ${tableNumber})` : ''}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrderType('TOGO')}
                    className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-semibold transition-all ${
                      orderType === 'TOGO'
                        ? 'border-[#1e4033] bg-[#e8ece7] text-[#1e4033] ring-1 ring-[#1e4033]'
                        : 'border-[#e8ece7] text-stone-600'
                    }`}
                  >
                    <Package className="w-4 h-4" />
                    <span>포장 (테이크아웃)</span>
                  </button>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-2.5 divide-y divide-[#e8ece7]">
                {items.map((item) => (
                  <div key={item.id} className="pt-2.5 flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="font-bold text-sm text-[#191c1b]">
                        {item.menuName}
                      </div>
                      {item.selectedOptions.length > 0 && (
                        <p className="text-xs text-[#6f7873] mt-0.5">
                          {item.selectedOptions.map((o) => o.optionName).join(', ')}
                        </p>
                      )}
                      <div className="text-sm font-semibold text-[#1e4033] mt-1">
                        {formatSimplePrice(item.itemTotal)}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-center">
                      <div className="flex items-center border border-[#e8ece7] rounded-lg overflow-hidden bg-[#f7f6f0]">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-1.5 hover:bg-stone-200 transition-colors"
                        >
                          <Minus className="w-3.5 h-3.5 text-stone-600" />
                        </button>
                        <span className="w-7 text-center text-xs font-bold text-[#191c1b]">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-1.5 hover:bg-stone-200 transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5 text-stone-600" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="p-1.5 text-stone-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                        aria-label="메뉴 삭제"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Customer Note */}
              <div className="space-y-1.5 pt-2">
                <label className="text-xs font-semibold text-stone-600">
                  요청 사항 (선택)
                </label>
                <input
                  type="text"
                  value={customerNote}
                  onChange={(e) => setCustomerNote(e.target.value)}
                  placeholder="예: 픽업대에서 호출해 주세요, 덜 달게 해주세요"
                  maxLength={100}
                  className="w-full text-xs p-3 rounded-xl border border-[#e8ece7] focus:outline-none focus:ring-1 focus:ring-[#1e4033]"
                />
              </div>
            </div>

            {/* Footer Summary & Action */}
            <div className="border-t border-[#e8ece7] pt-4 mt-2 space-y-3">
              <div className="flex items-center justify-between text-base">
                <span className="font-medium text-stone-600">총 결제 금액</span>
                <span className="text-xl font-black text-[#1e4033]">
                  {formatSimplePrice(totalAmount)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  disabled={isSubmitting}
                  className="py-3 px-4 rounded-xl border border-[#e8ece7] font-semibold text-stone-600 text-sm hover:bg-stone-50"
                >
                  메뉴 더 담기
                </button>
                <button
                  type="button"
                  onClick={handleCheckout}
                  disabled={isSubmitting}
                  className="py-3 px-4 rounded-xl bg-[#1e4033] hover:bg-[#274f3e] text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>주문 전송 중...</span>
                    </>
                  ) : (
                    <span>결제 및 주문완료</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
