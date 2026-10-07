'use client';

import Link from 'next/link';
import { Coffee, LogIn, LogOut, ShieldCheck, User } from 'lucide-react';
import { useAuth } from '@/features/auth/AuthContext';
import { useRouter } from 'next/navigation';

interface CafeTopNavbarProps {
  activeTab?: 'order' | 'cart' | 'orders' | 'kitchen' | 'board' | 'manage' | 'sales' | 'members' | 'kiosk';
}

export function CafeTopNavbar({ activeTab }: CafeTopNavbarProps) {
  const { user, isAdmin, logout } = useAuth();
  const router = useRouter();

  // 1. 일반 고객 전용 메뉴 (주방, 관리자, 키오스크 메뉴 완전 숨김)
  const userNavItems = [
    { key: 'order', label: '주문하기', href: '/order' },
    { key: 'cart', label: '장바구니', href: '/cart' },
    { key: 'orders', label: '내 주문', href: '/orders' },
    { key: 'board', label: '주문 현황판', href: '/pickup-board' },
    { key: 'qr', label: '모바일 QR', href: '/qr' },
  ];

  // 2. 관리자 전용 전체 메뉴 (admin@gmail.com 로그인 시에만 노출)
  const adminNavItems = [
    { key: 'order', label: '주문하기', href: '/order' },
    { key: 'cart', label: '장바구니', href: '/cart' },
    { key: 'orders', label: '내 주문', href: '/orders' },
    { key: 'manage', label: '매장 관리', href: '/admin?tab=manage' },
    { key: 'sales', label: '매출 통계', href: '/admin?tab=sales' },
    { key: 'members', label: '신규 회원', href: '/admin/members' },
    { key: 'kitchen', label: '주방 KDS', href: '/kds' },
    { key: 'board', label: '현황판', href: '/pickup-board' },
    { key: 'kiosk', label: '키오스크', href: '/kiosk' },
    { key: 'qr', label: '모바일 QR', href: '/qr' },
  ];

  const navItems = isAdmin ? adminNavItems : userNavItems;

  const handleLogout = async () => {
    if (confirm('로그아웃 하시겠습니까?')) {
      await logout();
      router.push('/');
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-[#f7f6f0]/95 backdrop-blur-md border-b border-[#e8ece7] px-8 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#1e4033] flex items-center justify-center text-white shadow-2xs">
            <Coffee className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-extrabold text-[#191c1b] text-base tracking-tight">
                CAFE CORE
              </span>
            </div>
            <p className="text-[10px] text-stone-400 tracking-wider">카페 코어</p>
          </div>
        </Link>

        {/* Center Navigation Links: Hidden on mobile, shown on PC */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = activeTab === item.key;
            return (
              <Link
                key={item.key}
                href={item.href}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-[#dce5dd] text-[#1e4033]'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Info & Actions: Login info is always visible at the top */}
        <div className="flex items-center gap-2 md:gap-3">
          <div className="hidden md:flex items-center gap-1.5 text-xs font-bold text-[#1e4033]">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>송파점</span>
          </div>

          {user ? (
            <>
              <Link
                href="/profile"
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#e8ece7] hover:bg-[#dce5dd] text-stone-700 text-xs font-bold transition-colors cursor-pointer"
                title="내 정보 보기"
              >
                {isAdmin ? (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5 text-[#1e4033]" />
                    <span className="text-[#1e4033]">관리자</span>
                  </>
                ) : (
                  <>
                    <User className="w-3.5 h-3.5 text-stone-500" />
                    <span className="max-w-[80px] md:max-w-none truncate">{user.displayName}</span>
                  </>
                )}
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-stone-200 bg-white text-stone-700 text-xs font-semibold hover:bg-stone-50 transition cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">로그아웃</span>
              </button>
            </>
          ) : (
            <div className="flex items-center gap-1.5 md:gap-2">
              <Link
                href="/login"
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#1e4033] hover:bg-[#274f3e] text-white text-xs font-bold transition shadow-2xs"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>로그인</span>
              </Link>
              <Link
                href="/signup"
                className="hidden sm:inline px-3 py-1.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 text-xs font-bold transition shadow-2xs"
              >
                <span>회원가입</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
