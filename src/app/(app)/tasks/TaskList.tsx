'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { BrainDump } from '@/lib/types';
import EditEntryModal from '@/components/EditEntryModal';

const PRIORITY_CONFIG = {
  high:   { label: 'High',   dot: 'bg-red-500',    text: 'text-red-700',    bg: 'bg-red-50' },
  medium: { label: 'Medium', dot: 'bg-amber-400',  text: 'text-amber-700',  bg: 'bg-amber-50' },
  low:    { label: 'Low',    dot: 'bg-emerald-500', text: 'text-emerald-700', bg: 'bg-emerald-50' },
};

const FILTER_TABS = ['All', 'High', 'Medium', 'Low'] as const;
type FilterTab = typeof FILTER_TABS[number];

export default function TaskList({
  initialEntries,
  userId,
}: {
  initialEntries: BrainDump[];
  userId: string;
}) {
  const [entries, setEntries] = useState(initialEntries);
  const [editingEntry, setEditingEntry] = useState<BrainDump | null>(null);
  const [filterTab, setFilterTab] = useState<FilterTab>('All');
  const router = useRouter();

  const openItems = entries.filter(e => e.status === 'Open');
  const doneItems = entries.filter(e => e.status === 'Done');

  const filteredOpenItems = filterTab === 'All'
    ? openItems
    : openItems.filter(e => (e.priority || 'medium').toLowerCase() === filterTab.toLowerCase());

  // Sort: high → medium → low
  const priorityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };
  const sortedOpenItems = [...filteredOpenItems].sort((a, b) =>
    (priorityOrder[a.priority || 'medium'] ?? 1) - (priorityOrder[b.priority || 'medium'] ?? 1)
  );

  const handleToggle = async (item: BrainDump, newStatus: 'Open' | 'Done') => {
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
    setEntries(prev => prev.filter(e => e.id !== editingEntry.id));
    await fetch(`/api/entries?id=${editingEntry.id}`, { method: 'DELETE' });
    router.refresh();
  };

  const handlePriorityChange = async (item: BrainDump, newPriority: 'low' | 'medium' | 'high') => {
    setEntries(prev => prev.map(e => e.id === item.id ? { ...e, priority: newPriority } : e));
    await fetch('/api/entries', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: item.id, priority: newPriority }),
    });
  };

  const cyclePriority = (current: string): 'low' | 'medium' | 'high' => {
    const cycle = { high: 'medium', medium: 'low', low: 'high' } as const;
    return cycle[(current || 'medium') as keyof typeof cycle];
  };

  return (
    <div className="space-y-6">
      {/* Priority Filter Tabs */}
      <div className="flex gap-2">
        {FILTER_TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setFilterTab(tab)}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
              filterTab === tab
                ? 'bg-primary text-on-primary shadow-sm'
                : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Open Items */}
      {sortedOpenItems.length > 0 && (
        <div className="bg-tertiary-container/30 rounded-lg p-6 flex flex-col space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-tertiary">task_alt</span>
              <h2 className="text-lg font-bold text-tertiary tracking-tight">Active Tasks</h2>
            </div>
            <span className="bg-tertiary-container text-on-tertiary-container text-xs font-bold px-2.5 py-1 rounded-full">
              {sortedOpenItems.length}
            </span>
          </div>
          <ul className="space-y-3">
            {sortedOpenItems.map((item) => {
              const prio = (item.priority || 'medium') as keyof typeof PRIORITY_CONFIG;
              const pc = PRIORITY_CONFIG[prio];
              return (
                <li key={item.id} className="flex items-center gap-3 bg-white/60 p-4 rounded-lg group">
                  <div
                    className="w-6 h-6 border-2 border-tertiary/30 rounded-md flex items-center justify-center bg-white group-hover:border-tertiary transition-colors cursor-pointer flex-shrink-0"
                    onClick={() => handleToggle(item, 'Done')}
                  />

                  {/* Priority Dots — each dot sets that priority directly */}
                  <div className="flex flex-col gap-1 flex-shrink-0">
                    {(['high', 'medium', 'low'] as const).map(p => (
                      <button
                        key={p}
                        type="button"
                        onClick={(e) => { e.stopPropagation(); handlePriorityChange(item, p); }}
                        className="w-4 h-4 flex items-center justify-center rounded-full hover:bg-black/5 transition-all"
                        title={`Set ${p} priority`}
                      >
                        <span
                          className={`block rounded-full transition-all ${PRIORITY_CONFIG[p].dot} ${
                            item.priority === p ? 'w-3 h-3 opacity-100' : 'w-2 h-2 opacity-25 hover:opacity-60'
                          }`}
                        />
                      </button>
                    ))}
                  </div>

                  <div className="flex-1 min-w-0 cursor-pointer" onClick={() => handleToggle(item, 'Done')}>
                    <span className="text-on-surface font-medium break-words line-clamp-2 block">
                      {item.clean_text || item.raw_text}
                    </span>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      {/* Reminder date */}
                      {item.reminder_date && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-on-surface-variant/60 font-medium">
                          <span className="material-symbols-outlined text-[12px]">calendar_today</span>
                          {new Date(item.reminder_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      )}
                      {/* Tags */}
                      {item.context_tags && item.context_tags.length > 0 && (
                        <span className="text-[10px] text-on-surface-variant/50 hidden sm:inline">
                          {item.context_tags.slice(0, 2).map(t => `#${t}`).join(' ')}
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={(e) => { e.stopPropagation(); setEditingEntry(item); }}
                    className="p-2 text-on-surface-variant hover:text-on-surface opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 rounded-full hover:bg-black/5"
                  >
                    <span className="material-symbols-outlined text-[20px]">more_vert</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {filteredOpenItems.length === 0 && filterTab !== 'All' && (
        <div className="text-center py-12 text-on-surface-variant italic text-sm">
          No {filterTab.toLowerCase()} priority tasks. 
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
                <div className="flex-1 min-w-0 cursor-pointer" onClick={() => handleToggle(item, 'Open')}>
                  <span className="text-on-surface-variant font-medium line-through break-words line-clamp-2">{item.clean_text || item.raw_text}</span>
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
