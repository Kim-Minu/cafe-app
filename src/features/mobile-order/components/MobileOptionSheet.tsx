'use client';

import { useState, useEffect } from 'react';
import { MenuItem, SelectedOption } from '@/types/cafe';
import { useMobileCartStore } from '../store/cartStore';
import { formatSimplePrice } from '@/lib/utils';
import { X, Plus, Minus, Check } from 'lucide-react';

interface MobileOptionSheetProps {
  menu: MenuItem | null;
  onClose: () => void;
}

export function MobileOptionSheet({ menu, onClose }: MobileOptionSheetProps) {
  const addItem = useMobileCartStore((state) => state.addItem);
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<SelectedOption[]>([]);

  // Initialize default options when menu opens
  useEffect(() => {
    if (!menu) return;
    setQuantity(1);

    const initial: SelectedOption[] = [];
    (menu.optionGroups || []).forEach((group) => {
      const def =
        (group.options || []).find((o) => o.isDefault) ||
        (group.isRequired && (group.options || []).length > 0 ? (group.options || [])[0] : null);
      if (def) {
        initial.push({
          groupId: group.id,
          groupName: group.name,
          optionId: def.id,
          optionName: def.name,
          additionalPrice: def.additionalPrice,
        });
      }
    });
    setSelectedOptions(initial);
  }, [menu]);

  if (!menu) return null;

  const additionalSum = selectedOptions.reduce(
    (sum, opt) => sum + opt.additionalPrice,
    0
  );
  const unitPrice = menu.basePrice + additionalSum;
  const totalPrice = unitPrice * quantity;

  const handleSelectOption = (
    groupId: string,
    groupName: string,
    optionId: string,
    optionName: string,
    additionalPrice: number,
    isRequired: boolean,
    maxSelect: number
  ) => {
    const existingInGroup = selectedOptions.filter((o) => o.groupId === groupId);
    const isAlreadySelected = existingInGroup.some((o) => o.optionId === optionId);

    if (maxSelect === 1) {
      // Single select: replace option in this group
      const others = selectedOptions.filter((o) => o.groupId !== groupId);
      if (isAlreadySelected && !isRequired) {
        // Can uncheck if optional
        setSelectedOptions(others);
      } else {
        setSelectedOptions([
          ...others,
          { groupId, groupName, optionId, optionName, additionalPrice },
        ]);
      }
    } else {
      // Multi select
      if (isAlreadySelected) {
        setSelectedOptions(
          selectedOptions.filter(
            (o) => !(o.groupId === groupId && o.optionId === optionId)
          )
        );
      } else {
        if (existingInGroup.length >= maxSelect) {
          return; // Max reached
        }
        setSelectedOptions([
          ...selectedOptions,
          { groupId, groupName, optionId, optionName, additionalPrice },
        ]);
      }
    }
  };

  const handleAddToCart = () => {
    addItem(menu, quantity, selectedOptions);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm transition-opacity">
      {/* Backdrop click button */}
      <button
        type="button"
        aria-label="닫기"
        className="absolute inset-0 w-full h-full bg-transparent border-0 cursor-pointer"
        onClick={onClose}
      />

      {/* Sheet Content */}
      <div className="relative z-10 w-full max-w-lg rounded-t-3xl bg-white p-5 shadow-2xl max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <div>
            <h3 className="text-xl font-bold text-stone-900">{menu.name}</h3>
            {menu.englishName && (
              <p className="text-xs text-stone-500">{menu.englishName}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-stone-400 hover:bg-stone-100 hover:text-stone-700 cursor-pointer touch-manipulation"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Option List */}
        <div className="overflow-y-auto py-4 space-y-5 flex-1 pr-1">
          {menu.optionGroups.map((group) => {
            const selectedInGroup = selectedOptions.filter(
              (o) => o.groupId === group.id
            );

            return (
              <div key={group.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-stone-800">
                    {group.name}
                  </span>
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-stone-100 text-stone-600">
                    {group.isRequired ? '필수' : '선택'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {group.options.map((opt) => {
                    const isChecked = selectedInGroup.some(
                      (o) => o.optionId === opt.id
                    );

                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() =>
                          handleSelectOption(
                            group.id,
                            group.name,
                            opt.id,
                            opt.name,
                            opt.additionalPrice,
                            group.isRequired,
                            group.maxSelect
                          )
                        }
                        className={`flex items-center justify-between p-3 rounded-xl border text-left text-sm transition-colors cursor-pointer touch-manipulation active:bg-[#e8ece7]/70 ${
                          isChecked
                            ? 'border-[#1e4033] bg-[#e8ece7] text-[#1e4033] font-bold ring-1 ring-[#1e4033]'
                            : 'border-[#e8ece7] hover:border-stone-300 text-stone-700 bg-white'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <div
                            className={`w-4 h-4 rounded-full flex items-center justify-center border text-[10px] ${
                              isChecked
                                ? 'bg-[#1e4033] border-[#1e4033] text-white'
                                : 'border-stone-300'
                            }`}
                          >
                            {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                          <span className="truncate">{opt.name}</span>
                        </div>
                        {opt.additionalPrice !== 0 && (
                          <span className="text-xs text-[#1e4033] font-bold shrink-0 ml-1">
                            {opt.additionalPrice > 0
                              ? `+${formatSimplePrice(opt.additionalPrice)}`
                              : formatSimplePrice(opt.additionalPrice)}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Quantity Selector */}
          <div className="flex items-center justify-between border-t border-[#e8ece7] pt-4">
            <span className="text-sm font-semibold text-stone-800">수량 선택</span>
            <div className="flex items-center gap-3 bg-[#e8ece7] rounded-full px-3 py-1.5">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
                className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-stone-600 shadow-xs disabled:opacity-40 cursor-pointer touch-manipulation active:opacity-70"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-6 text-center font-bold text-stone-900 text-sm">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity(quantity + 1)}
                className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-stone-600 shadow-xs cursor-pointer touch-manipulation active:opacity-70"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-t border-[#e8ece7] pt-4">
          <button
            type="button"
            onClick={handleAddToCart}
            className="w-full flex items-center justify-between py-3.5 px-5 bg-[#1e4033] hover:bg-[#274f3e] text-white font-bold rounded-2xl shadow-md transition-colors cursor-pointer touch-manipulation active:opacity-85"
          >
            <span>{quantity}개 담기</span>
            <span className="text-lg font-black">{formatSimplePrice(totalPrice)}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
