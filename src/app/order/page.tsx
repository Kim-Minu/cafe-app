import { getCategories, getMenuItems } from '@/lib/db/store';
import { MobileOrderView } from '@/features/mobile-order/components/MobileOrderView';
import { CafeTopNavbar } from '@/components/CafeTopNavbar';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '스마트오더 주문하기 - Cafe Flow',
  description: '스마트폰에서 줄 서지 않고 바로 주문하는 Cafe Flow 스마트오더',
};

export const dynamic = 'force-dynamic';

export default async function OrderPage() {
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
      />
    </>
  );
}
