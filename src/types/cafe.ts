export type CategoryId = 'coffee' | 'non-coffee' | 'tea' | 'dessert' | 'bakery';

export interface Category {
  id: string;
  name: string;
  displayOrder: number;
  icon?: string;
}

export interface OptionItem {
  id: string;
  name: string;
  additionalPrice: number;
  isDefault?: boolean;
}

export interface OptionGroup {
  id: string;
  name: string;
  isRequired: boolean;
  maxSelect: number;
  options: OptionItem[];
}

export interface MenuItem {
  id: string;
  categoryId: string;
  name: string;
  englishName?: string;
  description: string;
  basePrice: number;
  imageUrl: string;
  isSoldOut: boolean;
  isPopular?: boolean;
  isNew?: boolean;
  optionGroups: OptionGroup[];
}

export type OrderSource = 'KIOSK' | 'MOBILE';
export type OrderType = 'HERE' | 'TOGO';
export type OrderStatus = 'PENDING' | 'PREPARING' | 'READY' | 'COMPLETED' | 'CANCELLED';

export interface SelectedOption {
  groupId: string;
  groupName: string;
  optionId: string;
  optionName: string;
  additionalPrice: number;
}

export interface OrderItem {
  id: string;
  menuItemId: string;
  menuName: string;
  basePrice: number;
  unitPrice: number; // basePrice + sum(selected options)
  quantity: number;
  selectedOptions: SelectedOption[];
  itemTotal: number;
}

export interface Order {
  id: string;
  orderNumber: number; // e.g. 101, 102
  orderSource: OrderSource; // 'KIOSK' | 'MOBILE'
  tableNumber?: string; // e.g. "3" (Optional, for mobile table QR order)
  orderType: OrderType; // 'HERE' | 'TOGO'
  status: OrderStatus;
  items: OrderItem[];
  totalAmount: number;
  customerNote?: string;
  userId?: string;
  userEmail?: string;
  customerName?: string;
  createdAt: string; // ISO string
  updatedAt: string;
}

export type SSEEventType =
  | 'INIT'
  | 'ORDER_CREATED'
  | 'ORDER_STATUS_CHANGED'
  | 'ORDER_CANCELLED'
  | 'MENU_UPDATED';

export interface SSEMessage {
  type: SSEEventType;
  data: any;
  timestamp: string;
}
