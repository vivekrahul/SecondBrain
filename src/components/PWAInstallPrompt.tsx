'use client';

import { useState, useEffect } from 'react';

type Platform = 'ios' | 'android' | null;

function detectPlatform(): Platform {
  if (typeof navigator === 'undefined') return null;
  const ua = navigator.userAgent;
  if (/iPad|iPhone|iPod/.test(ua)) return 'ios';
  if (/android/i.test(ua)) return 'android';
  return null;
}

function isStandalone(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    ('standalone' in navigator && !!(navigator as unknown as { standalone: boolean }).standalone)
  );
}

export default function PWAInstallPrompt() {
  const [platform, setPlatform] = useState<Platform>(null);
  const [show, setShow] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(console.error);
    }

    if (isStandalone()) return; // Already installed

    // For iOS: only suppress for 3 days, not forever
    const dismissedAt = localStorage.getItem('pwa-install-dismissed-at');
    if (dismissedAt) {
      const threeDaysMs = 3 * 24 * 60 * 60 * 1000;
      if (Date.now() - parseInt(dismissedAt, 10) < threeDaysMs) return;
    }

    const detected = detectPlatform();
    setPlatform(detected);

    // Android: listen for Chrome's native install prompt
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      if (detected === 'android') setShow(true);
    };
    window.addEventListener('beforeinstallprompt', handler);

    // iOS: always show the manual instructions
    if (detected === 'ios') setShow(true);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleAndroidInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setShow(false);
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShow(false);
    setShowIOSGuide(false);
    // Store timestamp instead of boolean so we can re-show after 3 days
    localStorage.setItem('pwa-install-dismissed-at', Date.now().toString());
  };

  if (!show) return null;

  return (
    <div className="animate-fade-in-up">
      {platform === 'android' ? (
        // Android — native install prompt button
        <div className="bg-primary/5 border border-primary/10 rounded-xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-primary">install_mobile</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-on-surface text-sm">Install Second Brain</p>
            <p className="text-xs text-on-surface-variant">Add to home screen for the best experience</p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <button
              onClick={handleAndroidInstall}
              className="px-4 py-2 bg-primary text-white rounded-lg text-xs font-bold active:scale-95 transition-all"
            >
              Install
            </button>
            <button onClick={handleDismiss} className="p-2 text-on-surface-variant hover:text-on-surface">
              <span className="material-symbols-outlined text-base">close</span>
            </button>
          </div>
        </div>
      ) : (
        // iOS — step-by-step instructions
        <div className="bg-primary/5 border border-primary/10 rounded-xl overflow-hidden">
          {/* Collapsed banner */}
          <div className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-primary">ios_share</span>
            </div>
            <div className="flex-1">
              <p className="font-bold text-on-surface text-sm">Install Second Brain</p>
              <p className="text-xs text-on-surface-variant mt-0.5">Use it like a native app on your iPhone</p>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button
                onClick={() => setShowIOSGuide(!showIOSGuide)}
                className="px-4 py-2 bg-primary text-white rounded-lg text-xs font-bold active:scale-95 transition-all"
              >
                {showIOSGuide ? 'Hide' : 'How?'}
              </button>
              <button onClick={handleDismiss} className="p-2 text-on-surface-variant hover:text-on-surface">
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>
          </div>

          {/* Expandable step-by-step guide */}
          {showIOSGuide && (
            <div className="px-4 pb-4 pt-1 border-t border-primary/10 animate-fade-in-up">
              <div className="space-y-3 mt-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">1</div>
                  <p className="text-sm text-on-surface">
                    Tap the <strong>Share</strong> button <span className="material-symbols-outlined text-sm align-middle text-primary">ios_share</span> at the bottom of Safari
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">2</div>
                  <p className="text-sm text-on-surface">
                    Scroll down and tap <strong>&quot;Add to Home Screen&quot;</strong> <span className="material-symbols-outlined text-sm align-middle text-primary">add_box</span>
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">3</div>
                  <p className="text-sm text-on-surface">
                    Tap <strong>&quot;Add&quot;</strong> in the top right corner
                  </p>
                </div>
              </div>
              <p className="text-[11px] text-on-surface-variant/60 mt-3 text-center">
                iOS doesn&apos;t support native install — this is the official Apple way
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
