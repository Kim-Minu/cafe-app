import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
  }).format(price);
}

export function formatSimplePrice(price: number): string {
  return `${price.toLocaleString('ko-KR')}원`;
}

export function formatElapsedMinutes(createdAt: string | Date): string {
  const created = new Date(createdAt).getTime();
  const now = Date.now();
  const diffSec = Math.floor((now - created) / 1000);
  const minutes = Math.floor(diffSec / 60);
  const seconds = diffSec % 60;
  return `${minutes}분 ${seconds < 10 ? '0' : ''}${seconds}초`;
}
