import { getOrderById } from '@/lib/db/store';
import { getOrderFromFirestore } from '@/features/order/firestore';
import { KioskCompleteView } from '@/features/kiosk/components/KioskCompleteView';
import { redirect } from 'next/navigation';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '주문 완료 - Cafe Flow Kiosk',
  description: '주문이 성공적으로 접수되었습니다',
};

export const dynamic = 'force-dynamic';

export default async function KioskCompletePage({
  searchParams,
}: {
  searchParams: Promise<{ orderId?: string }>;
}) {
  const { orderId } = await searchParams;
  if (!orderId) {
    redirect('/kiosk');
  }

  let order = getOrderById(orderId);
  if (!order) {
    order = (await getOrderFromFirestore(orderId)) || undefined;
  }
  if (!order) {
    redirect('/kiosk');
  }

  return <KioskCompleteView order={order} />;
}
