'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { BrainDump } from '@/lib/types';
import EditEntryModal from '@/components/EditEntryModal';

export default function TaskList({
  initialEntries,
  userId,
}: {
  initialEntries: BrainDump[];
  userId: string;
}) {
  const [entries, setEntries] = useState(initialEntries);
  const [editingEntry, setEditingEntry] = useState<BrainDump | null>(null);
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

  const handleSaveEdit = async (updates: Partial<BrainDump>) => {
    if (!editingEntry) return;

    // Optimistic update
    setEntries(prev => prev.map(e => e.id === editingEntry.id ? { ...e, ...updates } : e));

    await fetch('/api/entries', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: editingEntry.id, ...updates }),
    });
    router.refresh();
  };

  const handleDelete = async () => {
    if (!editingEntry) return;

    // Optimistic update
    setEntries(prev => prev.filter(e => e.id !== editingEntry.id));

    await fetch(`/api/entries?id=${editingEntry.id}`, {
      method: 'DELETE',
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
              <li key={item.id} className="flex items-center gap-3 bg-white/60 p-4 rounded-lg group">
                <div 
                  className="w-6 h-6 border-2 border-tertiary/30 rounded-md flex items-center justify-center bg-white group-hover:border-tertiary transition-colors cursor-pointer flex-shrink-0" 
                  onClick={() => handleToggle(item, 'Done')}
                />
                <div className="flex-1 min-w-0 flex items-center cursor-pointer" onClick={() => handleToggle(item, 'Done')}>
                  <span className="text-on-surface font-medium truncate">{item.clean_text || item.raw_text}</span>
                  {item.context_tags && item.context_tags.length > 0 && (
                    <span className="ml-auto text-xs text-on-surface-variant/50 hidden sm:block whitespace-nowrap pl-2">
                      {item.context_tags.map(t => `#${t}`).join(' ')}
                    </span>
                  )}
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); setEditingEntry(item); }}
                  className="p-2 text-on-surface-variant hover:text-on-surface opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 rounded-full hover:bg-black/5"
                >
                  <span className="material-symbols-outlined text-[20px]">more_vert</span>
                </button>
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
              <li key={item.id} className="flex items-center gap-3 bg-white/60 p-4 rounded-lg opacity-50 hover:opacity-100 transition-opacity group">
                <div 
                  className="w-6 h-6 border-2 border-tertiary/10 rounded-md flex items-center justify-center bg-tertiary cursor-pointer flex-shrink-0"
                  onClick={() => handleToggle(item, 'Open')}
                >
                  <span className="material-symbols-outlined text-white text-sm">check</span>
                </div>
                <div className="flex-1 min-w-0 flex items-center cursor-pointer" onClick={() => handleToggle(item, 'Open')}>
                  <span className="text-on-surface-variant font-medium line-through truncate">{item.clean_text || item.raw_text}</span>
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); setEditingEntry(item); }}
                  className="p-2 text-on-surface-variant hover:text-on-surface opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 rounded-full hover:bg-black/5"
                >
                  <span className="material-symbols-outlined text-[20px]">more_vert</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {editingEntry && (
        <EditEntryModal
          entry={editingEntry}
          onClose={() => setEditingEntry(null)}
          onSave={handleSaveEdit}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
