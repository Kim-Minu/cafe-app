'use client';

import { useState, useEffect } from 'react';
import { Download, Share2, PlusSquare, X, Smartphone, QrCode } from 'lucide-react';
import { QRCodeModal } from './QRCodeModal';

export function PWAInstallGuide() {
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [isIOSGuideOpen, setIsIOSGuideOpen] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check if already in standalone PWA mode
    const isStandaloneMode =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;

    setIsStandalone(isStandaloneMode);

    // If already running as installed app, do not show install banners
    if (isStandaloneMode) return;

    // Detect OS
    const ua = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(ua);
    const isAndroidDevice = /android/.test(ua);

    setIsIOS(isIosDevice);
    setIsAndroid(isAndroidDevice);

    // Only show banner on mobile browsers
    if (isIosDevice || isAndroidDevice) {
      const dismissed = sessionStorage.getItem('pwa_banner_dismissed');
      if (!dismissed) {
        setShowBanner(true);
      }
    }

    // Android Chrome beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowBanner(false);
      }
      setDeferredPrompt(null);
    } else if (isIOS) {
      setIsIOSGuideOpen(true);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    sessionStorage.setItem('pwa_banner_dismissed', 'true');
  };

  return (
    <>
      {/* Floating QR Code quick button on Desktop & Mobile */}
      <div className="fixed bottom-20 md:bottom-6 right-4 z-40">
        <button
          type="button"
          onClick={() => setShowQRModal(true)}
          className="bg-[#1e4033] text-white hover:bg-[#274f3e] px-3.5 py-2.5 rounded-full shadow-lg flex items-center gap-2 border border-white/20 transition-all hover:scale-105 active:scale-95 cursor-pointer text-xs font-bold"
          title="스마트폰 접속 QR 코드"
        >
          <QrCode className="w-4 h-4" />
          <span className="hidden sm:inline">스마트폰 QR 접속</span>
        </button>
      </div>

      {/* Mobile PWA Install Banner */}
      {showBanner && !isStandalone && (
        <aside
          aria-label="앱 설치 안내"
          className="fixed top-2 inset-x-3 z-50 max-w-md mx-auto bg-[#1e4033] text-white p-3.5 rounded-2xl shadow-2xl border border-white/10 animate-slide-down flex items-center justify-between gap-3 font-sans"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
              <Smartphone className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <p className="text-xs font-black">홈 화면에 카페코어 추가</p>
              <p className="text-[10px] text-stone-300">
                {isIOS
                  ? 'Safari 공유 버튼을 눌러 홈 화면에 추가'
                  : '앱으로 설치하여 언제든 빠르게 주문하세요'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={handleInstallClick}
              className="px-3 py-1.5 bg-white text-[#1e4033] hover:bg-stone-100 rounded-lg text-xs font-black shadow-xs transition-colors cursor-pointer"
            >
              {isIOS ? '설치 방법' : '앱 설치'}
            </button>
            <button
              type="button"
              onClick={handleDismiss}
              className="w-7 h-7 rounded-lg text-white/70 hover:text-white flex items-center justify-center cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </aside>
      )}

      {/* iOS Safari Add to Home Screen Instructions Modal */}
      {isIOSGuideOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-fade-in font-sans">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl text-center relative border border-stone-200">
            <button
              type="button"
              onClick={() => setIsIOSGuideOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-stone-100 text-stone-500 hover:text-stone-900 flex items-center justify-center cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-[#e8ece7] text-[#1e4033] flex items-center justify-center mx-auto mb-3">
              <Smartphone className="w-6 h-6" />
            </div>

            <h3 className="text-base font-black text-stone-900 mb-1">
              iOS 홈 화면에 추가하기
            </h3>
            <p className="text-xs text-stone-500 mb-5">
              Safari 브라우저에서 아래 순서대로 진행하시면
              <br />
              홈 화면에 전용 앱 아이콘이 생성됩니다.
            </p>

            <div className="space-y-3 text-left mb-6">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-stone-50 border border-stone-100">
                <div className="w-8 h-8 rounded-lg bg-white border border-stone-200 flex items-center justify-center shrink-0 font-black text-xs text-[#1e4033]">
                  1
                </div>
                <div className="text-xs text-stone-700">
                  Safari 하단 메뉴의 <span className="font-bold">공유 버튼</span>(
                  <Share2 className="w-3.5 h-3.5 inline text-sky-600 mb-0.5" />)을 터치합니다.
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-stone-50 border border-stone-100">
                <div className="w-8 h-8 rounded-lg bg-white border border-stone-200 flex items-center justify-center shrink-0 font-black text-xs text-[#1e4033]">
                  2
                </div>
                <div className="text-xs text-stone-700">
                  목록을 내려 <span className="font-bold">‘홈 화면에 추가’</span>(
                  <PlusSquare className="w-3.5 h-3.5 inline text-stone-700 mb-0.5" />)를 선택합니다.
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-stone-50 border border-stone-100">
                <div className="w-8 h-8 rounded-lg bg-white border border-stone-200 flex items-center justify-center shrink-0 font-black text-xs text-[#1e4033]">
                  3
                </div>
                <div className="text-xs text-stone-700">
                  우측 상단의 <span className="font-bold text-[#1e4033]">‘추가’</span> 버튼을 누르면 완료됩니다.
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsIOSGuideOpen(false)}
              className="w-full py-3 bg-[#1e4033] text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer hover:bg-[#274f3e]"
            >
              확인
            </button>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      <QRCodeModal isOpen={showQRModal} onClose={() => setShowQRModal(false)} />
    </>
  );
}
