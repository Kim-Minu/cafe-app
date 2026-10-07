'use client';

import { MenuItem } from '@/types/cafe';
import { Plus } from 'lucide-react';
import Image from 'next/image';

interface MobileMenuItemCardProps {
  menu: MenuItem;
  onSelect: (menu: MenuItem) => void;
}

export function MobileMenuItemCard({ menu, onSelect }: MobileMenuItemCardProps) {
  const handleClick = () => {
    if (menu.isSoldOut) return;
    onSelect(menu);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (menu.isSoldOut) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect(menu);
    }
  };

  return (
    <div
      role="button"
      tabIndex={menu.isSoldOut ? -1 : 0}
      aria-disabled={menu.isSoldOut}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={`group relative w-full text-left bg-white rounded-3xl border border-[#e8ece7] p-3 shadow-xs transition-colors flex flex-col justify-between cursor-pointer hover:shadow-md hover:border-[#1e4033]/30 touch-manipulation ${
        menu.isSoldOut
          ? 'opacity-50 cursor-not-allowed'
          : 'active:bg-stone-50 active:border-[#1e4033]/50'
      }`}
    >
      {/* Top badges */}
      <div className="flex items-center justify-between w-full h-6 mb-1">
        {menu.isPopular && !menu.isSoldOut ? (
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#274f3e] text-white">
            추천
          </span>
        ) : (
          <div />
        )}
        {menu.isSoldOut && (
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-600">
            품절
          </span>
        )}
      </div>

      {/* Drink Image */}
      <div className="relative w-full h-36 flex items-center justify-center my-1">
        <Image
          src={menu.imageUrl}
          alt={menu.name}
          width={130}
          height={140}
          className="object-contain max-h-36 drop-shadow-sm group-hover:scale-105 transition-transform duration-200"
          unoptimized
        />
      </div>

      {/* Item Info & Plus Button */}
      <div className="mt-2 pt-2 flex items-end justify-between w-full">
        <div>
          <h3 className="font-bold text-[#191c1b] text-base leading-snug">
            {menu.name}
          </h3>
          <p className="text-sm font-semibold text-[#191c1b] mt-0.5">
            {menu.basePrice.toLocaleString()}원
          </p>
        </div>

        <span
          className="w-8 h-8 rounded-full bg-[#1e4033] group-hover:bg-[#274f3e] text-white flex items-center justify-center shadow-xs shrink-0"
          aria-hidden="true"
        >
          <Plus className="w-4 h-4" />
        </span>
      </div>
    </div>
  );
}
