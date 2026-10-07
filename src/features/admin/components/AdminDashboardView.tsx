'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Category, MenuItem, Order } from '@/types/cafe';
import { UserProfile } from '@/types/auth';
import { toggleMenuItemSoldOutAction, cancelOrderAction } from '@/features/order/actions';
import { useSSE } from '@/lib/sse/useSSE';
import { CafeTopNavbar } from '@/components/CafeTopNavbar';
import { useAuth } from '@/features/auth/AuthContext';
import { fetchUsersFromFirestore } from '@/features/auth/firestore';
import {
  Coins,
  TrendingUp,
  RotateCcw,
  Coffee,
  Calendar,
  Download,
  Smartphone,
  Monitor,
  CheckCircle2,
  Lock,
  ChevronDown,
  Users,
  ShieldCheck,
  UserCheck,
  Clock,
  ArrowRight,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface AdminDashboardViewProps {
  initialCategories: Category[];
  initialMenuItems: MenuItem[];
  initialOrders: Order[];
  initialUsers: UserProfile[];
}

export function AdminDashboardView({
  initialCategories,
  initialMenuItems,
  initialOrders,
  initialUsers,
}: AdminDashboardViewProps) {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
  const initialTab =
    tabParam === 'manage'
      ? 'MANAGE'
      : tabParam === 'members'
      ? 'MEMBERS'
      : 'SALES';

  const { isAdmin, user, login, isLoading } = useAuth();

  const [categories] = useState<Category[]>(initialCategories);
  const [menuItems, setMenuItems] = useState<MenuItem[]>(initialMenuItems);
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [users, setUsers] = useState<UserProfile[]>(initialUsers);
  const [activeTab, setActiveTab] = useState<'SALES' | 'MANAGE' | 'MEMBERS'>(initialTab);
  const [selectedChannel, setSelectedChannel] = useState<'ALL' | 'MOBILE' | 'KIOSK'>('ALL');
  const [selectedDate, setSelectedDate] = useState<string>('2026.10.07');
  const [memberFilter, setMemberFilter] = useState<'TODAY' | 'ALL'>('TODAY');

  // Admin login inline form state if not authenticated
  const [adminEmail, setAdminEmail] = useState('admin@gmail.com');
  const [adminPassword, setAdminPassword] = useState('password1234');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Cloud Firestore 'users' 컬렉션 동기화
  useEffect(() => {
    if (activeTab === 'MEMBERS' && isAdmin) {
      fetchUsersFromFirestore().then((fbUsers) => {
        if (fbUsers && fbUsers.length > 0) {
          setUsers((prev) => {
            const map = new Map<string, UserProfile>();
            // 로컬/시드 유저 우선 등록
            prev.forEach((u) => map.set(u.email, u));
            // Firestore 유저로 최신화/추가
            fbUsers.forEach((u) => map.set(u.email, u));
            return Array.from(map.values()).sort(
              (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
          });
        }
      });
    }
  }, [activeTab, isAdmin]);

  // Real-time SSE updates
  useSSE({
    onMessage: (msg) => {
      if (msg.type === 'MENU_UPDATED' && msg.data?.menuItems) {
        setMenuItems(msg.data.menuItems);
      } else if (msg.type === 'ORDER_CREATED') {
        setOrders((prev) => [msg.data, ...prev]);
      } else if (
        msg.type === 'ORDER_STATUS_CHANGED' ||
        msg.type === 'ORDER_CANCELLED'
      ) {
        setOrders((prev) =>
          prev.map((o) => (o.id === msg.data.id ? msg.data : o))
        );
      } else if (msg.type === 'INIT') {
        if (msg.data?.orders) setOrders(msg.data.orders);
        if (msg.data?.menuItems) setMenuItems(msg.data.menuItems);
      }
    },
  });

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);
    const res = await login(adminEmail, adminPassword);
    setIsLoggingIn(false);
    if (!res.success) {
      setLoginError(res.error || '관리자 로그인에 실패했습니다.');
    }
  };

  const handleToggleSoldOut = async (menuId: string, currentSoldOut: boolean) => {
    const nextState = !currentSoldOut;
    setMenuItems((prev) =>
      prev.map((m) => (m.id === menuId ? { ...m, isSoldOut: nextState } : m))
    );
    const res = await toggleMenuItemSoldOutAction(menuId, nextState);
    if (!res.success) {
      alert(res.error);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    if (!confirm('이 주문을 취소/환불 처리하시겠습니까?')) return;
    const res = await cancelOrderAction(orderId);
    if (!res.success) {
      alert(res.error);
    }
  };

  const handleDownloadCSV = () => {
    const headers = ['주문번호', '주문경로', '상태', '주문금액', '주문시간'];
    const rows = orders.map((o) => [
      o.orderNumber,
      o.orderSource,
      o.status,
      o.totalAmount,
      new Date(o.createdAt).toLocaleString('ko-KR'),
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `cafecore_sales_${selectedDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter members by today
  const todayStr = new Date().toISOString().split('T')[0];
  const todayUsers = users.filter((u) => u.createdAt.startsWith(todayStr));
  const displayedUsers = memberFilter === 'TODAY' ? todayUsers : users;

  // Metrics computation (100% 실시간 주문 데이터 기반 계산, 더미 데이터 완전 제거)
  const validOrders = orders.filter((o) => o.status !== 'CANCELLED');
  const cancelledOrders = orders.filter((o) => o.status === 'CANCELLED');

  const totalPayment = validOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const refundAmount = cancelledOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const netRevenue = totalPayment;

  const totalOrdersCount = validOrders.length;
  const totalCupsCount = validOrders.reduce(
    (acc, o) => acc + o.items.reduce((s, it) => s + it.quantity, 0),
    0
  );

  // 음료별 실제 판매 집계 (순매출 및 수량 기준)
  const itemSalesMap = new Map<string, { name: string; amount: number; count: number; img: string }>();
  for (const o of validOrders) {
    for (const item of o.items) {
      const existing = itemSalesMap.get(item.menuItemId) || {
        name: item.menuName,
        amount: 0,
        count: 0,
        img: menuItems.find((m) => m.id === item.menuItemId)?.imageUrl || '/images/americano.png',
      };
      existing.amount += item.itemTotal;
      existing.count += item.quantity;
      itemSalesMap.set(item.menuItemId, existing);
    }
  }

  const sortedDrinkSales = Array.from(itemSalesMap.values()).sort((a, b) => b.amount - a.amount);
  const maxDrinkSalesAmount = sortedDrinkSales.length > 0 ? sortedDrinkSales[0].amount : 0;
  const drinkSales = sortedDrinkSales.map((item) => ({
    name: item.name,
    img: item.img,
    amount: item.amount,
    pct: maxDrinkSalesAmount > 0 ? Math.round((item.amount / maxDrinkSalesAmount) * 100) : 0,
    count: item.count,
  }));

  // 시간대별 실제 결제 금액 집계 (09시 ~ 21시)
  const hourlyAmounts: Record<string, number> = {};
  for (let h = 9; h <= 21; h++) {
    const key = `${h < 10 ? '0' : ''}${h}시`;
    hourlyAmounts[key] = 0;
  }

  for (const o of validOrders) {
    const orderDate = new Date(o.createdAt);
    const h = orderDate.getHours();
    const key = `${h < 10 ? '0' : ''}${h}시`;
    if (hourlyAmounts[key] !== undefined) {
      hourlyAmounts[key] += o.totalAmount;
    }
  }

  const maxHourlyAmount = Math.max(...Object.values(hourlyAmounts), 0);
  const hourlyData = Object.entries(hourlyAmounts).map(([hour, amount]) => ({
    hour,
    amount,
    height:
      maxHourlyAmount > 0 && amount > 0
        ? `${Math.max(10, Math.round((amount / maxHourlyAmount) * 100))}%`
        : '4%',
    highlight: maxHourlyAmount > 0 && amount === maxHourlyAmount,
  }));

  // 실제 주문 채널별 비율 계산
  const mobileCount = validOrders.filter((o) => o.orderSource === 'MOBILE').length;
  const kioskCount = validOrders.filter((o) => o.orderSource === 'KIOSK').length;
  const totalCh = mobileCount + kioskCount;
  const mobilePct = totalCh > 0 ? Math.round((mobileCount / totalCh) * 100) : 0;
  const kioskPct = totalCh > 0 ? 100 - mobilePct : 0;

  // Guard: If not admin, show Admin Authentication Guard as requested!
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#f7f6f0] flex flex-col font-sans select-none text-[#191c1b]">
        <CafeTopNavbar activeTab="manage" />

        <div className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-[#e8ece7] shadow-sm text-center">
            <div className="w-14 h-14 rounded-2xl bg-amber-100 text-[#1e4033] flex items-center justify-center mx-auto mb-4">
              <Lock className="w-7 h-7" />
            </div>

            <span className="text-xs font-black uppercase tracking-widest text-[#1e4033]">
              ADMIN ACCESS REQUIRED
            </span>
            <h2 className="text-2xl font-black text-[#191c1b] tracking-tight mt-1">
              관리자 전용 페이지입니다
            </h2>
            <p className="text-xs text-stone-500 font-medium mt-2 leading-relaxed">
              매장 관리 및 매출 통계는 총괄 관리자(admin@gmail.com) 계정으로 로그인한 경우에만 접근하실 수 있습니다.
            </p>

            {loginError && (
              <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-bold text-red-600">
                {loginError}
              </div>
            )}

            <form onSubmit={handleAdminLogin} className="mt-6 space-y-3 text-left">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  관리자 이메일
                </label>
                <input
                  type="email"
                  required
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm font-medium focus:outline-none focus:border-[#1e4033]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  비밀번호
                </label>
                <input
                  type="password"
                  required
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm font-medium focus:outline-none focus:border-[#1e4033]"
                />
              </div>

              <button
                type="submit"
                disabled={isLoggingIn || isLoading}
                className="w-full py-3 rounded-xl bg-[#1e4033] hover:bg-[#274f3e] text-white font-bold text-sm shadow-xs transition active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
              >
                <span>{isLoggingIn ? '인증 처리 중...' : '관리자 계정으로 로그인'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="mt-6 pt-4 border-t border-stone-100 flex items-center justify-center gap-4 text-xs font-semibold text-stone-500">
              <Link href="/" className="hover:text-stone-800 underline">
                홈으로 돌아가기
              </Link>
              <span>•</span>
              <Link href="/order" className="hover:text-stone-800 underline">
                스마트 주문하기
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f6f0] flex flex-col font-sans select-none text-[#191c1b]">
      {/* Top Navbar matching screen_5.png */}
      <CafeTopNavbar
        activeTab={
          activeTab === 'SALES'
            ? 'sales'
            : activeTab === 'MANAGE'
            ? 'manage'
            : 'members'
        }
      />

      <main className="max-w-7xl mx-auto w-full px-8 py-6 flex-1 flex flex-col space-y-6">
        {/* Section Subtitle & Title matching screen_5.png */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-black uppercase tracking-widest text-[#1e4033]">
                {activeTab === 'SALES'
                  ? 'SALES OVERVIEW'
                  : activeTab === 'MANAGE'
                  ? 'STORE MANAGEMENT'
                  : 'NEW MEMBERS LIST'}
              </span>

              {/* 3 Tabs: 매출 통계, 메뉴 & 주문 관리, 오늘 신규 회원 목록 */}
              <div className="flex items-center bg-[#e8ece7] rounded-full p-0.5 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setActiveTab('SALES')}
                  className={`px-3 py-1 rounded-full transition-all ${
                    activeTab === 'SALES' ? 'bg-[#1e4033] text-white shadow-2xs' : 'text-stone-600'
                  }`}
                >
                  매출 통계
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('MANAGE')}
                  className={`px-3 py-1 rounded-full transition-all ${
                    activeTab === 'MANAGE' ? 'bg-[#1e4033] text-white shadow-2xs' : 'text-stone-600'
                  }`}
                >
                  메뉴 & 주문 관리
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('MEMBERS')}
                  className={`px-3 py-1 rounded-full transition-all flex items-center gap-1.5 ${
                    activeTab === 'MEMBERS' ? 'bg-[#1e4033] text-white shadow-2xs' : 'text-stone-600'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>오늘 신규 회원 ({todayUsers.length}명)</span>
                </button>
              </div>
            </div>

            <h1 className="text-3xl font-black text-[#191c1b] tracking-tight mt-1.5">
              {activeTab === 'SALES'
                ? '우리 매장의 오늘'
                : activeTab === 'MANAGE'
                ? '메뉴 품절 및 실시간 주문'
                : '오늘 가입한 신규 회원 목록'}
            </h1>
            <p className="text-sm text-stone-500 font-medium mt-1">
              {activeTab === 'SALES'
                ? '결제와 환불이 발생한 날짜를 기준으로 확인하는 매출입니다.'
                : activeTab === 'MANAGE'
                ? '원클릭으로 메뉴 품절을 전파하고 실시간 주문을 처리합니다.'
                : '신규 회원은 가입 즉시 자동 인증(Auto-Verified)되어 바로 서비스를 이용할 수 있습니다.'}
            </p>
          </div>

          {/* Filters & Export button matching screen_5.png */}
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-2 bg-white px-3.5 py-2 rounded-xl border border-[#e8ece7] text-xs font-bold text-stone-700 shadow-2xs">
              <Calendar className="w-3.5 h-3.5 text-stone-500" />
              <span>{selectedDate}</span>
            </div>

            {activeTab === 'SALES' && (
              <div className="relative">
                <select
                  value={selectedChannel}
                  onChange={(e) => setSelectedChannel(e.target.value as any)}
                  className="appearance-none bg-white px-3.5 py-2 pr-8 rounded-xl border border-[#e8ece7] text-xs font-bold text-stone-700 shadow-2xs focus:outline-none cursor-pointer"
                >
                  <option value="ALL">전체 채널</option>
                  <option value="MOBILE">스마트폰 웹</option>
                  <option value="KIOSK">키오스크</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-stone-400 absolute right-2.5 top-2.5 pointer-events-none" />
              </div>
            )}

            <button
              type="button"
              onClick={handleDownloadCSV}
              className="flex items-center gap-1.5 bg-[#1e4033] hover:bg-[#274f3e] text-white px-4 py-2 rounded-xl text-xs font-bold shadow-2xs transition active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              <span>CSV 다운로드</span>
            </button>
          </div>
        </div>

        {activeTab === 'SALES' ? (
          <>
            {/* 4 Metric Cards matching screen_5.png */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-3xl border border-[#e8ece7] p-5 shadow-xs flex flex-col justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#f4f7f4] flex items-center justify-center text-[#1e4033]">
                    <Coins className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-stone-500">결제 금액</span>
                </div>
                <div className="mt-4">
                  <div className="text-2xl font-black text-[#191c1b] tracking-tight">
                    {totalPayment.toLocaleString()}원
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-3xl border border-[#e8ece7] p-5 shadow-xs flex flex-col justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#f4f7f4] flex items-center justify-center text-[#1e4033]">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-stone-500">순매출</span>
                </div>
                <div className="mt-4">
                  <div className="text-2xl font-black text-[#191c1b] tracking-tight">
                    {netRevenue.toLocaleString()}원
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-3xl border border-[#e8ece7] p-5 shadow-xs flex flex-col justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#fef2f2] flex items-center justify-center text-red-600">
                    <RotateCcw className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-stone-500">환불 금액</span>
                </div>
                <div className="mt-4">
                  <div className="text-2xl font-black text-red-600 tracking-tight">
                    {refundAmount.toLocaleString()}원
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-3xl border border-[#e8ece7] p-5 shadow-xs flex flex-col justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#f4f7f4] flex items-center justify-center text-[#1e4033]">
                    <Coffee className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-stone-500">주문 / 판매 잔 수</span>
                </div>
                <div className="mt-4">
                  <div className="text-2xl font-black text-[#191c1b] tracking-tight">
                    {totalOrdersCount}건 / {totalCupsCount}잔
                  </div>
                </div>
              </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-3xl border border-[#e8ece7] p-6 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-4 border-b border-[#f2f4f1]">
                    <h3 className="font-extrabold text-base text-[#191c1b]">
                      음료별 순매출
                    </h3>
                    <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      실시간 집계 ({drinkSales.length}종)
                    </span>
                  </div>

                  <div className="space-y-4 pt-5">
                    {drinkSales.length === 0 ? (
                      <div className="py-12 text-center text-xs text-stone-400 font-medium">
                        아직 접수된 주문 내역이 없습니다.
                      </div>
                    ) : (
                      drinkSales.map((item) => (
                        <div key={item.name} className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs font-bold">
                            <div className="flex items-center gap-2">
                              <Image
                                src={item.img}
                                alt={item.name}
                                width={24}
                                height={24}
                                className="object-contain"
                                unoptimized
                              />
                              <span className="text-[#191c1b]">{item.name} ({item.count}잔)</span>
                            </div>
                            <span className="text-stone-700">
                              {item.amount.toLocaleString()}원
                            </span>
                          </div>
                          <div className="w-full bg-[#e8ece7] rounded-full h-3 overflow-hidden">
                            <div
                              className="bg-[#1e4033] h-full rounded-full transition-all duration-500"
                              style={{ width: `${item.pct}%` }}
                            />
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-3xl border border-[#e8ece7] p-6 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-4 border-b border-[#f2f4f1]">
                    <h3 className="font-extrabold text-base text-[#191c1b]">
                      시간대별 결제 금액
                    </h3>
                    <span className="text-[11px] font-semibold text-[#1e4033] bg-[#f0f4f1] px-2.5 py-0.5 rounded-full border border-[#dce5dd]">
                      당일 실시간 현황
                    </span>
                  </div>

                  <div className="h-56 flex items-end justify-between pt-6 px-2 gap-2">
                    {hourlyData.map((d) => (
                      <div
                        key={d.hour}
                        className="flex-1 flex flex-col items-center gap-2 h-full justify-end group"
                        title={`${d.hour}: ${d.amount.toLocaleString()}원`}
                      >
                        <div
                          className={`w-full rounded-t-md transition-all ${
                            d.highlight
                              ? 'bg-[#1e4033] shadow-xs'
                              : d.amount > 0
                              ? 'bg-[#b5c9ba] group-hover:bg-[#9bb5a1]'
                              : 'bg-stone-200'
                          }`}
                          style={{ height: d.height }}
                        />
                        <span className="text-[10px] text-stone-500 font-medium">
                          {d.hour.replace('시', '')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Channels Card */}
            <div className="bg-white rounded-3xl border border-[#e8ece7] p-6 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-extrabold text-base text-[#191c1b]">
                  주문 채널별 주문 수
                </h3>
                <span className="text-xs text-stone-500 font-medium">
                  총 {totalCh}건 주문 접수
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-stone-700">
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-[#1e4033]" />
                    <span>스마트폰 웹 · PWA</span>
                    <span className="text-[#1e4033] font-black">
                      {mobileCount}건 ({totalCh > 0 ? mobilePct : 0}%)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-stone-600 font-black">
                      {kioskCount}건 ({totalCh > 0 ? kioskPct : 0}%)
                    </span>
                    <span>키오스크</span>
                    <Monitor className="w-4 h-4 text-stone-600" />
                  </div>
                </div>

                <div className="w-full h-4 bg-[#e8ece7] rounded-full overflow-hidden flex">
                  {totalCh > 0 ? (
                    <>
                      <div className="bg-[#1e4033] h-full transition-all" style={{ width: `${mobilePct}%` }} />
                      <div className="bg-[#b5c9ba] h-full transition-all" style={{ width: `${kioskPct}%` }} />
                    </>
                  ) : (
                    <div className="bg-stone-200 w-full h-full" />
                  )}
                </div>
              </div>
            </div>
          </>
        ) : activeTab === 'MANAGE' ? (
          /* Store Management Tab (Sold out toggles & live orders) */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-3xl border border-[#e8ece7] p-6 shadow-xs">
              <h3 className="font-extrabold text-lg text-[#191c1b] mb-4">
                메뉴 품절 및 판매 상태 관리
              </h3>
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                {menuItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3.5 rounded-2xl border border-[#f0f2ee] bg-[#fbfbf9]"
                  >
                    <div className="flex items-center gap-3">
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        width={40}
                        height={40}
                        className="object-contain"
                        unoptimized
                      />
                      <div>
                        <div className="font-bold text-sm text-[#191c1b]">{item.name}</div>
                        <div className="text-xs text-stone-500 font-semibold">
                          {item.basePrice.toLocaleString()}원
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleToggleSoldOut(item.id, item.isSoldOut)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        item.isSoldOut
                          ? 'bg-red-50 text-red-600 border border-red-200'
                          : 'bg-[#e8ece7] text-[#1e4033]'
                      }`}
                    >
                      {item.isSoldOut ? (
                        <>
                          <ToggleLeft className="w-4 h-4" />
                          <span>품절 중 (클릭 시 해제)</span>
                        </>
                      ) : (
                        <>
                          <ToggleRight className="w-4 h-4" />
                          <span>판매 중 (클릭 시 품절)</span>
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-[#e8ece7] p-6 shadow-xs">
              <h3 className="font-extrabold text-lg text-[#191c1b] mb-4">
                실시간 주문 내역 ({orders.length}건)
              </h3>
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                {orders.map((ord) => (
                  <div
                    key={ord.id}
                    className="p-3.5 rounded-2xl border border-[#f0f2ee] bg-[#fbfbf9] flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-base text-[#191c1b]">
                          #{ord.orderNumber}
                        </span>
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-stone-100 text-stone-600">
                          {ord.orderSource === 'MOBILE' ? '모바일 웹' : '키오스크'}
                        </span>
                        <span
                          className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                            ord.status === 'READY'
                              ? 'bg-emerald-100 text-emerald-800'
                              : ord.status === 'PREPARING'
                              ? 'bg-amber-100 text-amber-800'
                              : ord.status === 'COMPLETED'
                              ? 'bg-stone-100 text-stone-600'
                              : ord.status === 'CANCELLED'
                              ? 'bg-red-100 text-red-600'
                              : 'bg-stone-200 text-stone-700'
                          }`}
                        >
                          {ord.status}
                        </span>
                      </div>
                      <div className="text-xs text-stone-500 mt-1">
                        {ord.items.map((i) => `${i.menuName} × ${i.quantity}`).join(', ')}
                      </div>
                      <div className="text-xs font-bold text-[#1e4033] mt-0.5">
                        {ord.totalAmount.toLocaleString()}원
                      </div>
                    </div>

                    {ord.status !== 'CANCELLED' && (
                      <button
                        type="button"
                        onClick={() => handleCancelOrder(ord.id)}
                        className="text-xs text-red-500 hover:text-red-700 font-semibold px-2 py-1 rounded-lg border border-red-200 hover:bg-red-50"
                      >
                        취소/환불
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Members Tab: 오늘 신규 가입 회원 목록 as requested! */
          <div className="space-y-6">
            {/* Top 3 Metric Cards for Members */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white rounded-3xl border border-[#e8ece7] p-5 shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-stone-500">오늘 신규 가입</span>
                  <div className="text-3xl font-black text-[#1e4033] tracking-tight mt-1">
                    {todayUsers.length}명
                  </div>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-[#e8ece7] text-[#1e4033] flex items-center justify-center">
                  <UserCheck className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white rounded-3xl border border-[#e8ece7] p-5 shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-stone-500">인증 처리 상태</span>
                  <div className="text-3xl font-black text-emerald-700 tracking-tight mt-1">
                    100% 자동인증
                  </div>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white rounded-3xl border border-[#e8ece7] p-5 shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-stone-500">누적 등록 회원 수</span>
                  <div className="text-3xl font-black text-[#191c1b] tracking-tight mt-1">
                    {users.length}명
                  </div>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-[#f4f7f4] text-stone-700 flex items-center justify-center">
                  <Users className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* Member List Table Card */}
            <div className="bg-white rounded-3xl border border-[#e8ece7] p-6 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#f2f4f1]">
                <div>
                  <h3 className="font-extrabold text-lg text-[#191c1b]">
                    회원 목록 상세
                  </h3>
                  <p className="text-xs text-stone-500">
                    회원가입 신청 시 자동인증된 회원 데이터입니다.
                  </p>
                </div>

                {/* Filter toggle: 오늘 가입 회원 vs 전체 회원 */}
                <div className="flex items-center gap-2 bg-[#f4f7f4] p-1 rounded-xl text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setMemberFilter('TODAY')}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      memberFilter === 'TODAY'
                        ? 'bg-[#1e4033] text-white shadow-2xs'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    오늘 신규 가입 ({todayUsers.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setMemberFilter('ALL')}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      memberFilter === 'ALL'
                        ? 'bg-[#1e4033] text-white shadow-2xs'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    전체 회원 ({users.length})
                  </button>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#f0f2ee] text-[11px] font-black text-stone-400 uppercase tracking-wider">
                      <th className="py-3 px-4">회원 번호 / 가입 시각</th>
                      <th className="py-3 px-4">이름 (닉네임)</th>
                      <th className="py-3 px-4">이메일 (아이디)</th>
                      <th className="py-3 px-4">연락처</th>
                      <th className="py-3 px-4">회원 구분</th>
                      <th className="py-3 px-4 text-center">인증 상태</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f7f8f6] text-xs">
                    {displayedUsers.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-stone-400 font-medium">
                          오늘 신규로 가입된 회원이 없습니다.
                        </td>
                      </tr>
                    ) : (
                      displayedUsers.map((mbr) => {
                        const isToday = mbr.createdAt.startsWith(todayStr);
                        const isCoreAdmin = mbr.email.toLowerCase() === 'admin@gmail.com' || mbr.role === 'ADMIN';

                        return (
                          <tr key={mbr.uid} className="hover:bg-[#fafbf9] transition-colors">
                            <td className="py-3.5 px-4">
                              <div className="font-bold text-[#191c1b]">
                                {mbr.uid.substring(0, 14)}
                              </div>
                              <div className="text-[11px] text-stone-400 flex items-center gap-1 mt-0.5">
                                <Clock className="w-3 h-3" />
                                <span>{new Date(mbr.createdAt).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}</span>
                                {isToday && (
                                  <span className="text-[10px] font-bold text-[#1e4033] bg-[#e8ece7] px-1.5 py-0.2 rounded">
                                    오늘
                                  </span>
                                )}
                              </div>
                            </td>

                            <td className="py-3.5 px-4 font-bold text-[#191c1b]">
                              {mbr.displayName}
                            </td>

                            <td className="py-3.5 px-4 text-stone-600 font-medium">
                              {mbr.email}
                            </td>

                            <td className="py-3.5 px-4 text-stone-600 font-medium">
                              {mbr.phoneNumber || '-'}
                            </td>

                            <td className="py-3.5 px-4">
                              {isCoreAdmin ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#1e4033] text-white text-[11px] font-black">
                                  <ShieldCheck className="w-3 h-3" />
                                  <span>총괄 관리자</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-stone-100 text-stone-700 text-[11px] font-bold">
                                  <span>일반 회원</span>
                                </span>
                              )}
                            </td>

                            <td className="py-3.5 px-4 text-center">
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-200">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                <span>자동 인증 완료</span>
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer matching screen_5.png */}
      <footer className="text-center py-6 text-xs text-stone-400 font-medium border-t border-[#e8ece7]">
        CAFE CORE · 좋은 하루의 한 잔
      </footer>
    </div>
  );
}
