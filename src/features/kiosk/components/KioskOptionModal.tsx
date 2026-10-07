'use client';

import { useState, useEffect } from 'react';
import { MenuItem, SelectedOption } from '@/types/cafe';
import { useKioskCartStore } from '../store/kioskCartStore';
import { formatSimplePrice } from '@/lib/utils';
import { X, Plus, Minus, Check } from 'lucide-react';

interface KioskOptionModalProps {
  menu: MenuItem | null;
  onClose: () => void;
}

export function KioskOptionModal({ menu, onClose }: KioskOptionModalProps) {
  const addItem = useKioskCartStore((state) => state.addItem);
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<SelectedOption[]>([]);

  useEffect(() => {
    if (!menu) return;
    setQuantity(1);

    const initial: SelectedOption[] = [];
    menu.optionGroups.forEach((group) => {
      const def =
        group.options.find((o) => o.isDefault) ||
        (group.isRequired ? group.options[0] : null);
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

  const handleToggle = (
    groupId: string,
    groupName: string,
    optionId: string,
    optionName: string,
    additionalPrice: number,
    isRequired: boolean,
    maxSelect: number
  ) => {
    const existing = selectedOptions.filter((o) => o.groupId === groupId);
    const isSelected = existing.some((o) => o.optionId === optionId);

    if (maxSelect === 1) {
      const others = selectedOptions.filter((o) => o.groupId !== groupId);
      if (isSelected && !isRequired) {
        setSelectedOptions(others);
      } else {
        setSelectedOptions([
          ...others,
          { groupId, groupName, optionId, optionName, additionalPrice },
        ]);
      }
    } else {
      if (isSelected) {
        setSelectedOptions(
          selectedOptions.filter(
            (o) => !(o.groupId === groupId && o.optionId === optionId)
          )
        );
      } else {
        if (existing.length >= maxSelect) return;
        setSelectedOptions([
          ...selectedOptions,
          { groupId, groupName, optionId, optionName, additionalPrice },
        ]);
      }
    }
  };

  const handleAdd = () => {
    addItem(menu, quantity, selectedOptions);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-fade-in">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative z-10 w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-stone-100 bg-stone-50/50">
          <div className="flex items-center gap-4">
            <img
              src={menu.imageUrl}
              alt={menu.name}
              className="w-16 h-16 rounded-2xl object-cover shadow-xs"
            />
            <div>
              <h3 className="text-2xl font-black text-stone-900">{menu.name}</h3>
              <p className="text-sm text-stone-500">{menu.description}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-12 h-12 rounded-2xl bg-stone-100 text-stone-500 hover:bg-stone-200 flex items-center justify-center transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Scrollable Option Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {menu.optionGroups.map((group) => {
            const selectedInGroup = selectedOptions.filter(
              (o) => o.groupId === group.id
            );

            return (
              <div key={group.id} className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-base font-bold text-stone-800">
                    {group.name}
                  </h4>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-stone-100 text-stone-600">
                    {group.isRequired ? '필수 선택' : '선택'}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {group.options.map((opt) => {
                    const isChecked = selectedInGroup.some(
                      (o) => o.optionId === opt.id
                    );

                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() =>
                          handleToggle(
                            group.id,
                            group.name,
                            opt.id,
                            opt.name,
                            opt.additionalPrice,
                            group.isRequired,
                            group.maxSelect
                          )
                        }
                        className={`flex flex-col justify-between p-4 rounded-2xl border text-left transition-all ${
                          isChecked
                            ? 'border-[#1e4033] bg-[#e8ece7] text-[#1e4033] font-bold ring-2 ring-[#1e4033] shadow-xs'
                            : 'border-[#e8ece7] hover:border-stone-300 text-stone-700 bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full mb-2">
                          <span className="text-base">{opt.name}</span>
                          <div
                            className={`w-5 h-5 rounded-full flex items-center justify-center border text-[11px] ${
                              isChecked
                                ? 'bg-[#1e4033] border-[#1e4033] text-white'
                                : 'border-stone-300'
                            }`}
                          >
                            {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>
                        </div>

                        <span className="text-sm font-extrabold text-[#1e4033]">
                          {opt.additionalPrice !== 0
                            ? opt.additionalPrice > 0
                              ? `+${formatSimplePrice(opt.additionalPrice)}`
                              : formatSimplePrice(opt.additionalPrice)
                            : '추가금 없음'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Bar */}
        <div className="p-6 border-t border-[#e8ece7] bg-[#f7f6f0] flex items-center justify-between gap-6">
          <div className="flex items-center gap-4 bg-white border border-[#e8ece7] rounded-2xl p-2 shadow-xs">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={quantity <= 1}
              className="w-12 h-12 rounded-xl bg-stone-100 flex items-center justify-center text-stone-700 hover:bg-stone-200 disabled:opacity-40"
            >
              <Minus className="w-5 h-5 stroke-[2.5]" />
            </button>
            <span className="text-xl font-black w-8 text-center text-stone-900">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="w-12 h-12 rounded-xl bg-stone-100 flex items-center justify-center text-stone-700 hover:bg-stone-200"
            >
              <Plus className="w-5 h-5 stroke-[2.5]" />
            </button>
          </div>

          <button
            onClick={handleAdd}
            className="flex-1 py-4 px-6 bg-[#1e4033] hover:bg-[#274f3e] text-white rounded-2xl font-black text-lg shadow-lg flex items-center justify-between transition-colors"
          >
            <span>장바구니 담기</span>
            <span className="text-2xl font-black">{formatSimplePrice(totalPrice)}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
