'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSpeechInput } from '@/hooks/useSpeechInput';

const toastMessages: Record<string, string> = {
  Task: 'Task added ✓',
  Idea: 'Saved to Ideas',
  Grocery: 'Added to Shopping',
  Gym: 'Logged to Health',
  Uncategorized: 'Logged',
};

export default function DashboardCapture() {
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [toasts, setToasts] = useState<{ id: number; message: string; isDuplicate?: boolean }[]>([]);
  const router = useRouter();

  const addToast = (message: string, isDuplicate = false) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, isDuplicate }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 2500);
  };

  const submitText = useCallback(async (inputText: string) => {
    if (!inputText.trim() || isLoading) return;
    setIsLoading(true);
    try {
      const response = await fetch('/api/process-entry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputText.trim() }),
      });

      if (response.ok) {
        const data = await response.json();
        const entries = data.entries || [];
        const allDuplicates = data.allDuplicates || false;

        setText('');

        if (allDuplicates) {
          addToast('Already captured ✓', true);
        } else {
          entries.forEach((entry: any, index: number) => {
            if (entry.isDuplicate) return;
            setTimeout(() => {
              const category = entry?.category || 'Uncategorized';
              addToast(toastMessages[category] || 'Logged');
            }, index * 150);
          });
          if (data.duplicateCount > 0) {
            setTimeout(() => addToast(`${data.duplicateCount} already captured`, true), entries.length * 150);
          }
        }

        router.refresh();
      }
    } catch (error) {
      console.error('Capture error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, router]);

  const { isListening, isSupported, startListening, stopListening } = useSpeechInput(
    (transcript) => setText(transcript),
    (finalText) => submitText(finalText),
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitText(text);
  };

  return (
    <section className="max-w-3xl mx-auto mb-10">
      <form onSubmit={handleSubmit} className="journal-bar flex items-center p-3 pl-4 transition-all duration-300">
        <span className="material-symbols-outlined text-primary/60 mr-3 text-xl flex-shrink-0">edit_note</span>
        <input
          type="text"
          value={isListening ? `🎤 ${text}` : text}
          onChange={(e) => setText(e.target.value)}
          disabled={isLoading || isListening}
          placeholder={isListening ? 'Listening...' : 'Dump a thought, task, or expense...'}
          className="bg-transparent border-none outline-none w-full text-[15px] placeholder:text-outline-variant text-on-surface focus:ring-0 min-w-0"
        />

        {/* Mic button */}
        {isSupported && (
          <button
            type="button"
            onClick={isListening ? stopListening : startListening}
            className={`p-2 rounded-full mr-1 transition-all flex-shrink-0 ${
              isListening
                ? 'text-red-500 bg-red-50 animate-pulse'
                : 'text-on-surface-variant/50 hover:text-primary hover:bg-primary/5'
            }`}
            title={isListening ? 'Stop listening' : 'Speak your thought'}
          >
            <span className="material-symbols-outlined text-[20px]" style={isListening ? { fontVariationSettings: "'FILL' 1" } : undefined}>
              {isListening ? 'mic' : 'mic_none'}
            </span>
          </button>
        )}

        <button
          type="submit"
          disabled={!text.trim() || isLoading}
          className="text-sm font-bold text-primary hover:text-primary-dim px-3 transition-colors disabled:opacity-40 flex-shrink-0 whitespace-nowrap"
        >
          {isLoading ? '...' : 'Log'}
        </button>
      </form>
      <p className="text-center text-outline-variant text-[11px] mt-2.5 tracking-wide">
        {isSupported ? 'Type or tap 🎤 to speak. AI will organize your thought.' : 'The AI will organize your thought. You just need to write it down.'}
      </p>

      {/* Toast Queue — top center */}
      <div className="fixed top-20 left-1/2 z-[9999] flex flex-col gap-2 pointer-events-none" style={{ transform: 'translateX(-50%)' }}>
        {toasts.map((toast) => (
          <div key={toast.id} className="animate-toast-top pointer-events-auto">
            <div className={`${toast.isDuplicate ? 'bg-surface-container-high text-on-surface-variant' : 'bg-on-surface text-surface'} rounded-full px-5 py-2.5 shadow-xl flex items-center gap-2.5 whitespace-nowrap`}>
              <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>
                {toast.isDuplicate ? 'info' : 'check_circle'}
              </span>
              <span className="text-sm font-medium">{toast.message}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
