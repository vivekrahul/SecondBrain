'use client';

import { useState } from 'react';
import type { BrainDump } from '@/lib/types';

const PRIORITY_OPTIONS = [
  { value: 'high',   label: '🔴 High',   description: 'Urgent, time-sensitive' },
  { value: 'medium', label: '🟡 Medium', description: 'Important, no rush' },
  { value: 'low',    label: '🟢 Low',    description: 'Nice to have, someday' },
];

export default function EditEntryModal({
  entry,
  onClose,
  onSave,
  onDelete,
}: {
  entry: BrainDump;
  onClose: () => void;
  onSave: (updates: Partial<BrainDump>) => Promise<void>;
  onDelete: () => Promise<void>;
}) {
  const [cleanText, setCleanText] = useState(entry.clean_text || entry.raw_text);
  const [category, setCategory] = useState(entry.category);
  const [tagsInput, setTagsInput] = useState(entry.context_tags?.join(', ') || '');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>(entry.priority || 'medium');
  const [reminderDate, setReminderDate] = useState(entry.reminder_date || '');
  const [workspace, setWorkspace] = useState<'home' | 'work'>(entry.workspace || 'home');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const categories = ['Grocery', 'Gym', 'Idea', 'Task', 'Uncategorized'];

  const handleSave = async () => {
    setIsSaving(true);
    const tags = tagsInput.split(',').map(t => t.trim().toLowerCase().replace(/^#/, '')).filter(Boolean);
    await onSave({
      clean_text: cleanText,
      category,
      context_tags: tags,
      priority,
      workspace,
      reminder_date: reminderDate || null,
    });
    setIsSaving(false);
    onClose();
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this?')) return;
    setIsDeleting(true);
    await onDelete();
    setIsDeleting(false);
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 bg-surface/80 backdrop-blur-sm z-50 transition-opacity" onClick={onClose} />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-surface-container-lowest rounded-2xl p-6 z-50 shadow-[0_8px_40px_rgba(46,47,47,0.1)] border border-outline-variant/20 animate-fade-in-up max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-extrabold mb-4">Edit Entry</h2>
        
        <div className="space-y-4">
          {/* Text */}
          <div>
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1">Text</label>
            <textarea
              value={cleanText}
              onChange={(e) => setCleanText(e.target.value)}
              className="w-full bg-surface-container-low text-on-surface rounded-lg p-3 border-0 focus:ring-2 focus:ring-primary outline-none resize-none"
              rows={3}
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-surface-container-low text-on-surface rounded-lg p-3 border-0 focus:ring-2 focus:ring-primary outline-none appearance-none"
            >
              {categories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Priority (show only for Tasks) */}
          {(category === 'Task') && (
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">Priority</label>
              <div className="grid grid-cols-3 gap-2">
                {PRIORITY_OPTIONS.map(p => (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => setPriority(p.value as 'low' | 'medium' | 'high')}
                    className={`flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-all text-center ${
                      priority === p.value
                        ? 'border-primary bg-primary/5'
                        : 'border-surface-container-high bg-surface-container-low hover:border-outline-variant'
                    }`}
                  >
                    <span className="text-base">{p.label.split(' ')[0]}</span>
                    <span className="text-[10px] font-bold">{p.label.split(' ')[1]}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            {/* Workspace Mode */}
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1">Space</label>
              <select
                value={workspace}
                onChange={(e) => setWorkspace(e.target.value as 'home' | 'work')}
                className="w-full bg-surface-container-low text-on-surface rounded-lg p-3 border-0 focus:ring-2 focus:ring-primary outline-none appearance-none"
              >
                <option value="home">🏠 Home</option>
                <option value="work">💼 Work</option>
              </select>
            </div>

            {/* Reminder Date */}
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1">Reminder</label>
              <input
                type="date"
                value={reminderDate}
                onChange={(e) => setReminderDate(e.target.value)}
                className="w-full bg-surface-container-low text-on-surface rounded-lg p-3 border-0 focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1">Tags (comma separated)</label>
            <input
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="urgent, work, idea"
              className="w-full bg-surface-container-low text-on-surface rounded-lg p-3 border-0 focus:ring-2 focus:ring-primary outline-none"
            />
          </div>
        </div>

        <div className="flex justify-between items-center mt-8 pt-4 border-t border-outline-variant/10">
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex items-center gap-1 text-error hover:bg-error/10 px-3 py-2 rounded-lg transition-colors disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-sm">delete</span>
            <span className="text-sm font-bold">Delete</span>
          </button>

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-on-surface-variant hover:bg-surface-container-high rounded-full font-bold text-sm transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-6 py-2 bg-primary text-white rounded-full font-bold text-sm flex items-center gap-2 hover:opacity-90 active:scale-95 disabled:opacity-50 transition-all"
            >
              {isSaving ? <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span> : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
