'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const categoryLabels: Record<string, string> = {
  Grocery: 'Shopping',
  Gym: 'Gym',
  Idea: 'Ideas',
  Task: 'Tasks',
  Uncategorized: 'Logs',
};

export default function DashboardCapture() {
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

        // Show toast confirmation
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

      {/* Toast Confirmation */}
      {toast && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[100] animate-toast-in">
          <div className="bg-on-surface text-surface rounded-xl px-5 py-3 shadow-xl flex items-center gap-3 max-w-sm">
            <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-widest opacity-70">
                Added to {categoryLabels[toast.category] || toast.category}
              </p>
              <p className="text-sm font-medium truncate">{toast.text}</p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
