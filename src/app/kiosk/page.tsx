import { getCategories, getMenuItems } from '@/lib/db/store';
import { KioskView } from '@/features/kiosk/components/KioskView';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '매장 키오스크 - Cafe Flow',
  description: '터치스크린 키오스크 주문 시스템',
};

export const dynamic = 'force-dynamic';

export default async function KioskPage() {
  const categories = getCategories();
  const menuItems = getMenuItems();

  return (
    <KioskView
      categories={categories}
      initialMenuItems={menuItems}
    />
  );
}
