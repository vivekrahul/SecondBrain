'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { BrainDump } from '@/lib/types';
import EditEntryModal from './EditEntryModal';

export default function EntryOptions({ entry, darkIcon = false }: { entry: BrainDump, darkIcon?: boolean }) {
  const [isEditing, setIsEditing] = useState(false);
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

  return (
    <>
      <button 
        onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
        className={`p-2 rounded-full transition-opacity opacity-0 group-hover:opacity-100 ${
          darkIcon ? 'hover:bg-black/10 text-on-surface-variant hover:text-on-surface' : 'hover:bg-white/10 text-white/50 hover:text-white'
        }`}
      >
        <span className="material-symbols-outlined text-[20px]">more_vert</span>
      </button>

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
