import { getCategories, getMenuItems, getAllUsers } from '@/lib/db/store';
import { getAllOrdersCombined } from '@/features/order/actions';
import { AdminDashboardView } from '@/features/admin/components/AdminDashboardView';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '매장 관리자 대시보드 - CAFE CORE',
  description: '카페 실시간 매출 분석, 주문 모니터링, 메뉴 품절 관리 및 신규 회원 목록',
};

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const categories = getCategories();
  const menuItems = getMenuItems();
  const orders = await getAllOrdersCombined();
  const users = getAllUsers();

  return (
    <AdminDashboardView
      initialCategories={categories}
      initialMenuItems={menuItems}
      initialOrders={orders}
      initialUsers={users}
    />
  );
}
