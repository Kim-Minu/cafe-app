'use client';

import { useState } from 'react';
import { Category, MenuItem } from '@/types/cafe';
import { useKioskCartStore } from '../store/kioskCartStore';
import { KioskOptionModal } from './KioskOptionModal';
import { KioskPaymentModal } from './KioskPaymentModal';
import { formatSimplePrice } from '@/lib/utils';
import { useSSE } from '@/lib/sse/useSSE';
import {
  Coffee,
  Headphones,
  Home,
  Plus,
  Minus,
  X,
  ChevronRight,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface KioskViewProps {
  categories: Category[];
  initialMenuItems: MenuItem[];
}

export function KioskView({ categories, initialMenuItems }: KioskViewProps) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>(initialMenuItems);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [staffCalled, setStaffCalled] = useState(false);

  const {
    items,
    openOptionModal,
    closeOptionModal,
    selectedMenuForOption,
    updateQuantity,
    removeItem,
    clearCart,
    getTotalAmount,
    getTotalCount,
  } = useKioskCartStore();

  useSSE({
    onMessage: (msg) => {
      if (msg.type === 'MENU_UPDATED' && msg.data?.menuItems) {
        setMenuItems(msg.data.menuItems);
      }
    },
  });

  const filteredItems =
    selectedCategory === 'all'
      ? menuItems
      : menuItems.filter((item) => item.categoryId === selectedCategory);

  const totalAmount = getTotalAmount();
  const totalCount = getTotalCount();

  const handleCallStaff = () => {
    setStaffCalled(true);
    setTimeout(() => setStaffCalled(false), 3000);
  };

  return (
    <div className="min-h-screen bg-[#f7f6f0] flex flex-col justify-between p-6 max-w-4xl mx-auto font-sans select-none">
      {/* Top Header matching screen_2.png */}
      <header className="flex items-center justify-between pb-6">
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

        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="text-xs text-stone-400 hover:text-stone-700 px-3 py-2 rounded-xl hover:bg-stone-200/50"
          >
            허브 이동
          </Link>
          <button
            type="button"
            onClick={handleCallStaff}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-800 text-xs font-bold shadow-2xs hover:bg-stone-50 transition active:scale-95"
          >
            <Headphones className="w-4 h-4 text-stone-600" />
            <span>{staffCalled ? '호출 완료!' : '직원 호출'}</span>
          </button>
        </div>
      </header>

      {/* Main Title & Subtitle */}
      <div className="pb-4">
        <h2 className="text-3xl font-black text-[#191c1b] tracking-tight">
          어떤 한 잔을 드릴까요?
        </h2>
        <p className="text-sm text-stone-500 mt-1 font-medium">
          메뉴를 선택해 주세요.
        </p>
      </div>

      {/* Category Horizontal Pills */}
      <div className="flex items-center gap-2.5 pb-5">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`flex-1 py-3 px-4 rounded-2xl text-sm font-bold text-center transition-all ${
            selectedCategory === 'all'
              ? 'bg-[#1e4033] text-white shadow-xs'
              : 'bg-[#e8ece7] text-[#4a5550] hover:bg-[#d9e2db]'
          }`}
        >
          전체 메뉴
        </button>
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex-1 py-3 px-4 rounded-2xl text-sm font-bold text-center transition-all ${
                isSelected
                  ? 'bg-[#1e4033] text-white shadow-xs'
                  : 'bg-[#e8ece7] text-[#4a5550] hover:bg-[#d9e2db]'
              }`}
            >
              {cat.name}
            </button>
          );
        })}
      </div>

      {/* 2-Column Wide Menu Cards matching screen_2.png */}
      <div className="grid grid-cols-2 gap-4 flex-1">
        {filteredItems.map((menu) => (
          <div
            key={menu.id}
            onClick={() => !menu.isSoldOut && openOptionModal(menu)}
            className={`bg-white rounded-2xl border border-[#e8ece7] p-4 flex items-center justify-between shadow-xs transition-all hover:shadow-md cursor-pointer ${
              menu.isSoldOut ? 'opacity-50 pointer-events-none' : 'active:scale-[0.99]'
            }`}
          >
            {/* Left Drink Photo */}
            <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
              <Image
                src={menu.imageUrl}
                alt={menu.name}
                width={110}
                height={110}
                className="object-contain max-h-28 drop-shadow-sm"
                unoptimized
              />
            </div>

            {/* Right Info & 담기 Button */}
            <div className="flex flex-col items-end justify-between h-full pl-3 flex-1">
              <div className="text-right w-full">
                <h3 className="font-bold text-[#191c1b] text-base leading-snug">
                  {menu.name}
                </h3>
                <p className="font-semibold text-stone-900 text-sm mt-1">
                  {menu.basePrice.toLocaleString()}원
                </p>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (!menu.isSoldOut) openOptionModal(menu);
                }}
                className="mt-3 px-5 py-2 rounded-xl bg-[#d9e2db] hover:bg-[#c9d4cb] text-[#1e4033] font-bold text-xs shadow-2xs transition-all"
              >
                + 담기
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Persistent Bottom Cart matching screen_2.png */}
      <div className="mt-6 rounded-3xl bg-[#e8ece7] p-5 shadow-xs flex flex-col gap-4">
        {/* Cart Header */}
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-[#191c1b] text-base">선택한 메뉴</h3>
          <button
            type="button"
            onClick={clearCart}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-xl border border-stone-200 text-stone-700 text-xs font-semibold hover:bg-stone-50"
          >
            <Home className="w-3.5 h-3.5 text-stone-500" />
            <span>처음으로</span>
          </button>
        </div>

        {/* Selected Items Rows */}
        {items.length === 0 ? (
          <div className="py-6 text-center text-stone-400 text-sm font-medium">
            선택된 메뉴가 없습니다. 메뉴를 선택해 주세요.
          </div>
        ) : (
          <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
            {items.map((item) => {
              const isIce = item.selectedOptions.some(
                (o) => o.optionId === 'ice' || o.optionName.includes('ICE')
              );
              const isHot = item.selectedOptions.some(
                (o) => o.optionId === 'hot' || o.optionName.includes('HOT')
              );

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl p-3 flex items-center justify-between shadow-2xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative w-9 h-9 shrink-0 flex items-center justify-center bg-stone-50 rounded-lg">
                      <Coffee className="w-5 h-5 text-[#1e4033]" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-[#191c1b]">
                          {item.menuName} × {item.quantity}
                        </span>
                        {isIce && (
                          <span className="px-2 py-0.5 rounded-md bg-[#e0f2fe] text-[#0369a1] text-[11px] font-bold">
                            ICE
                          </span>
                        )}
                        {isHot && (
                          <span className="px-2 py-0.5 rounded-md bg-[#fee2e2] text-[#b91c1c] text-[11px] font-bold">
                            HOT
                          </span>
                        )}
                      </div>
                      {item.selectedOptions.filter((o) => o.groupId !== 'opt-temp').length > 0 && (
                        <p className="text-[11px] text-stone-400 mt-0.5">
                          {item.selectedOptions
                            .filter((o) => o.groupId !== 'opt-temp')
                            .map((o) => o.optionName)
                            .join(', ')}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {/* Quantity controls */}
                    <div className="flex items-center border border-stone-200 rounded-lg bg-stone-50">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="px-2.5 py-1 text-stone-600 hover:bg-stone-200"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-6 text-center text-xs font-bold text-stone-800">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="px-2.5 py-1 text-stone-600 hover:bg-stone-200"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="w-24 text-right font-bold text-sm text-[#191c1b]">
                      {item.itemTotal.toLocaleString()}원
                    </div>

                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="p-1 text-stone-400 hover:text-stone-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer Bar */}
        <div className="flex items-center justify-between pt-2 border-t border-[#d8e0d7]">
          <div className="flex items-baseline gap-6">
            <span className="font-bold text-lg text-[#191c1b]">총 {totalCount}잔</span>
            <span className="text-2xl font-black text-[#191c1b]">
              {totalAmount.toLocaleString()}원
            </span>
          </div>

          <button
            type="button"
            disabled={totalCount === 0}
            onClick={() => setIsPaymentOpen(true)}
            className="flex items-center gap-2 px-8 py-3.5 bg-[#1e4033] hover:bg-[#274f3e] disabled:opacity-40 text-white rounded-2xl font-bold text-base shadow-sm transition active:scale-95"
          >
            <span>결제하기</span>
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Option Selection Modal */}
      <KioskOptionModal
        menu={selectedMenuForOption}
        onClose={closeOptionModal}
      />

      {/* Payment Simulation Modal */}
      {isPaymentOpen && (
        <KioskPaymentModal
          isOpen={isPaymentOpen}
          onClose={() => setIsPaymentOpen(false)}
        />
      )}
    </div>
  );
}
