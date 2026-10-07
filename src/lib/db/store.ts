import { Category, MenuItem, Order, OrderStatus, OrderSource, OrderType, OrderItem } from '@/types/cafe';
import { UserProfile } from '@/types/auth';

export const INITIAL_CATEGORIES: Category[] = [
  { id: 'coffee', name: '커피', displayOrder: 1, icon: 'Coffee' },
  { id: 'tea-latte', name: '티 & 라떼', displayOrder: 2, icon: 'Milk' },
  { id: 'ade', name: '에이드', displayOrder: 3, icon: 'CupSoda' },
];

export const INITIAL_MENU_ITEMS: MenuItem[] = [
  {
    id: 'menu-1',
    categoryId: 'coffee',
    name: '아메리카노',
    englishName: 'Americano',
    description: '깊고 진한 풍미의 고소한 에스프레소와 깔끔한 물의 조화',
    basePrice: 3500,
    imageUrl: '/images/americano.png',
    isSoldOut: false,
    isPopular: true,
    optionGroups: [
      {
        id: 'opt-temp',
        name: '온도 선택',
        isRequired: true,
        maxSelect: 1,
        options: [
          { id: 'ice', name: 'ICE', additionalPrice: 0, isDefault: true },
          { id: 'hot', name: 'HOT', additionalPrice: 0 },
        ],
      },
      {
        id: 'opt-shot',
        name: '샷 추가',
        isRequired: false,
        maxSelect: 2,
        options: [
          { id: 'shot-1', name: '샷 추가 1', additionalPrice: 500 },
          { id: 'shot-2', name: '샷 추가 2', additionalPrice: 1000 },
          { id: 'shot-decaf', name: '디카페인 변경', additionalPrice: 500 },
        ],
      },
      {
        id: 'opt-cup',
        name: '컵 선택',
        isRequired: true,
        maxSelect: 1,
        options: [
          { id: 'cup-store', name: '매장용 다회용컵', additionalPrice: 0, isDefault: true },
          { id: 'cup-takeout', name: '일회용 테이크아웃컵', additionalPrice: 0 },
          { id: 'cup-tumbler', name: '개인 텀블러 (-300원)', additionalPrice: -300 },
        ],
      },
    ],
  },
  {
    id: 'menu-2',
    categoryId: 'coffee',
    name: '카페 라떼',
    englishName: 'Cafe Latte',
    description: '풍부한 에스프레소와 신선하고 부드러운 스팀밀크의 조화',
    basePrice: 4500,
    imageUrl: '/images/latte.png',
    isSoldOut: false,
    isPopular: true,
    optionGroups: [
      {
        id: 'opt-temp',
        name: '온도 선택',
        isRequired: true,
        maxSelect: 1,
        options: [
          { id: 'ice', name: 'ICE', additionalPrice: 0, isDefault: true },
          { id: 'hot', name: 'HOT', additionalPrice: 0 },
        ],
      },
      {
        id: 'opt-shot',
        name: '원두/샷 옵션',
        isRequired: false,
        maxSelect: 1,
        options: [
          { id: 'decaf', name: '디카페인', additionalPrice: 500 },
          { id: 'shot-1', name: '샷 추가 1', additionalPrice: 500 },
        ],
      },
      {
        id: 'opt-milk',
        name: '우유 변경',
        isRequired: false,
        maxSelect: 1,
        options: [
          { id: 'milk-oat', name: '오트밀크 변경', additionalPrice: 600 },
          { id: 'milk-lowfat', name: '저지방 우유', additionalPrice: 0 },
        ],
      },
      {
        id: 'opt-cup',
        name: '컵 선택',
        isRequired: true,
        maxSelect: 1,
        options: [
          { id: 'cup-store', name: '매장용 다회용컵', additionalPrice: 0, isDefault: true },
          { id: 'cup-takeout', name: '일회용 테이크아웃컵', additionalPrice: 0 },
        ],
      },
    ],
  },
  {
    id: 'menu-3',
    categoryId: 'coffee',
    name: '바닐라 라떼',
    englishName: 'Vanilla Latte',
    description: '천연 바닐라 빈 시럽이 선사하는 은은하고 고급스러운 달콤함',
    basePrice: 5000,
    imageUrl: '/images/vanilla_latte.png',
    isSoldOut: false,
    isPopular: false,
    optionGroups: [
      {
        id: 'opt-temp',
        name: '온도 선택',
        isRequired: true,
        maxSelect: 1,
        options: [
          { id: 'ice', name: 'ICE', additionalPrice: 0, isDefault: true },
          { id: 'hot', name: 'HOT', additionalPrice: 0 },
        ],
      },
      {
        id: 'opt-syrup',
        name: '시럽 조절',
        isRequired: false,
        maxSelect: 1,
        options: [
          { id: 'syrup-less', name: '시럽 적게', additionalPrice: 0 },
          { id: 'syrup-more', name: '시럽 많이', additionalPrice: 0 },
        ],
      },
      {
        id: 'opt-cup',
        name: '컵 선택',
        isRequired: true,
        maxSelect: 1,
        options: [
          { id: 'cup-store', name: '매장용 다회용컵', additionalPrice: 0, isDefault: true },
          { id: 'cup-takeout', name: '일회용 테이크아웃컵', additionalPrice: 0 },
        ],
      },
    ],
  },
  {
    id: 'menu-4',
    categoryId: 'coffee',
    name: '콜드브루',
    englishName: 'Cold Brew',
    description: '장시간 저온 추출하여 깔끔하고 초콜릿 풍미가 살아있는 시원한 커피',
    basePrice: 4500,
    imageUrl: '/images/coldbrew.png',
    isSoldOut: false,
    isPopular: false,
    optionGroups: [
      {
        id: 'opt-temp',
        name: '온도 선택',
        isRequired: true,
        maxSelect: 1,
        options: [
          { id: 'ice', name: 'ICE (전용)', additionalPrice: 0, isDefault: true },
        ],
      },
      {
        id: 'opt-cup',
        name: '컵 선택',
        isRequired: true,
        maxSelect: 1,
        options: [
          { id: 'cup-store', name: '매장용 다회용컵', additionalPrice: 0, isDefault: true },
          { id: 'cup-takeout', name: '일회용 테이크아웃컵', additionalPrice: 0 },
        ],
      },
    ],
  },
  {
    id: 'menu-5',
    categoryId: 'tea-latte',
    name: '말차 라떼',
    englishName: 'Matcha Latte',
    description: '제주 유기농 말차의 깊고 쌉싸름한 맛과 고소한 우유의 만남',
    basePrice: 5500,
    imageUrl: '/images/matcha_latte.png',
    isSoldOut: false,
    isPopular: true,
    optionGroups: [
      {
        id: 'opt-temp',
        name: '온도 선택',
        isRequired: true,
        maxSelect: 1,
        options: [
          { id: 'ice', name: 'ICE', additionalPrice: 0, isDefault: true },
          { id: 'hot', name: 'HOT', additionalPrice: 0 },
        ],
      },
      {
        id: 'opt-sweet',
        name: '당도 선택',
        isRequired: false,
        maxSelect: 1,
        options: [
          { id: 'sweet-std', name: '기본', additionalPrice: 0, isDefault: true },
          { id: 'sweet-less', name: '덜 달게', additionalPrice: 0 },
        ],
      },
      {
        id: 'opt-cup',
        name: '컵 선택',
        isRequired: true,
        maxSelect: 1,
        options: [
          { id: 'cup-store', name: '매장용 다회용컵', additionalPrice: 0, isDefault: true },
          { id: 'cup-takeout', name: '일회용 테이크아웃컵', additionalPrice: 0 },
        ],
      },
    ],
  },
  {
    id: 'menu-6',
    categoryId: 'tea-latte',
    name: '얼그레이 티',
    englishName: 'Earl Grey Tea',
    description: '베르가못 향이 그윽하게 퍼지는 최고급 블렌딩 홍차',
    basePrice: 4000,
    imageUrl: '/images/earlgrey.png',
    isSoldOut: false,
    isPopular: false,
    optionGroups: [
      {
        id: 'opt-temp',
        name: '온도 선택',
        isRequired: true,
        maxSelect: 1,
        options: [
          { id: 'hot', name: 'HOT', additionalPrice: 0, isDefault: true },
          { id: 'ice', name: 'ICE', additionalPrice: 0 },
        ],
      },
      {
        id: 'opt-cup',
        name: '컵 선택',
        isRequired: true,
        maxSelect: 1,
        options: [
          { id: 'cup-store', name: '매장용 다회용컵', additionalPrice: 0, isDefault: true },
          { id: 'cup-takeout', name: '일회용 테이크아웃컵', additionalPrice: 0 },
        ],
      },
    ],
  },
  {
    id: 'menu-7',
    categoryId: 'ade',
    name: '레몬 에이드',
    englishName: 'Lemon Ade',
    description: '생 레몬 착즙으로 상큼하고 톡 쏘는 청량감이 가득한 스파클링 에이드',
    basePrice: 5500,
    imageUrl: '/images/lemon_ade.png',
    isSoldOut: false,
    isPopular: false,
    optionGroups: [
      {
        id: 'opt-temp',
        name: '온도 선택',
        isRequired: true,
        maxSelect: 1,
        options: [
          { id: 'ice', name: 'ICE (전용)', additionalPrice: 0, isDefault: true },
        ],
      },
      {
        id: 'opt-cup',
        name: '컵 선택',
        isRequired: true,
        maxSelect: 1,
        options: [
          { id: 'cup-store', name: '매장용 다회용컵', additionalPrice: 0, isDefault: true },
          { id: 'cup-takeout', name: '일회용 테이크아웃컵', additionalPrice: 0 },
        ],
      },
    ],
  },
  {
    id: 'menu-8',
    categoryId: 'ade',
    name: '자몽 에이드',
    englishName: 'Grapefruit Ade',
    description: '과육이 알알이 씹히는 달콤쌉싸름한 붉은 자몽 스파클링 에이드',
    basePrice: 5500,
    imageUrl: '/images/grapefruit_ade.png',
    isSoldOut: false,
    isPopular: false,
    optionGroups: [
      {
        id: 'opt-temp',
        name: '온도 선택',
        isRequired: true,
        maxSelect: 1,
        options: [
          { id: 'ice', name: 'ICE (전용)', additionalPrice: 0, isDefault: true },
        ],
      },
      {
        id: 'opt-cup',
        name: '컵 선택',
        isRequired: true,
        maxSelect: 1,
        options: [
          { id: 'cup-store', name: '매장용 다회용컵', additionalPrice: 0, isDefault: true },
          { id: 'cup-takeout', name: '일회용 테이크아웃컵', additionalPrice: 0 },
        ],
      },
    ],
  },
];

