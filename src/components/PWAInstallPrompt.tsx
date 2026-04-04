'use client';

import { useState, useEffect } from 'react';

type Platform = 'ios' | 'android' | null;

// Detect platform
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(console.error);
    }

    if (isStandalone()) return; // Already installed
    if (localStorage.getItem('pwa-install-dismissed')) return;

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
    localStorage.setItem('pwa-install-dismissed', 'true');
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
        // iOS — manual instructions
        <div className="bg-primary/5 border border-primary/10 rounded-xl p-4 flex items-start gap-4">
          <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-primary">ios_share</span>
          </div>
          <div className="flex-1">
            <p className="font-bold text-on-surface text-sm">Install Second Brain</p>
            <p className="text-xs text-on-surface-variant mt-1">
              Tap <strong>Share</strong> <span className="material-symbols-outlined text-xs align-middle">ios_share</span> → <strong>Add to Home Screen</strong>
            </p>
          </div>
          <button onClick={handleDismiss} className="text-on-surface-variant flex-shrink-0">
            <span className="material-symbols-outlined text-base">close</span>
          </button>
        </div>
      )}
    </div>
  );
}
