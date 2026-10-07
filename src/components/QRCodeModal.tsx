'use client';

import { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import {
  QrCode,
  X,
  Download,
  Smartphone,
  Copy,
  Check,
  ExternalLink,
  Layers,
} from 'lucide-react';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultUrl?: string;
  tableNumber?: string;
}

export function QRCodeModal({
  isOpen,
  onClose,
  defaultUrl,
  tableNumber,
}: QRCodeModalProps) {
  const [url, setUrl] = useState('');
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [selectedTable, setSelectedTable] = useState(tableNumber || '');
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let targetUrl = defaultUrl || window.location.origin;
    if (selectedTable) {
      targetUrl = `${window.location.origin}/table/${selectedTable}`;
    } else if (!defaultUrl) {
      targetUrl = `${window.location.origin}/order`;
    }
    setUrl(targetUrl);

    QRCode.toDataURL(targetUrl, {
      width: 400,
      margin: 2,
      color: {
        dark: '#1e4033',
        light: '#ffffff',
      },
    })
      .then((dataUri) => {
        setQrDataUrl(dataUri);
      })
      .catch((err) => {
        console.error('QR 코드 생성 실패:', err);
      });
  }, [isOpen, defaultUrl, selectedTable]);

  if (!isOpen) return null;

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const handleDownloadQR = () => {
    if (!qrDataUrl) return;
    const link = document.createElement('a');
    link.download = `cafecore-qr${selectedTable ? `-table-${selectedTable}` : ''}.png`;
    link.href = qrDataUrl;
    link.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-fade-in font-sans">
      <div className="relative w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl text-center border border-[#e8ece7]">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-stone-100 text-stone-500 hover:text-stone-900 flex items-center justify-center cursor-pointer transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="flex items-center justify-center gap-2 mb-1 text-[#1e4033]">
          <Smartphone className="w-5 h-5" />
          <h3 className="text-base font-black text-stone-900">
            스마트폰 카메라로 접속
          </h3>
        </div>
        <p className="text-xs text-stone-500 mb-5">
          휴대폰 기본 카메라 앱을 켜서 QR 코드를 비추면
          <br />
          모바일 주문 화면으로 바로 연결됩니다.
        </p>

        {/* QR Code Canvas / Image */}
        <div className="bg-[#f7f6f0] p-4 rounded-2xl border border-[#e8ece7] inline-block mb-4 shadow-inner">
          {qrDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={qrDataUrl}
              alt="모바일 접속 QR 코드"
              className="w-56 h-56 mx-auto rounded-xl shadow-xs"
            />
          ) : (
            <div className="w-56 h-56 flex items-center justify-center text-xs text-stone-400">
              QR 코드 생성 중...
            </div>
          )}
        </div>

        {/* Table Selector (Optional for manager / table testing) */}
        <div className="mb-4">
          <label className="text-[11px] font-bold text-stone-600 block mb-1.5 text-left">
            테이블 지정 (선택)
          </label>
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {['', '1', '2', '3', '4', '5'].map((tbl) => (
              <button
                key={tbl}
                type="button"
                onClick={() => setSelectedTable(tbl)}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition-all cursor-pointer shrink-0 ${
                  selectedTable === tbl
                    ? 'bg-[#1e4033] text-white border-[#1e4033]'
                    : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
                }`}
              >
                {tbl ? `테이블 ${tbl}` : '일반 주문'}
              </button>
            ))}
          </div>
        </div>

        {/* Current URL Bar */}
        <div className="flex items-center gap-1.5 bg-stone-50 border border-stone-200 rounded-xl px-2.5 py-1.5 mb-4 text-left">
          <span className="text-[10px] text-stone-500 font-mono truncate flex-1">
            {url}
          </span>
          <button
            type="button"
            onClick={handleCopyUrl}
            title="URL 복사"
            className="p-1 rounded-md text-stone-600 hover:bg-white transition-colors cursor-pointer"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleDownloadQR}
            className="flex-1 py-2.5 bg-[#1e4033] hover:bg-[#274f3e] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>QR 이미지 저장</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
