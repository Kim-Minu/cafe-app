'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMobileCartStore } from '@/features/mobile-order/store/cartStore';
import { useAuth } from '@/features/auth/AuthContext';
import { Home, Coffee, ShoppingBag, Receipt, User, ShieldCheck } from 'lucide-react';

interface MobileFNBProps {
  activeTab?: 'home' | 'order' | 'cart' | 'orders' | 'profile';
}

export function MobileFNB({ activeTab }: MobileFNBProps) {
  const pathname = usePathname();
  const { getTotalCount } = useMobileCartStore();
  const { user, isAdmin } = useAuth();
  const cartCount = getTotalCount();

  const currentTab =
    activeTab ||
    (pathname === '/'
      ? 'home'
      : pathname.startsWith('/order')
      ? 'order'
      : pathname.startsWith('/cart')
      ? 'cart'
      : pathname.startsWith('/orders')
      ? 'orders'
      : pathname.startsWith('/login') || pathname.startsWith('/signup') || pathname.startsWith('/profile')
      ? 'profile'
      : 'order');

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#e8ece7] shadow-lg md:hidden">
      <div className="max-w-lg mx-auto px-2 py-2 flex items-center justify-around">
        {/* Tab 0: Home */}
        <Link
          href="/"
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors cursor-pointer touch-manipulation active:opacity-75 ${
            currentTab === 'home'
              ? 'text-[#1e4033] font-bold'
              : 'text-stone-400 hover:text-stone-700'
          }`}
        >
          <div
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
              currentTab === 'home' ? 'bg-[#e8ece7]' : ''
            }`}
          >
            <Home className="w-5 h-5" />
          </div>
          <span className="text-[11px] mt-0.5">홈</span>
        </Link>

        {/* Tab 1: Menu Order */}
        <Link
          href="/order"
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors cursor-pointer touch-manipulation active:opacity-75 ${
            currentTab === 'order'
              ? 'text-[#1e4033] font-bold'
              : 'text-stone-400 hover:text-stone-700'
          }`}
        >
          <div
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
              currentTab === 'order' ? 'bg-[#e8ece7]' : ''
            }`}
          >
            <Coffee className="w-5 h-5" />
          </div>
          <span className="text-[11px] mt-0.5">주문</span>
        </Link>

        {/* Tab 2: Cart */}
        <Link
          href="/cart"
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors relative cursor-pointer touch-manipulation active:opacity-75 ${
            currentTab === 'cart'
              ? 'text-[#1e4033] font-bold'
              : 'text-stone-400 hover:text-stone-700'
          }`}
        >
          <div
            className={`w-9 h-9 rounded-full flex items-center justify-center relative transition-colors ${
              currentTab === 'cart' ? 'bg-[#e8ece7]' : ''
            }`}
          >
            <ShoppingBag className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#1e4033] text-white text-[10px] font-black rounded-full w-4 h-4 flex items-center justify-center animate-bounce-once">
                {cartCount}
              </span>
            )}
          </div>
          <span className="text-[11px] mt-0.5">장바구니</span>
        </Link>

        {/* Tab 3: My Orders */}
        <Link
          href="/orders"
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors cursor-pointer touch-manipulation active:opacity-75 ${
            currentTab === 'orders'
              ? 'text-[#1e4033] font-bold'
              : 'text-stone-400 hover:text-stone-700'
          }`}
        >
          <div
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
              currentTab === 'orders' ? 'bg-[#e8ece7]' : ''
            }`}
          >
            <Receipt className="w-5 h-5" />
          </div>
          <span className="text-[11px] mt-0.5">내 주문</span>
        </Link>

        {/* Tab 4: Profile / Login */}
        <Link
          href={user ? '/profile' : '/login?redirect=/profile'}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors cursor-pointer touch-manipulation active:opacity-75 ${
            currentTab === 'profile'
              ? 'text-[#1e4033] font-bold'
              : 'text-stone-400 hover:text-stone-700'
          }`}
        >
          <div
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
              currentTab === 'profile' ? 'bg-[#e8ece7]' : ''
            }`}
          >
            {isAdmin ? (
              <ShieldCheck className="w-5 h-5 text-amber-600" />
            ) : (
              <User className="w-5 h-5" />
            )}
          </div>
          <span className="text-[11px] mt-0.5">
            {user ? '내 정보' : '로그인'}
          </span>
        </Link>
      </div>
    </nav>
  );
}
