'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { BrainDump } from '@/lib/types';

export default function TaskList({
  initialEntries,
  userId,
}: {
  initialEntries: BrainDump[];
  userId: string;
}) {
  const [entries, setEntries] = useState(initialEntries);
  const router = useRouter();

  const openItems = entries.filter(e => e.status === 'Open');
  const doneItems = entries.filter(e => e.status === 'Done');

  const handleToggle = async (item: BrainDump, newStatus: 'Open' | 'Done') => {
    // Optimistic update
    setEntries(prev => prev.map(e => e.id === item.id ? { ...e, status: newStatus } : e));

    await fetch('/api/entries', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: item.id, status: newStatus }),
    });
    router.refresh();
  };

  return (
    <div className="space-y-6">
      {/* Open Items */}
      {openItems.length > 0 && (
        <div className="bg-tertiary-container/30 rounded-lg p-6 flex flex-col space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-tertiary">task_alt</span>
              <h2 className="text-lg font-bold text-tertiary tracking-tight">Active Tasks</h2>
            </div>
            <span className="bg-tertiary-container text-on-tertiary-container text-xs font-bold px-2.5 py-1 rounded-full">
              {openItems.length}
            </span>
          </div>
          <ul className="space-y-3">
            {openItems.map((item) => (
              <li key={item.id} className="flex items-center gap-3 bg-white/60 p-4 rounded-lg cursor-pointer group" onClick={() => handleToggle(item, 'Done')}>
                <div className="w-6 h-6 border-2 border-tertiary/30 rounded-md flex items-center justify-center bg-white group-hover:border-tertiary transition-colors" />
                <span className="text-on-surface font-medium">{item.clean_text || item.raw_text}</span>
                {item.context_tags && item.context_tags.length > 0 && (
                  <span className="ml-auto text-xs text-on-surface-variant/50">
                    {item.context_tags.map(t => `#${t}`).join(' ')}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Done Items */}
      {doneItems.length > 0 && (
        <div className="bg-surface-container-low rounded-lg p-6 flex flex-col space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-on-surface-variant">check_circle</span>
              <h2 className="text-lg font-bold text-on-surface-variant tracking-tight">Completed</h2>
            </div>
            <span className="bg-surface-container-high text-on-surface-variant text-xs font-bold px-2.5 py-1 rounded-full">
              {doneItems.length}
            </span>
          </div>
          <ul className="space-y-3">
            {doneItems.map((item) => (
              <li key={item.id} className="flex items-center gap-3 bg-white/60 p-4 rounded-lg cursor-pointer opacity-50 group" onClick={() => handleToggle(item, 'Open')}>
                <div className="w-6 h-6 border-2 border-tertiary/10 rounded-md flex items-center justify-center bg-tertiary">
                  <span className="material-symbols-outlined text-white text-sm">check</span>
                </div>
                <span className="text-on-surface-variant font-medium line-through">{item.clean_text || item.raw_text}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
