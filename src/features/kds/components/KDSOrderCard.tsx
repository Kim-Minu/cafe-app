'use client';

import { useState } from 'react';
import { Order, OrderStatus } from '@/types/cafe';
import { Check } from 'lucide-react';
import Image from 'next/image';

interface KDSOrderCardProps {
  order: Order;
  onUpdateStatus: (orderId: string, status: OrderStatus) => void;
}

export function KDSOrderCard({ order, onUpdateStatus }: KDSOrderCardProps) {
  const [checkedItemIds, setCheckedItemIds] = useState<Record<string, boolean>>({});

  const toggleCheck = (itemId: string) => {
    setCheckedItemIds((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };

  const elapsedMinutes = Math.max(
    0,
    Math.floor((Date.now() - new Date(order.createdAt).getTime()) / 60000)
  );

  const isPending = order.status === 'PENDING';
  const isPreparing = order.status === 'PREPARING';
  const allItemsChecked = order.items.every((it) => checkedItemIds[it.id]);

  // Image fallback mapping
  const getImageSrc = (item: any) => {
    const name = item.menuName;
    if (name.includes('아메리카노')) return '/images/americano.png';
    if (name.includes('바닐라')) return '/images/vanilla_latte.png';
    if (name.includes('라떼')) return '/images/latte.png';
    if (name.includes('콜드브루')) return '/images/coldbrew.png';
    if (name.includes('말차')) return '/images/matcha_latte.png';
    if (name.includes('얼그레이')) return '/images/earlgrey.png';
    if (name.includes('레몬')) return '/images/lemon_ade.png';
    if (name.includes('자몽')) return '/images/grapefruit_ade.png';
    return '/images/americano.png';
  };

  return (
    <div className="bg-white rounded-2xl border border-[#e8ece7] p-5 shadow-xs flex flex-col justify-between transition-all hover:shadow-md">
      {/* Card Header matching screen_3.png */}
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-[#f2f4f1]">
          <div className="flex items-center gap-3">
            <span className="font-extrabold text-2xl text-[#191c1b]">
              #{order.orderNumber}
            </span>
            {isPreparing ? (
              <span className="bg-[#fef3c7] text-[#92400e] px-3 py-1 rounded-full text-xs font-bold">
                제조 중
              </span>
            ) : isPending ? (
              <span className="bg-[#e8ece7] text-[#4a5550] px-3 py-1 rounded-full text-xs font-bold">
                주문 접수
              </span>
            ) : (
              <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-xs font-bold">
                픽업 가능
              </span>
            )}
          </div>

          <span className="text-xs font-semibold text-stone-500">
            접수 후 {elapsedMinutes}분
          </span>
        </div>

        {/* Item Checklist matching screen_3.png */}
        <div className="py-4 space-y-3.5 divide-y divide-[#f5f6f4]">
          {order.items.map((item) => {
            const isChecked = !!checkedItemIds[item.id];
            const optText = item.selectedOptions.map((o) => o.optionName).join(' · ');

            return (
              <div
                key={item.id}
                onClick={() => toggleCheck(item.id)}
                className="pt-3.5 first:pt-0 flex items-center gap-3 cursor-pointer group select-none"
              >
                {/* Custom Checkbox */}
                <div
                  className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${
                    isChecked
                      ? 'bg-[#1e4033] border-[#1e4033] text-white'
                      : 'border-stone-300 group-hover:border-stone-400 bg-white'
                  }`}
                >
                  {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>

                {/* Thumbnail */}
                <div className="relative w-11 h-12 shrink-0 flex items-center justify-center">
                  <Image
                    src={getImageSrc(item)}
                    alt={item.menuName}
                    width={44}
                    height={48}
                    className="object-contain max-h-12 drop-shadow-2xs"
                    unoptimized
                  />
                </div>

                {/* Name & Options */}
                <div className="flex-1">
                  <div
                    className={`font-bold text-base leading-tight transition-all ${
                      isChecked ? 'text-stone-400 line-through' : 'text-[#191c1b]'
                    }`}
                  >
                    {item.menuName} × {item.quantity}
                  </div>
                  {optText && (
                    <div className="text-xs text-stone-500 font-medium mt-0.5">
                      {optText}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {order.customerNote && (
          <div className="mb-3 px-3 py-2 rounded-xl bg-amber-50 text-amber-900 border border-amber-200 text-xs font-medium">
            요청: {order.customerNote}
          </div>
        )}
      </div>

      {/* Action Button matching screen_3.png */}
      <div className="pt-2">
        {isPending && (
          <button
            type="button"
            onClick={() => onUpdateStatus(order.id, 'PREPARING')}
            className="w-full py-3.5 bg-[#1e4033] hover:bg-[#274f3e] text-white rounded-xl font-bold text-sm shadow-xs transition active:scale-98"
          >
            제조 시작
          </button>
        )}

        {isPreparing && (
          <button
            type="button"
            onClick={() => onUpdateStatus(order.id, 'READY')}
            className={`w-full py-3.5 rounded-xl font-bold text-sm shadow-xs transition active:scale-98 ${
              allItemsChecked
                ? 'bg-[#1e4033] hover:bg-[#274f3e] text-white'
                : 'bg-[#dce5dd] text-[#1e4033] hover:bg-[#d0dbd2]'
            }`}
          >
            픽업 준비 완료
          </button>
        )}

        {order.status === 'READY' && (
          <button
            type="button"
            onClick={() => onUpdateStatus(order.id, 'COMPLETED')}
            className="w-full py-3.5 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-xl font-bold text-sm transition"
          >
            고객 수령 완료
          </button>
        )}
      </div>
    </div>
  );
}
