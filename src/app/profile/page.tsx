'use client';

import { useAuth } from '@/features/auth/AuthContext';
import { CafeTopNavbar } from '@/components/CafeTopNavbar';
import { MobileFNB } from '@/components/MobileFNB';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  User,
  Mail,
  Phone,
  Calendar,
  ShieldCheck,
  Receipt,
  ShoppingBag,
  Coffee,
  LogOut,
  LogIn,
  ChevronRight,
  LayoutDashboard,
  Users,
  Tv,
} from 'lucide-react';

export default function ProfilePage() {
  const { user, isAdmin, isLoading, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    if (confirm('정말 로그아웃 하시겠습니까?')) {
      await logout();
      router.push('/');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f7f6f0] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-3 border-[#1e4033] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-stone-500 font-semibold">회원 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f6f0] pb-28 md:pb-12 flex flex-col font-sans">
      {/* PC Top Navbar */}
      <div className="hidden md:block">
        <CafeTopNavbar />
      </div>

      <main className="flex-1 max-w-lg w-full mx-auto px-4 py-6">
        <h1 className="text-2xl font-black text-[#191c1b] mb-5 tracking-tight">내 정보</h1>

        {user ? (
          <div className="space-y-4">
            {/* User Profile Card */}
            <div className="bg-white rounded-3xl border border-[#e8ece7] p-5 shadow-xs">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-[#1e4033] text-white flex items-center justify-center text-2xl font-black shadow-sm shrink-0">
                  {user.displayName ? user.displayName.slice(0, 1) : <User className="w-8 h-8" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-black text-[#191c1b] truncate">
                      {user.displayName}
                    </h2>
                    {isAdmin ? (
                      <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-black shrink-0 flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" />
                        관리자
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold shrink-0">
                        일반 회원
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-stone-500 truncate mt-0.5 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                    <span>{user.email}</span>
                  </p>
                </div>
              </div>

              {/* Detail fields */}
              <div className="mt-5 pt-4 border-t border-[#f0f3ef] space-y-2.5 text-xs">
                {user.phoneNumber && (
                  <div className="flex items-center justify-between text-stone-600">
                    <span className="flex items-center gap-2 text-stone-400">
                      <Phone className="w-3.5 h-3.5" />
                      연락처
                    </span>
                    <span className="font-semibold text-stone-800">{user.phoneNumber}</span>
                  </div>
                )}

                <div className="flex items-center justify-between text-stone-600">
                  <span className="flex items-center gap-2 text-stone-400">
                    <Calendar className="w-3.5 h-3.5" />
                    가입일
                  </span>
                  <span className="font-semibold text-stone-800">
                    {user.createdAt
                      ? new Date(user.createdAt).toLocaleDateString('ko-KR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })
                      : '기본 등록'}
                  </span>
                </div>
              </div>
            </div>

            {/* Admin Quick Links (if Admin) */}
            {isAdmin && (
              <div className="bg-amber-50/70 rounded-3xl border border-amber-200/80 p-4 shadow-xs">
                <div className="flex items-center gap-2 text-amber-900 font-bold text-xs mb-3 px-1">
                  <ShieldCheck className="w-4 h-4 text-amber-700" />
                  <span>관리자 전용 메뉴 바로가기</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/admin"
                    className="p-3 bg-white rounded-2xl border border-amber-100 flex items-center gap-2.5 text-stone-800 hover:bg-amber-50/50 transition-colors"
                  >
                    <LayoutDashboard className="w-4 h-4 text-amber-700 shrink-0" />
                    <span className="text-xs font-bold truncate">매장 대시보드</span>
                  </Link>

                  <Link
                    href="/admin/members"
                    className="p-3 bg-white rounded-2xl border border-amber-100 flex items-center gap-2.5 text-stone-800 hover:bg-amber-50/50 transition-colors"
                  >
                    <Users className="w-4 h-4 text-amber-700 shrink-0" />
                    <span className="text-xs font-bold truncate">신규 회원 승인</span>
                  </Link>

                  <Link
                    href="/kds"
                    className="p-3 bg-white rounded-2xl border border-amber-100 flex items-center gap-2.5 text-stone-800 hover:bg-amber-50/50 transition-colors"
                  >
                    <Tv className="w-4 h-4 text-amber-700 shrink-0" />
                    <span className="text-xs font-bold truncate">주방 KDS</span>
                  </Link>

                  <Link
                    href="/pickup-board"
                    className="p-3 bg-white rounded-2xl border border-amber-100 flex items-center gap-2.5 text-stone-800 hover:bg-amber-50/50 transition-colors"
                  >
                    <Coffee className="w-4 h-4 text-amber-700 shrink-0" />
                    <span className="text-xs font-bold truncate">주문 현황판</span>
                  </Link>
                </div>
              </div>
            )}

            {/* Quick Navigation Menu List */}
            <div className="bg-white rounded-3xl border border-[#e8ece7] overflow-hidden shadow-xs">
              <Link
                href="/orders"
                className="flex items-center justify-between p-4 hover:bg-stone-50 transition-colors border-b border-[#f0f3ef]"
              >
                <div className="flex items-center gap-3 text-stone-800">
                  <div className="w-9 h-9 rounded-full bg-[#f4f6f4] flex items-center justify-center text-[#1e4033]">
                    <Receipt className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-sm">내 주문 내역</span>
                    <p className="text-[11px] text-stone-400">주문 현황 및 과거 영수증 조회</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-stone-400" />
              </Link>

              <Link
                href="/cart"
                className="flex items-center justify-between p-4 hover:bg-stone-50 transition-colors border-b border-[#f0f3ef]"
              >
                <div className="flex items-center gap-3 text-stone-800">
                  <div className="w-9 h-9 rounded-full bg-[#f4f6f4] flex items-center justify-center text-[#1e4033]">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-sm">장바구니 확인</span>
                    <p className="text-[11px] text-stone-400">담아둔 메뉴 주문하기</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-stone-400" />
              </Link>

              <Link
                href="/order"
                className="flex items-center justify-between p-4 hover:bg-stone-50 transition-colors"
              >
                <div className="flex items-center gap-3 text-stone-800">
                  <div className="w-9 h-9 rounded-full bg-[#f4f6f4] flex items-center justify-center text-[#1e4033]">
                    <Coffee className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-sm">음료 주문하기</span>
                    <p className="text-[11px] text-stone-400">신선한 스페셜티 메뉴 둘러보기</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-stone-400" />
              </Link>
            </div>

            {/* Logout Action */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleLogout}
                className="w-full py-3.5 px-4 rounded-2xl bg-white border border-red-200 text-red-600 hover:bg-red-50 text-sm font-bold flex items-center justify-center gap-2 transition-colors shadow-2xs cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>로그아웃</span>
              </button>
            </div>
          </div>
        ) : (
          /* Not Logged In State */
          <div className="bg-white rounded-3xl border border-[#e8ece7] p-8 text-center shadow-xs">
            <div className="w-16 h-16 rounded-full bg-[#f4f6f4] text-[#1e4033] flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8" />
            </div>

            <h2 className="text-lg font-bold text-stone-900 mb-1">로그인이 필요합니다</h2>
            <p className="text-xs text-stone-500 mb-6 leading-relaxed">
              로그인하시면 주문 내역 확인, 테이블 스마트오더,
              <br />
              적립 및 회원 혜택을 이용하실 수 있습니다.
            </p>

            <div className="space-y-2.5 max-w-xs mx-auto">
              <Link
                href="/login?redirect=/profile"
                className="w-full py-3 px-4 bg-[#1e4033] hover:bg-[#274f3e] text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 shadow-xs transition-colors"
              >
                <LogIn className="w-4 h-4" />
                <span>로그인하기</span>
              </Link>

              <Link
                href="/signup"
                className="w-full py-3 px-4 bg-white hover:bg-stone-50 border border-stone-200 text-stone-700 font-bold rounded-xl text-sm flex items-center justify-center gap-2 transition-colors"
              >
                <span>간편 회원가입</span>
              </Link>
            </div>
          </div>
        )}
      </main>

      {/* Persistent Mobile Bottom Navigation Bar (FNB) */}
      <MobileFNB activeTab="profile" />
    </div>
  );
}
