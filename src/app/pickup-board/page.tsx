import { getAllOrdersCombined } from '@/features/order/actions';
import { PickupBoardView } from '@/features/pickup/components/PickupBoardView';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '매장 픽업 호출 현황판 - Cafe Flow',
  description: '매장 모니터용 실시간 음료 수령 번호 안내 전광판',
};

export const dynamic = 'force-dynamic';

export default async function PickupBoardPage() {
  const orders = await getAllOrdersCombined();

  return <PickupBoardView initialOrders={orders} />;
}
