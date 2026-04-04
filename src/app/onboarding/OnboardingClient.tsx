'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function OnboardingClient() {
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  const handleComplete = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ has_seen_onboarding: true }),
      });
      if (res.ok) {
        // Force router refresh so the layout check passes, then navigate to home
        router.refresh();
        router.push('/');
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <footer className="fixed bottom-0 left-0 w-full z-50 flex justify-center items-center px-6 pb-10 pt-6 bg-surface/80 backdrop-blur-md">
      <button
        onClick={handleComplete}
        disabled={isSaving}
        className="w-full max-w-md bg-gradient-to-r from-primary to-primary-container text-white font-bold py-5 rounded-full shadow-xl hover:opacity-90 transition-all active:scale-95 text-lg disabled:opacity-50"
      >
        {isSaving ? 'Setting up your brain...' : "Got it, let's go!"}
      </button>
    </footer>
  );
}
