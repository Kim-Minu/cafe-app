import { getCategories, getMenuItems } from '@/lib/db/store';
import { MobileOrderView } from '@/features/mobile-order/components/MobileOrderView';
import { CafeTopNavbar } from '@/components/CafeTopNavbar';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '테이블 QR 주문하기 - Cafe Flow',
  description: '테이블에서 QR 스캔으로 바로 주문하는 Cafe Flow 스마트오더',
};

export const dynamic = 'force-dynamic';

export default async function TableOrderPage({
  params,
}: {
  params: Promise<{ tableNo: string }>;
}) {
  const { tableNo } = await params;
  const categories = getCategories();
  const menuItems = getMenuItems();

  return (
    <>
      <div className="hidden md:block">
        <CafeTopNavbar activeTab="order" />
      </div>
      <MobileOrderView
        categories={categories}
        initialMenuItems={menuItems}
        tableNumber={tableNo}
      />
    </>
  );
}
