'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

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
  const [toasts, setToasts] = useState<{ id: number; message: string }[]>([]);
  const router = useRouter();

  const addToast = (message: string) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 2500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || isLoading) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/process-entry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text.trim() }),
      });

      if (response.ok) {
        const data = await response.json();
        const entry = data.entry;
        const category = entry?.category || 'Uncategorized';
        setText('');
        addToast(toastMessages[category] || 'Logged');
        router.refresh();
      }
    } catch (error) {
      console.error('Capture error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="max-w-3xl mx-auto mb-10">
      <form onSubmit={handleSubmit} className="journal-bar flex items-center p-3 pl-4 transition-all duration-300">
        <span className="material-symbols-outlined text-primary/60 mr-3 text-xl flex-shrink-0">edit_note</span>
        <input 
          type="text" 
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={isLoading}
          placeholder="Dump a thought, task, or expense..." 
          className="bg-transparent border-none outline-none w-full text-[15px] placeholder:text-outline-variant text-on-surface focus:ring-0 min-w-0" 
        />
        <button 
          type="submit"
          disabled={!text.trim() || isLoading}
          className="text-sm font-bold text-primary hover:text-primary-dim px-3 transition-colors disabled:opacity-40 flex-shrink-0 whitespace-nowrap"
        >
          {isLoading ? '...' : 'Log'}
        </button>
      </form>
      <p className="text-center text-outline-variant text-[11px] mt-2.5 tracking-wide">
        The AI will organize your thought. You just need to write it down.
      </p>

      {/* Toast Queue — bottom center */}
      <div className="fixed bottom-28 left-1/2 z-[100] flex flex-col-reverse gap-2 pointer-events-none" style={{ transform: 'translateX(-50%)' }}>
        {toasts.map((toast) => (
          <div key={toast.id} className="animate-toast-bottom pointer-events-auto">
            <div className="bg-on-surface text-surface rounded-full px-5 py-2.5 shadow-xl flex items-center gap-2.5 whitespace-nowrap">
              <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              <span className="text-sm font-medium">{toast.message}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
