'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardCapture() {
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
    <section className="max-w-3xl mx-auto mb-12">
      <form onSubmit={handleSubmit} className="journal-bar flex items-center p-3 pl-5 transition-all duration-300">
        <span className="material-symbols-outlined text-primary/70 mr-4 text-xl">edit_note</span>
        <input 
          type="text" 
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={isLoading}
          placeholder="I just spent 500 on lunch... or 'Idea: Pet Sock Subscription'" 
          className="bg-transparent border-none outline-none w-full text-base placeholder:text-outline-variant text-on-surface focus:ring-0" 
        />
        <button 
          type="submit"
          disabled={!text.trim() || isLoading}
          className="text-sm font-bold text-primary hover:text-primary-dim px-3 transition-colors disabled:opacity-40"
        >
          {isLoading ? 'Logging...' : 'Log'}
        </button>
      </form>
      <p className="text-center text-outline-variant text-[11px] mt-3 tracking-wide">
        The AI will organize your thought. You just need to write it down.
      </p>
    </section>
  );
}
