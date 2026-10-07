import { getAllOrdersCombined } from '@/features/order/actions';
import { KDSView } from '@/features/kds/components/KDSView';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '주방 KDS - Cafe Flow',
  description: '실시간 카페 주방 디스플레이 시스템',
};

export const dynamic = 'force-dynamic';

export default async function KDSPage() {
  const orders = await getAllOrdersCombined();

  return <KDSView initialOrders={orders} />;
}
