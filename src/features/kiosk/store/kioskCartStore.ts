import { create } from 'zustand';
import { OrderItem, OrderType, SelectedOption, MenuItem } from '@/types/cafe';

interface KioskCartState {
  items: OrderItem[];
  orderType: OrderType;
  selectedMenuForOption: MenuItem | null;

  setOrderType: (type: OrderType) => void;
  openOptionModal: (menu: MenuItem) => void;
  closeOptionModal: () => void;

  addItem: (
    menu: MenuItem,
    quantity: number,
    selectedOptions: SelectedOption[]
  ) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;

  getTotalAmount: () => number;
  getTotalCount: () => number;
}

export const useKioskCartStore = create<KioskCartState>((set, get) => ({
  items: [],
  orderType: 'HERE',
  selectedMenuForOption: null,

  setOrderType: (orderType) => set({ orderType }),
  openOptionModal: (menu) => set({ selectedMenuForOption: menu }),
  closeOptionModal: () => set({ selectedMenuForOption: null }),

  addItem: (menu, quantity, selectedOptions) => {
    const additionalTotal = selectedOptions.reduce(
      (sum, opt) => sum + opt.additionalPrice,
      0
    );
    const unitPrice = menu.basePrice + additionalTotal;
    const itemTotal = unitPrice * quantity;

    const optionFingerprint = selectedOptions
      .map((o) => `${o.groupId}:${o.optionId}`)
      .sort()
      .join('|');

    const existingIndex = get().items.findIndex((item) => {
      if (item.menuItemId !== menu.id) return false;
      const curFingerprint = item.selectedOptions
        .map((o) => `${o.groupId}:${o.optionId}`)
        .sort()
        .join('|');
      return curFingerprint === optionFingerprint;
    });

    if (existingIndex > -1) {
      const updated = [...get().items];
      const exist = updated[existingIndex];
      const newQty = exist.quantity + quantity;
      updated[existingIndex] = {
        ...exist,
        quantity: newQty,
        itemTotal: exist.unitPrice * newQty,
      };
      set({ items: updated, selectedMenuForOption: null });
    } else {
      const newItem: OrderItem = {
        id: `kiosk-item-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        menuItemId: menu.id,
        menuName: menu.name,
        basePrice: menu.basePrice,
        unitPrice,
        quantity,
        selectedOptions,
        itemTotal,
      };
      set({ items: [...get().items, newItem], selectedMenuForOption: null });
    }
  },

  removeItem: (itemId) => {
    set({ items: get().items.filter((i) => i.id !== itemId) });
  },

  updateQuantity: (itemId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(itemId);
      return;
    }
    set({
      items: get().items.map((i) =>
        i.id === itemId
          ? { ...i, quantity, itemTotal: i.unitPrice * quantity }
          : i
      ),
    });
  },

  clearCart: () => set({ items: [] }),

  getTotalAmount: () => {
    return get().items.reduce((sum, item) => sum + item.itemTotal, 0);
  },

  getTotalCount: () => {
    return get().items.reduce((sum, item) => sum + item.quantity, 0);
  },
}));