export const INITIAL_ORDERS: Order[] = [];

export const ADMIN_CREDENTIALS = {
  email: 'admin@gmail.com',
  password: 'password1234',
};

export const INITIAL_USERS: UserProfile[] = [
  {
    uid: 'admin-core-01',
    email: 'admin@gmail.com',
    displayName: '카페 코어 송파점 총괄 관리자',
    role: 'ADMIN',
    phoneNumber: '010-1234-5678',
    isVerified: true,
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
  },
];

interface CafeStore {
  categories: Category[];
  menuItems: MenuItem[];
  orders: Order[];
  users: UserProfile[];
  nextOrderNumber: number;
}

declare global {
  // eslint-disable-next-line no-var
  var __cafeStore: CafeStore | undefined;
}

function getStore(): CafeStore {
  if (!globalThis.__cafeStore) {
    globalThis.__cafeStore = {
      categories: [...INITIAL_CATEGORIES],
      menuItems: [...INITIAL_MENU_ITEMS],
      orders: [],
      users: [...INITIAL_USERS],
      nextOrderNumber: 1,
    };
  }
  if (globalThis.__cafeStore.orders) {
    globalThis.__cafeStore.orders = globalThis.__cafeStore.orders.filter(
      (o) => !/^ord-10[1-8]$/.test(o.id)
    );
  }
  if (globalThis.__cafeStore.users) {
    globalThis.__cafeStore.users = globalThis.__cafeStore.users.filter(
      (u) => !/^user-(today|prev)-[0-9]+$/.test(u.uid)
    );
  } else {
    globalThis.__cafeStore.users = [...INITIAL_USERS];
  }
  return globalThis.__cafeStore;
}

