import { getCategories, getMenuItems, getAllUsers } from '@/lib/db/store';
import { getAllOrdersCombined } from '@/features/order/actions';
import { AdminDashboardView } from '@/features/admin/components/AdminDashboardView';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '신규 회원 가입 현황 - CAFE CORE 관리자',
  description: '오늘 신규 가입 회원 목록 및 자동 인증 상태 조회',
};

export const dynamic = 'force-dynamic';

export default async function AdminMembersPage() {
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
