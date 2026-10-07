'use client';

import { useState, useEffect } from 'react';
import { Category, MenuItem } from '@/types/cafe';
import { useMobileCartStore } from '../store/cartStore';
import { MobileMenuItemCard } from './MobileMenuItemCard';
import { MobileOptionSheet } from './MobileOptionSheet';
import { MobileCartDrawer } from './MobileCartDrawer';
import { useSSE } from '@/lib/sse/useSSE';
import { Coffee, Upload, X, ShoppingBag, Receipt, LogIn, User } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/features/auth/AuthContext';
import { MobileFNB } from '@/components/MobileFNB';

interface MobileOrderViewProps {
  categories: Category[];
  initialMenuItems: MenuItem[];
  tableNumber?: string;
}

export function MobileOrderView({
  categories,
  initialMenuItems,
  tableNumber,
}: MobileOrderViewProps) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>(initialMenuItems);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showPwaBanner, setShowPwaBanner] = useState<boolean>(true);

  const {
    selectedMenuForOption,
    openOptionSheet,
    closeOptionSheet,
    setTableNumber,
    getTotalCount,
  } = useMobileCartStore();

  const { user, isAdmin, logout } = useAuth();
  const totalCount = getTotalCount();

  useEffect(() => {
    if (tableNumber) {
      setTableNumber(tableNumber);
    }
  }, [tableNumber, setTableNumber]);

  // Real-time update for menu items (e.g. when manager marks sold out)
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

  return (
    <div className="min-h-screen bg-[#f7f6f0] pb-28 max-w-lg md:max-w-4xl mx-auto shadow-sm flex flex-col">
      {/* Top Header: Brand only on mobile, hidden on PC where CafeTopNavbar is shown */}
      <header className="sticky top-0 z-30 bg-[#f7f6f0]/95 backdrop-blur-md px-5 pt-4 pb-3 md:hidden">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 hover:opacity-85 transition-opacity">
            <div className="w-10 h-10 rounded-full bg-[#1e4033] flex items-center justify-center text-white shadow-sm">
              <Coffee className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-[#191c1b] text-base tracking-tight">
                  CAFE CORE
                </span>
                <span className="text-xs text-stone-400">|</span>
                <span className="text-xs font-semibold text-stone-600">송파점</span>
              </div>
              <p className="text-[10px] text-stone-400 tracking-wider">카페 코어</p>
            </div>
          </Link>

          {/* Right: Table info & User Login Info */}
          <div className="flex items-center gap-2">
            {tableNumber && (
              <span className="px-2 py-0.5 rounded-full bg-[#e8ece7] text-[#1e4033] text-[11px] font-bold">
                {tableNumber}번 테이블
              </span>
            )}

            {user ? (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white border border-[#e8ece7] text-xs font-bold shadow-2xs">
                {isAdmin ? (
                  <span className="text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded text-[10px] font-black">
                    관리자
                  </span>
                ) : (
                  <User className="w-3.5 h-3.5 text-[#1e4033]" />
                )}
                <Link
                  href="/profile"
                  className="text-[#191c1b] max-w-[80px] truncate hover:underline"
                >
                  {user.displayName}님
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('로그아웃 하시겠습니까?')) {
                      logout();
                    }
                  }}
                  className="text-[10px] text-stone-400 hover:text-stone-700 ml-0.5 underline cursor-pointer"
                >
                  로그아웃
                </button>
              </div>
            ) : (
              <Link
                href="/login?redirect=/order"
                className="flex items-center gap-1 px-3 py-1 rounded-xl bg-[#1e4033] text-white text-xs font-bold shadow-2xs hover:bg-[#274f3e] transition-colors"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>로그인</span>
              </Link>
            )}
          </div>
        </div>

        {tableNumber && (
          <div className="mt-2.5 px-3 py-1.5 rounded-xl bg-[#e8ece7] text-[#1e4033] text-xs font-bold flex items-center justify-between">
            <span>테이블 주문: {tableNumber}번 테이블</span>
            <span className="text-[11px] font-normal text-stone-600">자리에 앉아 바로 주문</span>
          </div>
        )}
      </header>

      <main className="flex-1 px-5 space-y-5">
        {/* PWA Install Banner */}
        {showPwaBanner && (
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#e8ece7] border border-[#dce2db] text-[#191c1b] shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/80 flex items-center justify-center text-[#1e4033] shadow-2xs shrink-0">
                <Upload className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-xs leading-tight">홈 화면에 추가</p>
                <p className="text-[11px] text-[#6f7873] mt-0.5">더 빠르고 편리하게 이용하세요.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowPwaBanner(false)}
              className="text-stone-400 hover:text-stone-600 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Hero Banner matching screen_1.png */}
        <div className="relative overflow-hidden rounded-3xl bg-[#e2eae0] p-6 shadow-xs border border-[#d6dfd4] flex items-center justify-between">
          <div className="z-10 space-y-2 max-w-[200px]">
            <h2 className="text-2xl font-black text-[#1e4033] leading-tight">
              오늘의 한 잔,<br />
              기다림은 가볍게.
            </h2>
            <p className="text-xs text-stone-600 leading-relaxed font-medium">
              좋은 커피가<br />
              좋은 하루를 만듭니다.
            </p>
          </div>

          <div className="relative shrink-0 flex flex-col items-center">
            <div className="relative w-28 h-36">
              <Image
                src="/images/latte.png"
                alt="오늘의 커피"
                fill
                sizes="112px"
                className="object-contain drop-shadow-md"
                priority
              />
            </div>
            <span className="text-[10px] font-serif italic text-[#1e4033] mt-1">
              좋은 하루, 좋은 커피
            </span>
          </div>
        </div>

        {/* Section Heading */}
        <div>
          <h2 className="text-2xl font-black text-[#191c1b] tracking-tight">
            어떤 한 잔을 드릴까요?
          </h2>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 -mx-1 px-1">
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`shrink-0 px-5 py-2.5 rounded-full text-xs font-bold transition-colors cursor-pointer touch-manipulation active:opacity-80 ${
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
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`shrink-0 px-5 py-2.5 rounded-full text-xs font-bold transition-colors cursor-pointer touch-manipulation active:opacity-80 ${
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

        {/* 2-Column Menu Grid matching screen_1.png */}
        <div className="grid grid-cols-2 gap-3.5">
          {filteredItems.length === 0 ? (
            <div className="col-span-2 py-16 text-center text-stone-400 text-sm">
              해당 카테고리에 메뉴가 없습니다.
            </div>
          ) : (
            filteredItems.map((menu) => (
              <MobileMenuItemCard
                key={menu.id}
                menu={menu}
                onSelect={openOptionSheet}
              />
            ))
          )}
        </div>
      </main>

      {/* Option Sheet Modal */}
      <MobileOptionSheet
        menu={selectedMenuForOption}
        onClose={closeOptionSheet}
      />

      {/* Floating Cart Bar & Checkout Drawer */}
      <MobileCartDrawer />

      {/* Persistent Mobile Bottom Navigation Bar (FNB) */}
      <MobileFNB activeTab="order" />
    </div>
  );
}
