'use client';

import { useState, useEffect } from 'react';

export default function IOSInstallBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Detect iOS Safari not in standalone mode
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      || ('standalone' in navigator && (navigator as unknown as { standalone: boolean }).standalone);
    
    if (isIOS && !isStandalone) {
      // Check if user has dismissed before
      const dismissed = localStorage.getItem('ios-install-dismissed');
      if (!dismissed) {
        setShow(true);
      }
    }
  }, []);

  const handleDismiss = () => {
    setShow(false);
    localStorage.setItem('ios-install-dismissed', 'true');
  };

  if (!show) return null;

  return (
    <section className="mt-4 animate-fade-in-up">
      <div className="bg-primary-container/20 border border-primary-container/10 p-5 rounded-lg flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="bg-white p-2 rounded-xl shadow-sm">
            <span className="material-symbols-outlined text-primary">ios_share</span>
          </div>
          <p className="text-sm font-medium text-on-primary-container">
            Tap Share &gt; Add to Home Screen to install this app.
          </p>
        </div>
        <button
          onClick={handleDismiss}
          className="text-on-primary-container/50 hover:text-on-primary-container transition-colors flex-shrink-0"
        >
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>
    </section>
  );
}
