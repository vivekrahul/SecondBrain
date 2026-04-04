'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CaptureBar() {
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
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
        setText('');
        router.refresh();
      }
    } catch (error) {
      console.error('Capture error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
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
  );
}
