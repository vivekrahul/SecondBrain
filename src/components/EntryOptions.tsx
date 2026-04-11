'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { BrainDump } from '@/lib/types';
import EditEntryModal from './EditEntryModal';

export default function EntryOptions({ entry, darkIcon = false }: { entry: BrainDump, darkIcon?: boolean }) {
  const [isEditing, setIsEditing] = useState(false);
  const [isMoving, setIsMoving] = useState(false);
  const router = useRouter();

  const handleSaveEdit = async (updates: Partial<BrainDump>) => {
    await fetch('/api/entries', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: entry.id, ...updates }),
    });
    router.refresh();
  };

  const handleDelete = async () => {
    await fetch(`/api/entries?id=${entry.id}`, {
      method: 'DELETE',
    });
    router.refresh();
  };

  // Toggle between Task ↔ Idea
  const handleConvert = async () => {
    setIsMoving(true);
    const newCategory = entry.category === 'Idea' ? 'Task' : 'Idea';
    await fetch('/api/entries', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: entry.id, category: newCategory, is_human_corrected: true }),
    });
    router.refresh();
    setIsMoving(false);
  };

  const canConvert = entry.category === 'Idea' || entry.category === 'Task';
  const convertLabel = entry.category === 'Idea' ? 'Move to Tasks' : 'Move to Ideas';
  const convertIcon = entry.category === 'Idea' ? 'task_alt' : 'lightbulb';

  const baseBtn = darkIcon
    ? 'hover:bg-black/10 text-on-surface-variant hover:text-on-surface'
    : 'hover:bg-white/10 text-white/50 hover:text-white';

  return (
    <>
      <div className="flex items-center gap-1">
        {/* Quick convert button */}
        {canConvert && (
          <button
            onClick={(e) => { e.stopPropagation(); handleConvert(); }}
            disabled={isMoving}
            className={`p-2 rounded-full transition-all opacity-0 group-hover:opacity-100 flex items-center gap-1 disabled:opacity-50 ${baseBtn}`}
            title={convertLabel}
          >
            <span className="material-symbols-outlined text-[16px]">{convertIcon}</span>
          </button>
        )}

        {/* Edit button */}
        <button
          onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
          className={`p-2 rounded-full transition-opacity opacity-0 group-hover:opacity-100 ${baseBtn}`}
        >
          <span className="material-symbols-outlined text-[20px]">more_vert</span>
        </button>
      </div>

      {isEditing && (
        <EditEntryModal
          entry={entry}
          onClose={() => setIsEditing(false)}
          onSave={handleSaveEdit}
          onDelete={handleDelete}
        />
      )}
    </>
  );
}
