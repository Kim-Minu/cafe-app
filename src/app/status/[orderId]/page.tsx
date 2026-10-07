import { getOrderById } from '@/lib/db/store';
import { LiveOrderStatusView } from '@/features/customer-order/components/LiveOrderStatusView';
import Link from 'next/link';
import { Metadata } from 'next';
import { Coffee, ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: '실시간 주문 상태 - Cafe Flow',
  description: '내 음료의 실시간 제조 현황을 확인하세요',
};

export const dynamic = 'force-dynamic';

export default async function OrderStatusPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  const order = getOrderById(orderId);

  if (!order) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-stone-200 text-center shadow-xs space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
            <Coffee className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-stone-900">주문 정보를 찾을 수 없습니다</h2>
          <p className="text-xs text-stone-500">
            주문 번호가 만료되었거나 존재하지 않는 주문 ID입니다.
          </p>
          <div className="pt-2">
            <Link
              href="/order"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-800 text-white text-xs font-bold rounded-xl shadow-xs hover:bg-amber-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>새로 주문하기</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <LiveOrderStatusView initialOrder={order} />;
}
