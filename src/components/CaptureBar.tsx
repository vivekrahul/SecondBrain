'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

const toastMessages: Record<string, string> = {
  Task: 'Task added ✓',
  Idea: 'Saved to Ideas',
  Grocery: 'Added to Shopping',
  Gym: 'Logged to Health',
  Uncategorized: 'Logged',
};

export default function CaptureBar() {
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [toasts, setToasts] = useState<{ id: number; message: string }[]>([]);
  const router = useRouter();
  const pathname = usePathname();

  // Hide on home page (DashboardCapture handles it there) and in focus mode
  if (pathname === '/' || pathname === '/focus') return null;

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
        const entries = data.entries || [];
        
        setText('');
        
        // Queue a toast for each parsed item
        entries.forEach((entry: any, index: number) => {
          // slight delay so toasts stack sequentially instead of precisely simultaneously
          setTimeout(() => {
            const category = entry?.category || 'Uncategorized';
            addToast(toastMessages[category] || 'Logged');
          }, index * 150);
        });
        
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
      {/* Toast Queue — top center to avoid mobile keyboard */}
      <div className="fixed top-20 left-1/2 z-[9999] flex flex-col gap-2 pointer-events-none" style={{ transform: 'translateX(-50%)' }}>
        {toasts.map((toast) => (
          <div key={toast.id} className="animate-toast-top pointer-events-auto">
            <div className="bg-on-surface text-surface rounded-full px-5 py-2.5 shadow-xl flex items-center gap-2.5 whitespace-nowrap">
              <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              <span className="text-sm font-medium">{toast.message}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Capture Bar */}
      <div className="fixed bottom-16 left-1/2 -translate-x-1/2 w-[92%] max-w-xl z-[60]">
        <form onSubmit={handleSubmit}>
          <div className="bg-surface border border-surface-variant p-1.5 rounded-full shadow-lg flex items-center gap-1.5">
            <span className="material-symbols-outlined text-primary/60 pl-3 flex-shrink-0">edit_note</span>
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Capture a thought..."
              className="flex-1 bg-transparent border-none focus:ring-0 text-on-surface font-medium placeholder:text-on-surface-variant/40 px-2 text-[15px] outline-none min-w-0"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!text.trim() || isLoading}
              className="bg-primary text-on-primary w-10 h-10 rounded-full flex items-center justify-center active:scale-95 transition-all disabled:opacity-30 flex-shrink-0"
            >
              <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
                {isLoading ? 'hourglass_empty' : 'send'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
