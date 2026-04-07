'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const categoryIcons: Record<string, string> = {
  Grocery: 'shopping_cart',
  Gym: 'fitness_center',
  Idea: 'lightbulb',
  Task: 'task_alt',
  Uncategorized: 'category',
};

const categoryRoutes: Record<string, string> = {
  Grocery: '/shopping',
  Gym: '/workout',
  Idea: '/ideas',
  Task: '/tasks',
  Uncategorized: '/logs',
};

export default function CaptureBar() {
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{ category: string; text: string } | null>(null);
  const router = useRouter();

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
        const cleanText = entry?.clean_text || text.trim();

        setText('');
        
        // Show toast
        setToast({ category, text: cleanText });
        setTimeout(() => setToast(null), 3500);
        
        router.refresh();
      }
    } catch (error) {
      console.error('Capture error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Toast Notification */}
      {toast && (
        <div 
          className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] animate-toast-in cursor-pointer"
          onClick={() => {
            const route = categoryRoutes[toast.category] || '/logs';
            router.push(route);
            setToast(null);
          }}
        >
          <div className="bg-surface-container-lowest/95 backdrop-blur-xl rounded-2xl px-5 py-3 shadow-[0_12px_40px_rgba(46,47,47,0.15)] border border-white/50 flex items-center gap-3 max-w-sm">
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-primary text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
                {categoryIcons[toast.category] || 'check_circle'}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-primary uppercase tracking-widest">
                Added to {toast.category}
              </p>
              <p className="text-sm font-medium text-on-surface truncate">
                {toast.text}
              </p>
            </div>
            <span className="material-symbols-outlined text-on-surface-variant/40 text-sm flex-shrink-0">
              arrow_forward
            </span>
          </div>
        </div>
      )}

      {/* Capture Bar */}
      <div className="fixed bottom-24 md:bottom-12 left-1/2 -translate-x-1/2 w-[90%] max-w-xl z-[60]">
        <form onSubmit={handleSubmit}>
          <div className="bg-white/80 backdrop-blur-2xl p-2 rounded-full shadow-[0_32px_64px_rgba(46,47,47,0.12)] border border-white/50 flex items-center gap-2">
            <button
              type="button"
              className="w-12 h-12 flex items-center justify-center text-primary flex-shrink-0"
            >
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                add_circle
              </span>
            </button>
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Capture a thought..."
              className="flex-1 bg-transparent border-none focus:ring-0 text-on-surface font-semibold placeholder:text-on-surface-variant/50 px-2 text-base outline-none"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!text.trim() || isLoading}
              className="bg-primary text-white w-12 h-12 rounded-full flex items-center justify-center shadow-lg shadow-primary/20 active:scale-95 transition-all disabled:opacity-40 flex-shrink-0"
            >
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                {isLoading ? 'hourglass_empty' : 'send'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
