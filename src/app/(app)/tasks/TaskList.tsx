'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { BrainDump } from '@/lib/types';
import EditEntryModal from '@/components/EditEntryModal';

const PRIORITY_CONFIG = {
  high:   { label: 'High',   color: 'bg-red-500',     ring: 'ring-red-500/40' },
  medium: { label: 'Medium', color: 'bg-amber-400',    ring: 'ring-amber-400/40' },
  low:    { label: 'Low',    color: 'bg-emerald-500',  ring: 'ring-emerald-500/40' },
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

  // Filter only — NO sorting. Preserve original order so tasks don't jump around.
  const filteredOpenItems = filterTab === 'All'
    ? openItems
    : openItems.filter(e => (e.priority || 'medium').toLowerCase() === filterTab.toLowerCase());

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

  // Priority dot component — renders a single tappable dot
  const PriorityDot = ({ item, level }: { item: BrainDump; level: 'high' | 'medium' | 'low' }) => {
    const isActive = (item.priority || 'medium') === level;
    const cfg = PRIORITY_CONFIG[level];
    return (
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); handlePriorityChange(item, level); }}
        className={`rounded-full transition-all duration-200 ${cfg.color} ${
          isActive
            ? `w-[10px] h-[10px] ${cfg.ring} ring-[3px]`
            : 'w-[7px] h-[7px] opacity-20 hover:opacity-50 hover:scale-125'
        }`}
        title={`Set ${cfg.label}`}
        aria-label={`Set priority to ${cfg.label}`}
      />
    );
  };

  return (
    <div className="space-y-6">
      {/* Priority Filter Tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1">
        {FILTER_TABS.map(tab => {
          const count = tab === 'All'
            ? openItems.length
            : openItems.filter(e => (e.priority || 'medium').toLowerCase() === tab.toLowerCase()).length;
          return (
            <button
              key={tab}
              onClick={() => setFilterTab(tab)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                filterTab === tab
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              {tab}{' '}
              <span className={filterTab === tab ? 'opacity-70' : 'opacity-40'}>{count}</span>
            </button>
          );
        })}
      </div>

      {/* Open Items */}
      {filteredOpenItems.length > 0 && (
        <div className="space-y-2">
          <div className="flex justify-between items-center px-1 mb-1">
            <h2 className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Active</h2>
            <span className="text-xs text-on-surface-variant/50 font-medium">
              {filteredOpenItems.length} task{filteredOpenItems.length !== 1 ? 's' : ''}
            </span>
          </div>

          <ul className="space-y-1.5 overflow-x-hidden">
            {filteredOpenItems.map((item) => (
              <li
                key={item.id}
                className="flex items-start gap-3 bg-surface-container-lowest p-3 sm:p-4 rounded-xl group hover:shadow-sm transition-shadow"
              >
                {/* Checkbox */}
                <button
                  type="button"
                  onClick={() => handleToggle(item, 'Done')}
                  className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-outline-variant/40 rounded-md flex items-center justify-center bg-transparent hover:border-primary hover:bg-primary/5 transition-colors flex-shrink-0 mt-0.5"
                  aria-label="Mark as done"
                />

                {/* Priority dots — vertical stack */}
                <div className="flex flex-col items-center gap-[3px] flex-shrink-0 mt-0.5">
                  <PriorityDot item={item} level="high" />
                  <PriorityDot item={item} level="medium" />
                  <PriorityDot item={item} level="low" />
                </div>

                {/* Task content — takes ALL remaining space */}
                <button
                  type="button"
                  className="flex-1 min-w-0 text-left"
                  onClick={() => setEditingEntry(item)}
                >
                  <p className="text-sm sm:text-[15px] text-on-surface font-medium leading-snug line-clamp-2 sm:line-clamp-1">
                    {item.clean_text || item.raw_text}
                  </p>
                  {(item.reminder_date || (item.context_tags && item.context_tags.length > 0)) && (
                    <div className="flex items-center gap-2 mt-0.5">
                      {item.reminder_date && (
                        <span className="inline-flex items-center gap-0.5 text-[10px] text-on-surface-variant/50 font-medium">
                          <span className="material-symbols-outlined text-[11px]">event</span>
                          {new Date(item.reminder_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      )}
                      {item.context_tags && item.context_tags.length > 0 && (
                        <span className="text-[10px] text-on-surface-variant/40">
                          {item.context_tags.slice(0, 2).map(t => `#${t}`).join(' ')}
                        </span>
                      )}
                    </div>
                  )}
                </button>

                {/* Edit button — visible on hover (desktop) and always tappable (mobile) */}
                <button
                  onClick={(e) => { e.stopPropagation(); setEditingEntry(item); }}
                  className="p-1.5 text-on-surface-variant/40 hover:text-on-surface sm:opacity-0 sm:group-hover:opacity-100 transition-all flex-shrink-0 rounded-lg hover:bg-surface-container"
                  aria-label="Edit task"
                >
                  <span className="material-symbols-outlined text-[18px]">edit</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {filteredOpenItems.length === 0 && filterTab !== 'All' && (
        <div className="text-center py-12 text-on-surface-variant/50 text-sm">
          No {filterTab.toLowerCase()} priority tasks.
        </div>
      )}

      {filteredOpenItems.length === 0 && filterTab === 'All' && openItems.length === 0 && (
        <div className="text-center py-16">
          <span className="material-symbols-outlined text-5xl text-on-surface-variant/15 mb-3 block">celebration</span>
          <p className="text-on-surface-variant/50 text-sm font-medium">All clear! No pending tasks.</p>
        </div>
      )}

      {/* Completed Items */}
      {doneItems.length > 0 && (
        <div className="space-y-2 pt-4">
          <h2 className="text-xs font-bold text-on-surface-variant/40 uppercase tracking-widest px-1">
            Completed · {doneItems.length}
          </h2>
          <ul className="space-y-1">
            {doneItems.map((item) => (
              <li
                key={item.id}
                className="flex items-center gap-3 p-3 sm:p-4 rounded-xl group opacity-40 hover:opacity-70 transition-opacity"
              >
                {/* Checked box */}
                <button
                  type="button"
                  onClick={() => handleToggle(item, 'Open')}
                  className="w-5 h-5 sm:w-6 sm:h-6 rounded-md flex items-center justify-center bg-primary/80 flex-shrink-0"
                  aria-label="Mark as open"
                >
                  <span className="material-symbols-outlined text-white text-xs sm:text-sm">check</span>
                </button>
                <button
                  type="button"
                  className="flex-1 min-w-0 text-left"
                  onClick={() => handleToggle(item, 'Open')}
                >
                  <p className="text-sm text-on-surface-variant font-medium line-through truncate">
                    {item.clean_text || item.raw_text}
                  </p>
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setEditingEntry(item); }}
                  className="p-1.5 text-on-surface-variant/30 hover:text-on-surface sm:opacity-0 sm:group-hover:opacity-100 transition-all flex-shrink-0 rounded-lg hover:bg-surface-container"
                  aria-label="Edit task"
                >
                  <span className="material-symbols-outlined text-[18px]">edit</span>
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
