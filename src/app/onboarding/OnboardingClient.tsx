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
    <button
      onClick={handleComplete}
      disabled={isSaving}
      className="w-full bg-primary text-on-primary font-bold py-4 rounded-full shadow-lg hover:bg-primary-dim transition-all active:scale-95 text-base disabled:opacity-50"
    >
      {isSaving ? 'Setting up your brain...' : "Got it, let's go"}
    </button>
  );
}
