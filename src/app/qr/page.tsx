'use client';

import { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import Link from 'next/link';
import { Smartphone, Download, Coffee, ArrowLeft, Home, Copy, Check } from 'lucide-react';

export default function QRScanPage() {
  const [url, setUrl] = useState('');
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [table, setTable] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const base = window.location.origin;
    const target = table ? `${base}/table/${table}` : `${base}/order`;
    setUrl(target);

    QRCode.toDataURL(target, {
      width: 512,
      margin: 2,
      color: {
        dark: '#1e4033',
        light: '#ffffff',
      },
    }).then(setQrDataUrl);
  }, [table]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const handleDownload = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.download = `cafecore-qr${table ? `-table-${table}` : ''}.png`;
    a.href = qrDataUrl;
    a.click();
  };

  return (
    <div className="min-h-screen bg-[#f7f6f0] flex flex-col justify-between p-6 font-sans select-none">
      {/* Top Header */}
      <header className="max-w-md w-full mx-auto flex items-center justify-between pb-4">
        <Link
          href="/"
          className="w-10 h-10 rounded-full bg-white border border-[#e8ece7] flex items-center justify-center text-stone-600 hover:text-black shadow-xs cursor-pointer"
        >
          <Home className="w-5 h-5" />
        </Link>
        <div className="text-center">
          <h1 className="text-lg font-black text-stone-900">모바일 QR 주문 안내</h1>
          <p className="text-[11px] text-stone-500">카메라를 켜서 QR을 스캔하세요</p>
        </div>
        <div className="w-10" />
      </header>

      {/* Main Content */}
      <main className="max-w-md w-full mx-auto my-auto bg-white rounded-3xl border border-[#e8ece7] p-8 shadow-xl text-center">
        <div className="w-14 h-14 rounded-2xl bg-[#1e4033] text-white flex items-center justify-center mx-auto mb-4 shadow-sm">
          <Coffee className="w-8 h-8" />
        </div>

        <h2 className="text-xl font-black text-stone-900 mb-1">스마트폰으로 간편 주문</h2>
        <p className="text-xs text-stone-500 mb-6 leading-relaxed">
          카메라 앱으로 아래 QR 코드를 비추면
          <br />
          줄 서지 않고 자리에서 바로 메뉴를 주문할 수 있습니다.
        </p>

        {/* QR Frame */}
        <div className="p-4 bg-[#f7f6f0] rounded-3xl border border-[#e8ece7] inline-block mb-6 shadow-inner">
          {qrDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={qrDataUrl}
              alt="모바일 주문 QR 코드"
              className="w-64 h-64 mx-auto rounded-2xl shadow-sm"
            />
          ) : (
            <div className="w-64 h-64 flex items-center justify-center text-xs text-stone-400">
              생성 중...
            </div>
          )}
        </div>

        {/* Table Selector */}
        <div className="mb-6">
          <p className="text-xs font-bold text-stone-700 mb-2">테이블 번호 지정</p>
          <div className="flex gap-2 justify-center flex-wrap">
            {['', '1', '2', '3', '4', '5'].map((tbl) => (
              <button
                key={tbl}
                type="button"
                onClick={() => setTable(tbl)}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                  table === tbl
                    ? 'bg-[#1e4033] text-white border-[#1e4033] shadow-xs'
                    : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                }`}
              >
                {tbl ? `테이블 ${tbl}` : '일반'}
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleDownload}
            className="flex-1 py-3 bg-[#1e4033] hover:bg-[#274f3e] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>QR 코드 이미지 다운로드</span>
          </button>
          <button
            type="button"
            onClick={handleCopy}
            className="px-4 py-3 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? '복사됨' : 'URL 복사'}</span>
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-md w-full mx-auto text-center pt-4">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1e4033] hover:underline"
        >
          <Home className="w-4 h-4" />
          <span>홈으로 돌아가기</span>
        </Link>
      </footer>
    </div>
  );
}
