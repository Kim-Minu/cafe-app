import { getMenuItems } from '@/lib/db/store';
import { getAllOrdersCombined } from '@/features/order/actions';
import Link from 'next/link';
import {
  Smartphone,
  Tablet,
  ChefHat,
  Tv,
  LayoutDashboard,
  QrCode,
  ArrowRight,
  Coffee,
  CheckCircle2,
  Sparkles,
  Users,
} from 'lucide-react';
import { MobileFNB } from '@/components/MobileFNB';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const orders = await getAllOrdersCombined();
  const menuItems = getMenuItems();

  const activeOrdersCount = orders.filter((o) =>
    ['PENDING', 'PREPARING', 'READY'].includes(o.status)
  ).length;

  const CHANNELS = [
    {
      title: '스마트폰 스마트오더',
      subtitle: '고객용 모바일 웹 / PWA (화면 1)',
      description:
        '고객이 스마트폰으로 줄 서지 않고 메뉴 탐색, 커스텀 옵션(HOT/ICE, 샷, 컵), 간편 주문 및 실시간 제조 현황 알림을 받습니다.',
      href: '/order',
      badge: '고객용 (모바일)',
      icon: Smartphone,
      color: 'bg-[#1e4033]',
      tagColor: 'bg-[#e8ece7] text-[#1e4033]',
    },
    {
      title: '테이블 QR 주문 (테이블 3번)',
      subtitle: '착석 후 QR 스캔 주문',
      description:
        '매장 좌석 테이블의 QR 코드를 스캔했을 때 테이블 번호가 자동 바인딩되어 자리에서 바로 주문할 수 있습니다.',
      href: '/table/3',
      badge: '테이블 QR',
      icon: QrCode,
      color: 'bg-[#274f3e]',
      tagColor: 'bg-[#e8ece7] text-[#274f3e]',
    },
    {
      title: '스마트폰 접속 QR 코드 안내',
      subtitle: '스마트폰 카메라 스캔 & PWA 바로가기',
      description:
        '스마트폰으로 바로 접속할 수 있는 고해상도 QR 코드를 생성하고 테이블 스티커용 이미지를 다운로드할 수 있습니다.',
      href: '/qr',
      badge: 'QR 스캔/안내',
      icon: QrCode,
      color: 'bg-[#1e4033]',
      tagColor: 'bg-emerald-100 text-emerald-900',
    },
    {
      title: '매장 키오스크',
      subtitle: '매장 대형 스크린 현장 주문 (화면 2)',
      description:
        '매장 입구 비치용 2열 와이드 메뉴 카드, 직관적인 + 담기 터치 UI, 실시간 하단 장바구니 및 간편 결제를 제공합니다.',
      href: '/kiosk',
      badge: '매장용 (키오스크)',
      icon: Tablet,
      color: 'bg-[#1e4033]',
      tagColor: 'bg-[#e8ece7] text-[#1e4033]',
    },
    {
      title: '주방 KDS 시스템',
      subtitle: '좋은 한 잔을 만드는 주방 공간 (화면 3)',
      description:
        '키오스크와 스마트폰 주문이 실시간으로 동기화되며, 카드별 주문 접수, 제조 시작, 픽업 준비 완료 체크리스트를 지원합니다.',
      href: '/kds',
      badge: '바리스타/주방',
      icon: ChefHat,
      color: 'bg-[#1e4033]',
      tagColor: 'bg-[#e8ece7] text-[#1e4033]',
    },
    {
      title: '매장 픽업 호출 전광판',
      subtitle: '당신의 한 잔을 준비하고 있어요 (화면 4)',
      description:
        '제조 중 번호(소프트 세이지 패널)와 픽업 가능 번호(딥 포레스트 그린 패널)를 분할 표시하며 방금 완료 뱃지를 제공합니다.',
      href: '/pickup-board',
      badge: '매장 전광판',
      icon: Tv,
      color: 'bg-[#274f3e]',
      tagColor: 'bg-[#e8ece7] text-[#274f3e]',
    },
    {
      title: '우리 매장의 오늘 (매출 & 매장 관리)',
      subtitle: '매출 분석 & 메뉴 품절 관리 (화면 5)',
      description:
        '결제 금액, 순매출, 환불 금액, 판매 잔 수, 음료별 순매출 막대 그래프, 시간대별 매출 및 주문 채널 비중을 제공합니다. (관리자 전용)',
      href: '/admin',
      badge: '관리자 전용',
      icon: LayoutDashboard,
      color: 'bg-[#1e4033]',
      tagColor: 'bg-amber-100 text-amber-900',
    },
    {
      title: '오늘 신규 가입 회원 목록',
      subtitle: '회원가입 자동인증 및 당일 가입 현황',
      description:
        '일반 회원이 가입하면 즉시 자동인증되며, 오늘 신규 가입한 회원들의 가입 시각, 이메일, 닉네임, 연락처를 관리자가 실시간 조회합니다.',
      href: '/admin/members',
      badge: '관리자 전용',
      icon: Users,
      color: 'bg-[#274f3e]',
      tagColor: 'bg-amber-100 text-amber-900',
    },
  ];

  return (
    <div className="min-h-screen bg-[#f7f6f0] font-sans text-[#191c1b] flex flex-col">
      {/* Top Header */}
      <header className="bg-white border-b border-[#e8ece7] px-8 py-5 shadow-2xs">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-full bg-[#1e4033] text-white flex items-center justify-center shadow-xs">
              <Coffee className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-[#191c1b] text-lg tracking-tight">
                  CAFE CORE
                </span>
                <span className="text-xs text-stone-300">|</span>
                <span className="text-xs font-semibold text-stone-600">송파점</span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#e8ece7] text-[#1e4033]">
                  실시간 통합 시스템
                </span>
              </div>
              <p className="text-xs text-stone-400">카페 코어 · 좋은 하루의 한 잔</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-3.5 py-1.5 rounded-xl bg-white border border-[#e8ece7] text-stone-700 hover:bg-[#e8ece7] text-xs font-bold transition shadow-2xs"
            >
              로그인
            </Link>
            <Link
              href="/signup"
              className="px-3.5 py-1.5 rounded-xl bg-[#1e4033] hover:bg-[#274f3e] text-white text-xs font-bold transition shadow-2xs"
            >
              회원가입 (자동인증)
            </Link>
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#e8ece7] text-[#1e4033] text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>진행 중 주문 {activeOrdersCount}건</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto w-full px-8 py-10 flex-1 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h1 className="text-3xl sm:text-4xl font-black text-[#191c1b] tracking-tight">
            카페 코어 통합 운영 허브
          </h1>
          <p className="text-sm sm:text-base text-stone-600 font-medium">
            스마트폰 주문부터 키오스크, 주방 KDS, 픽업 전광판, 매출 대시보드까지 5가지 화면을 체험해 보세요.
          </p>
        </div>

        {/* 6 Screen Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {CHANNELS.map((ch) => {
            const Icon = ch.icon;
            return (
              <Link
                key={ch.title}
                href={ch.href}
                className="group bg-white rounded-3xl border border-[#e8ece7] p-6 shadow-xs hover:shadow-lg hover:border-[#1e4033]/40 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`w-12 h-12 rounded-2xl ${ch.color} text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <span
                      className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${ch.tagColor}`}
                    >
                      {ch.badge}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-lg text-[#191c1b] group-hover:text-[#1e4033] transition-colors">
                    {ch.title}
                  </h3>
                  <p className="text-xs font-semibold text-stone-400 mt-0.5">
                    {ch.subtitle}
                  </p>
                  <p className="text-xs text-stone-600 mt-2.5 leading-relaxed font-medium">
                    {ch.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-[#f2f4f1] flex items-center justify-between text-xs font-bold text-[#1e4033]">
                  <span>화면 열기</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-6 pb-24 md:pb-6 text-xs text-stone-400 font-medium border-t border-[#e8ece7]">
        CAFE CORE · 좋은 커피가 좋은 하루를 만듭니다.
      </footer>

      {/* Mobile FNB for PWA App Navigation */}
      <MobileFNB activeTab="home" />
    </div>
  );
}
