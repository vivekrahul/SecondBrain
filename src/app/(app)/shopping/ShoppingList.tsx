'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { BrainDump } from '@/lib/types';
import EditEntryModal from '@/components/EditEntryModal';

export default function ShoppingList({
  openItems: initialOpen,
  doneItems: initialDone,
  donePercent,
  total,
}: {
  openItems: BrainDump[];
  doneItems: BrainDump[];
  donePercent: number;
  total: number;
}) {
  const [openItems, setOpenItems] = useState(initialOpen);
  const [doneItems, setDoneItems] = useState(initialDone);
  const [editingEntry, setEditingEntry] = useState<BrainDump | null>(null);
  const router = useRouter();

  const handleToggle = async (item: BrainDump, newStatus: 'Open' | 'Done') => {
    // Optimistic update
    if (newStatus === 'Done') {
      setOpenItems(prev => prev.filter(i => i.id !== item.id));
      setDoneItems(prev => [{ ...item, status: 'Done' }, ...prev]);
    } else {
      setDoneItems(prev => prev.filter(i => i.id !== item.id));
      setOpenItems(prev => [{ ...item, status: 'Open' }, ...prev]);
    }

    await fetch('/api/entries', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: item.id, status: newStatus }),
    });
    router.refresh();
  };

  const handleSaveEdit = async (updates: Partial<BrainDump>) => {
    if (!editingEntry) return;

    setOpenItems(prev => prev.map(e => e.id === editingEntry.id ? { ...e, ...updates } : e));
    setDoneItems(prev => prev.map(e => e.id === editingEntry.id ? { ...e, ...updates } : e));

    await fetch('/api/entries', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: editingEntry.id, ...updates }),
    });
    router.refresh();
  };

  const handleDelete = async () => {
    if (!editingEntry) return;

    setOpenItems(prev => prev.filter(e => e.id !== editingEntry.id));
    setDoneItems(prev => prev.filter(e => e.id !== editingEntry.id));

    await fetch(`/api/entries?id=${editingEntry.id}`, {
      method: 'DELETE',
    });
    router.refresh();
  };

  const strokeDasharray = 364.4;
  const currentDonePercent = total > 0 ? Math.round(((doneItems.length) / total) * 100) : donePercent;
  const strokeDashoffset = strokeDasharray - (strokeDasharray * currentDonePercent / 100);

  return (
    <>
      {/* Items Grid */}
      <div className="space-y-6">
        {/* Open Items */}
        {openItems.length > 0 && (
          <div className="bg-[#e8f5e9] rounded-lg p-6 flex flex-col space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-green-700">eco</span>
                <h2 className="text-lg font-bold text-green-900 tracking-tight">Shopping List</h2>
              </div>
              <span className="bg-green-200 text-green-800 text-xs font-bold px-2.5 py-1 rounded-full">
                {openItems.length} ITEMS
              </span>
            </div>
            <ul className="space-y-3">
              {openItems.map((item) => (
                <li key={item.id} className="flex items-center gap-3 bg-white/60 p-4 rounded-lg group">
                  <div 
                    className="w-6 h-6 border-2 border-green-700/30 rounded-md flex items-center justify-center bg-white group-hover:border-green-700 transition-colors cursor-pointer flex-shrink-0"
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
                {doneItems.length} DONE
              </span>
            </div>
            <ul className="space-y-3">
              {doneItems.map((item) => (
                <li key={item.id} className="flex items-center gap-3 bg-white/60 p-4 rounded-lg opacity-50 hover:opacity-100 transition-opacity group">
                  <div 
                    className="w-6 h-6 border-2 border-green-700/10 rounded-md flex items-center justify-center bg-green-700 cursor-pointer flex-shrink-0"
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

        {openItems.length === 0 && doneItems.length === 0 && (
          <div className="bg-surface-container-low p-12 rounded-xl text-center">
            <span className="material-symbols-outlined text-6xl text-on-surface-variant/20 mb-4">shopping_cart</span>
            <h3 className="text-xl font-bold text-on-surface mb-2">Shopping list is empty</h3>
            <p className="text-on-surface-variant">Capture items by typing &quot;buy milk&quot; or &quot;get eggs&quot; in the capture bar.</p>
          </div>
        )}
      </div>

      {/* Progress Ring */}
      {total > 0 && (
        <section className="bg-surface-container-lowest p-8 rounded-xl soft-shadow-lg flex flex-col md:flex-row items-center gap-8 border border-outline-variant/10">
          <div className="relative w-32 h-32 flex-shrink-0">
            <svg className="w-full h-full -rotate-90">
              <circle className="text-surface-container-high" cx="64" cy="64" fill="transparent" r="58" stroke="currentColor" strokeWidth="8" />
              <circle className="text-primary transition-all duration-500" cx="64" cy="64" fill="transparent" r="58" stroke="currentColor" strokeDasharray={strokeDasharray} strokeDashoffset={strokeDashoffset} strokeWidth="8" strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center flex-col">
              <span className="text-2xl font-extrabold text-on-surface">{currentDonePercent}%</span>
              <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Done</span>
            </div>
          </div>
          <div className="flex-grow space-y-2 text-center md:text-left">
            <h3 className="text-2xl font-bold tracking-tight">
              {currentDonePercent >= 100 ? 'All done! 🎉' : currentDonePercent >= 70 ? 'Almost there!' : 'Keep going!'}
            </h3>
            <p className="text-on-surface-variant max-w-md">
              You&apos;ve checked off {doneItems.length} of {total} items on your list.
            </p>
          </div>
        </section>
      )}

      {editingEntry && (
        <EditEntryModal
          entry={editingEntry}
          onClose={() => setEditingEntry(null)}
          onSave={handleSaveEdit}
          onDelete={handleDelete}
        />
      )}
    </>
  );
}