export function getCategories(): Category[] {
  return getStore().categories;
}

export function getMenuItems(): MenuItem[] {
  return getStore().menuItems;
}

export function getMenuItemById(id: string): MenuItem | undefined {
  return getStore().menuItems.find((m) => m.id === id);
}

export function getAllOrders(): Order[] {
  return [...getStore().orders];
}

export function getOrderById(id: string): Order | undefined {
  return getStore().orders.find((o) => o.id === id);
}

export function getNextOrderNumber(): number {
  const store = getStore();
  const current = store.nextOrderNumber;
  store.nextOrderNumber += 1;
  return current;
}

export function addOrder(order: Order): Order {
  const store = getStore();
  store.orders.unshift(order);
  return order;
}

export function createNewOrder(input: {
  orderSource: OrderSource;
  tableNumber?: string;
  orderType: OrderType;
  items: OrderItem[];
  customerNote?: string;
  userId?: string;
  userEmail?: string;
  customerName?: string;
  id?: string;
  orderNumber?: number;
}): Order {
  const store = getStore();
  const id = input.id || `ord-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const orderNumber = input.orderNumber !== undefined ? input.orderNumber : store.nextOrderNumber++;
  const totalAmount = input.items.reduce((sum, item) => sum + item.itemTotal, 0);
  const newOrder: Order = {
    id,
    orderNumber,
    orderSource: input.orderSource,
    tableNumber: input.tableNumber,
    orderType: input.orderType,
    status: 'PENDING',
    items: input.items,
    totalAmount,
    customerNote: input.customerNote,
    userId: input.userId,
    userEmail: input.userEmail,
    customerName: input.customerName,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  store.orders.unshift(newOrder);
  return newOrder;
}

export function updateOrderStatus(orderId: string, status: OrderStatus): Order | null {
  const store = getStore();
  const order = store.orders.find((o) => o.id === orderId);
  if (!order) return null;
  order.status = status;
  order.updatedAt = new Date().toISOString();
  return order;
}

export const changeOrderStatus = updateOrderStatus;

export function toggleMenuItemSoldOut(menuId: string, isSoldOut: boolean): MenuItem | null {
  const store = getStore();
  const item = store.menuItems.find((m) => m.id === menuId);
  if (!item) return null;
  item.isSoldOut = isSoldOut;
  return item;
}

export const updateMenuItemSoldOut = toggleMenuItemSoldOut;

export function cancelOrder(orderId: string): Order | null {
  return updateOrderStatus(orderId, 'CANCELLED');
}

export function getAllUsers(): UserProfile[] {
  return [...getStore().users];
}

export function getTodayUsers(): UserProfile[] {
  const store = getStore();
  const todayStr = new Date().toISOString().split('T')[0];
  return store.users.filter((u) => u.createdAt.startsWith(todayStr));
}

export function findUserByEmail(email: string): UserProfile | undefined {
  const store = getStore();
  return store.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
}

export function registerNewUser(user: UserProfile): UserProfile {
  const store = getStore();
  const existingIdx = store.users.findIndex((u) => u.email.toLowerCase() === user.email.toLowerCase());
  if (existingIdx >= 0) {
    store.users[existingIdx] = user;
  } else {
    store.users.unshift(user);
  }
  return user;
}

// 비밀번호 저장소 (메모리 맵)
declare global {
  // eslint-disable-next-line no-var
  var __userPasswords: Map<string, string> | undefined;
}
if (!globalThis.__userPasswords) {
  globalThis.__userPasswords = new Map<string, string>();
  globalThis.__userPasswords.set('admin@gmail.com', 'password1234');
}

export function recordUserPassword(email: string, password: string): void {
  globalThis.__userPasswords?.set(email.toLowerCase().trim(), password);
}

export function checkUserPassword(email: string, password: string): boolean {
  const stored = globalThis.__userPasswords?.get(email.toLowerCase().trim());
  if (stored === undefined) return true;
  return stored === password;
}

export function resetStore(): void {
  globalThis.__cafeStore = {
    categories: [...INITIAL_CATEGORIES],
    menuItems: [...INITIAL_MENU_ITEMS],
    orders: [],
    users: [...INITIAL_USERS],
    nextOrderNumber: 1,
  };
}
