'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const ALL_TOGGLEABLE_TABS = [
  { key: 'ideas',    label: 'Ideas',        icon: 'lightbulb',        desc: 'Your curated thought sparks' },
  { key: 'shopping', label: 'Shopping',     icon: 'shopping_cart',    desc: 'Grocery & shopping list' },
  { key: 'focus',    label: 'Focus Mode',   icon: 'self_improvement', desc: 'Pomodoro & deep work timer' },
  { key: 'workout',  label: 'Gym Log',      icon: 'fitness_center',   desc: 'Workout & fitness tracker' },
  { key: 'logs',     label: 'Activity Log', icon: 'history',          desc: 'Full history of entries' },
];

export default function SettingsClient({
  email,
  name: initialName,
  telegramChatId: initialChatId,
  userId: _userId,
  hiddenTabs: initialHiddenTabs,
}: {
  email: string;
  name: string;
  telegramChatId: string;
  userId: string;
  hiddenTabs: string[];
}) {
  const [name, setName] = useState(initialName);
  const [chatId, setChatId] = useState(initialChatId);
  const [hiddenTabs, setHiddenTabs] = useState<string[]>(initialHiddenTabs);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingTelegram, setIsSavingTelegram] = useState(false);
  const [isSavingTabs, setIsSavingTabs] = useState(false);
  const [savedProfile, setSavedProfile] = useState(false);
  const [savedTelegram, setSavedTelegram] = useState(false);
  const [savedTabs, setSavedTabs] = useState(false);
  const router = useRouter();

  const handleSaveName = async () => {
    setIsSavingProfile(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      if (res.ok) {
        setSavedProfile(true);
        setTimeout(() => setSavedProfile(false), 3000);
        router.refresh();
      }
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSaveTelegram = async () => {
    setIsSavingTelegram(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ telegram_chat_id: chatId }),
      });
      if (res.ok) {
        setSavedTelegram(true);
        setTimeout(() => setSavedTelegram(false), 3000);
      }
    } finally {
      setIsSavingTelegram(false);
    }
  };

  const toggleTab = (key: string) => {
    setHiddenTabs(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const handleSaveTabs = async () => {
    setIsSavingTabs(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hidden_tabs: hiddenTabs }),
      });
      if (res.ok) {
        setSavedTabs(true);
        setTimeout(() => setSavedTabs(false), 3000);
        router.refresh();
      }
    } finally {
      setIsSavingTabs(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  return (
    <div className="space-y-10">
      {/* Account Group */}
      <section>
        <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-on-surface-variant px-4 mb-4">Account</h3>
        <div className="bg-surface-container-low rounded-xl overflow-hidden divide-y divide-surface-container/50">

          {/* Display Name */}
          <div className="p-6 bg-surface-container-lowest">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary-container/30 flex items-center justify-center text-primary flex-shrink-0">
                <span className="material-symbols-outlined">badge</span>
              </div>
              <div>
                <p className="font-bold text-on-surface">Display Name</p>
                <p className="text-sm text-on-surface-variant">Shown across the app and sidebar</p>
              </div>
            </div>
            <div className="flex gap-3">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="flex-1 bg-surface-container-low text-on-surface rounded-lg border-0 px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-lowest transition-all outline-none placeholder:text-outline-variant text-sm"
              />
              <button
                onClick={handleSaveName}
                disabled={isSavingProfile}
                className="px-6 py-3 bg-gradient-to-br from-primary to-primary-container text-white rounded-lg font-bold text-sm active:scale-95 transition-all disabled:opacity-50 flex-shrink-0"
              >
                {savedProfile ? '✓ Saved' : isSavingProfile ? '...' : 'Save'}
              </button>
            </div>
          </div>

          {/* Email (read-only) */}
          <div className="p-6 bg-surface-container-lowest flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-primary-container/30 flex items-center justify-center text-primary flex-shrink-0">
                <span className="material-symbols-outlined">alternate_email</span>
              </div>
              <div>
                <p className="font-bold text-on-surface">Email</p>
                <p className="text-sm text-on-surface-variant">{email}</p>
              </div>
            </div>
            <span className="text-xs font-bold text-outline-variant uppercase tracking-wider">Read-only</span>
          </div>
        </div>
      </section>

      {/* Navigation Customization */}
      <section>
        <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-on-surface-variant px-4 mb-4">Navigation Tabs</h3>
        <div className="bg-surface-container-low rounded-xl overflow-hidden">
          <div className="p-6 bg-surface-container-lowest">
            <p className="text-sm text-on-surface-variant mb-5">Toggle which sections appear in your navigation. Home and Tasks are always visible.</p>
            <div className="space-y-4">
              {ALL_TOGGLEABLE_TABS.map(tab => {
                const isVisible = !hiddenTabs.includes(tab.key);
                return (
                  <div key={tab.key} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${isVisible ? 'bg-primary/10 text-primary' : 'bg-surface-container text-on-surface-variant/40'}`}>
                        <span className="material-symbols-outlined text-lg">{tab.icon}</span>
                      </div>
                      <div>
                        <p className={`font-semibold text-sm transition-colors ${isVisible ? 'text-on-surface' : 'text-on-surface-variant/50'}`}>{tab.label}</p>
                        <p className="text-xs text-on-surface-variant/60">{tab.desc}</p>
                      </div>
                    </div>
                    {/* Toggle switch */}
                    <button
                      onClick={() => toggleTab(tab.key)}
                      className={`relative w-12 h-6 rounded-full transition-colors duration-200 flex-shrink-0 ${isVisible ? 'bg-primary' : 'bg-surface-container-high'}`}
                      aria-label={`Toggle ${tab.label}`}
                    >
                      <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${isVisible ? 'translate-x-7' : 'translate-x-1'}`} />
                    </button>
                  </div>
                );
              })}
            </div>
            <button
              onClick={handleSaveTabs}
              disabled={isSavingTabs}
              className="mt-6 w-full py-3 bg-gradient-to-br from-primary to-primary-container text-white rounded-lg font-bold text-sm active:scale-95 transition-all disabled:opacity-50"
            >
              {savedTabs ? '✓ Saved' : isSavingTabs ? 'Saving...' : 'Save Navigation'}
            </button>
          </div>
        </div>
      </section>

      {/* Telegram Integration */}
      <section>
        <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-on-surface-variant px-4 mb-4">Telegram Integration</h3>
        <div className="bg-surface-container-low rounded-xl overflow-hidden">
          <div className="p-6 bg-surface-container-lowest">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 rounded-full bg-tertiary-container/30 flex items-center justify-center text-tertiary flex-shrink-0">
                <span className="material-symbols-outlined">send</span>
              </div>
              <div>
                <p className="font-bold text-on-surface">Telegram Chat ID</p>
                <p className="text-sm text-on-surface-variant">Link your Telegram for on-the-go capture & reminders</p>
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <input
                type="text"
                value={chatId}
                onChange={(e) => setChatId(e.target.value)}
                placeholder="Paste your Chat ID from the bot"
                className="flex-1 bg-surface-container-low text-on-surface rounded-lg border-0 px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-lowest transition-all outline-none placeholder:text-outline-variant text-sm"
              />
              <button
                onClick={handleSaveTelegram}
                disabled={isSavingTelegram}
                className="px-6 py-3 bg-gradient-to-br from-primary to-primary-container text-white rounded-lg font-bold text-sm active:scale-95 transition-all disabled:opacity-50 flex-shrink-0"
              >
                {savedTelegram ? '✓ Saved' : isSavingTelegram ? '...' : 'Save'}
              </button>
            </div>
            <p className="text-xs text-on-surface-variant mt-3">
              Start the bot and send <code className="bg-surface-container px-1.5 py-0.5 rounded text-primary font-bold">/start</code> to get your Chat ID.
            </p>
          </div>
        </div>
      </section>

      {/* Privacy Group */}
      <section>
        <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-on-surface-variant px-4 mb-4">Privacy</h3>
        <div className="bg-surface-container-low rounded-xl overflow-hidden">
          <div className="p-6 bg-surface-container-lowest flex items-center justify-between hover:bg-surface-container transition-colors cursor-pointer group">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-error-container/20 flex items-center justify-center text-error flex-shrink-0">
                <span className="material-symbols-outlined">lock</span>
              </div>
              <div>
                <p className="font-bold text-on-surface">Security Vault</p>
                <p className="text-sm text-on-surface-variant">PIN-based authentication active</p>
              </div>
            </div>
            <span className="material-symbols-outlined text-outline-variant group-hover:text-primary transition-colors">chevron_right</span>
          </div>
          <div className="p-6 bg-surface-container-lowest flex items-center justify-between border-t border-surface-container/50 hover:bg-surface-container transition-colors cursor-pointer group">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-error-container/20 flex items-center justify-center text-error flex-shrink-0">
                <span className="material-symbols-outlined">visibility_off</span>
              </div>
              <div>
                <p className="font-bold text-on-surface">Data Privacy</p>
                <p className="text-sm text-on-surface-variant">Your data stays in your Supabase instance</p>
              </div>
            </div>
            <span className="material-symbols-outlined text-outline-variant group-hover:text-primary transition-colors">chevron_right</span>
          </div>
        </div>
      </section>

      {/* Logout */}
      <section className="pt-8">
        <button
          onClick={handleLogout}
          className="w-full py-5 rounded-xl border-2 border-dashed border-outline-variant/30 text-on-surface-variant font-bold hover:bg-error-container/10 hover:text-error hover:border-error/30 transition-all flex items-center justify-center gap-2 group"
        >
          <span className="material-symbols-outlined text-xl group-hover:rotate-12 transition-transform">logout</span>
          Logout
        </button>
        <p className="text-center text-[10px] text-outline-variant mt-6 uppercase tracking-widest font-black opacity-50">
          Version 2.0.0 (Luminous Edition)
        </p>
      </section>
    </div>
  );
}
