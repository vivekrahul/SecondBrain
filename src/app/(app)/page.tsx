import { verifyAuth } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import IOSInstallBanner from '@/components/IOSInstallBanner';
import Link from 'next/link';
import type { BrainDump } from '@/lib/types';

async function getDashboardData(userId: string) {
  const today = new Date().toISOString().split('T')[0];

  const [remindersResult, recentResult, statsResult] = await Promise.all([
    supabaseAdmin
      .from('brain_dump')
      .select('*')
      .eq('user_id', userId)
      .eq('reminder_date', today)
      .eq('status', 'Open')
      .limit(3),
    supabaseAdmin
      .from('brain_dump')
      .select('*')
      .eq('user_id', userId)
      .eq('category', 'Idea')
      .order('created_at', { ascending: false })
      .limit(3),
    supabaseAdmin
      .from('brain_dump')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'Open'),
  ]);

  return {
    reminders: (remindersResult.data || []) as BrainDump[],
    recentIdeas: (recentResult.data || []) as BrainDump[],
    openCount: statsResult.data?.length || 0,
  };
}

const categoryColors: Record<string, { bg: string; text: string; icon: string }> = {
  Grocery: { bg: 'bg-[#e8f5e9]', text: 'text-green-800', icon: 'shopping_cart' },
  Gym: { bg: 'bg-gym-accent/30', text: 'text-[#1b4d21]', icon: 'fitness_center' },
  Idea: { bg: 'bg-primary-container/20', text: 'text-primary', icon: 'lightbulb' },
  Career: { bg: 'bg-career-accent/30', text: 'text-[#1a4a50]', icon: 'work' },
  Task: { bg: 'bg-tertiary-container/30', text: 'text-tertiary', icon: 'task_alt' },
  Uncategorized: { bg: 'bg-surface-container-high', text: 'text-on-surface-variant', icon: 'category' },
};

const reminderColors = [
  { bg: 'bg-[#a9ccff]/20', border: 'border-[#a9ccff]/20', accent: 'text-[#395d8a]', title: 'text-[#1d436e]', desc: 'text-[#274c78]' },
  { bg: 'bg-[#ff9fff]/20', border: 'border-[#ff9fff]/20', accent: 'text-[#b41340]', title: 'text-[#510017]', desc: 'text-[#a70138]' },
  { bg: 'bg-primary-container/20', border: 'border-primary-container/20', accent: 'text-primary', title: 'text-on-primary-container', desc: 'text-on-primary-fixed-variant' },
];

export default async function DashboardPage() {
  const auth = await verifyAuth();
  if (!auth) return null;

  const { reminders, recentIdeas, openCount } = await getDashboardData(auth.userId);

  return (
    <>
      {/* Top App Bar */}
      <header className="w-full top-0 px-6 py-4 bg-surface z-40 sticky">
        <div className="flex justify-between items-center w-full max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary-container bg-primary-container/30 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-xl">person</span>
            </div>
            <h1 className="text-xl font-extrabold text-on-surface tracking-tight md:hidden">Second Brain</h1>
          </div>
          <Link href="/settings" className="text-on-surface-variant hover:opacity-80 transition-opacity active:scale-95 duration-200">
            <span className="material-symbols-outlined">settings</span>
          </Link>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 space-y-10">
        {/* iOS Install Banner */}
        <IOSInstallBanner />

        {/* Hero — Today's Focus */}
        <section className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-8 bg-surface-container-lowest rounded-xl p-8 flex flex-col justify-between min-h-[320px] relative overflow-hidden group">
            <div className="relative z-10">
              <span className="font-bold text-primary tracking-widest uppercase text-xs">Today&apos;s Focus</span>
              <h2 className="text-4xl font-extrabold mt-2 leading-tight">
                Curate your thoughts,<br />clear your mind.
              </h2>
              <div className="mt-6 flex flex-wrap gap-3">
                <span className="px-4 py-2 bg-secondary-container text-on-secondary-container rounded-full text-sm font-bold">
                  {openCount} Open Items
                </span>
                <span className="px-4 py-2 bg-tertiary-container text-on-tertiary-container rounded-full text-sm font-bold">
                  {recentIdeas.length} Recent Ideas
                </span>
              </div>
            </div>
            <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-gradient-to-br from-primary-container to-tertiary-fixed rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity duration-700" />
          </div>

          {/* Reminder Widget */}
          <div className="md:col-span-4 space-y-6">
            <div className="bg-[#ffbe59]/20 rounded-xl p-6 h-full border border-[#ffbe59]/10">
              <div className="flex justify-between items-start mb-4">
                <span className="material-symbols-outlined text-[#7d5300] bg-white p-2 rounded-full" style={{ fontVariationSettings: "'FILL' 1" }}>lightbulb</span>
                <span className="text-xs font-bold text-[#7d5300] uppercase tracking-widest">Quick Tip</span>
              </div>
              <h3 className="text-lg font-bold text-[#624000]">Capture everything</h3>
              <p className="text-sm mt-2 text-[#6f4900] opacity-80">
                Use the input bar below to quickly dump thoughts. AI will organize them for you.
              </p>
            </div>
          </div>
        </section>

        {/* Today's Reminders */}
        <section>
          <div className="flex justify-between items-end mb-6">
            <div>
              <h2 className="text-2xl font-extrabold">Today&apos;s Reminders</h2>
              <p className="text-on-surface-variant text-sm">Gentle nudges for a productive day</p>
            </div>
            <Link href="/logs" className="text-primary font-bold text-sm hover:underline">View All</Link>
          </div>
          {reminders.length === 0 ? (
            <div className="bg-surface-container-low p-8 rounded-xl text-center">
              <span className="material-symbols-outlined text-4xl text-on-surface-variant/30 mb-2">notifications_off</span>
              <p className="text-on-surface-variant">No reminders for today. Enjoy your clarity!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {reminders.map((reminder, i) => {
                const colorScheme = reminderColors[i % reminderColors.length];
                const catInfo = categoryColors[reminder.category] || categoryColors.Uncategorized;
                return (
                  <div key={reminder.id} className={`${colorScheme.bg} p-6 rounded-lg border ${colorScheme.border} hover:scale-[1.02] transition-transform duration-300`}>
                    <div className="flex items-center gap-3 mb-4">
                      <span className={`material-symbols-outlined ${colorScheme.accent}`}>{catInfo.icon}</span>
                      <span className={`text-[10px] font-extrabold uppercase tracking-widest ${colorScheme.accent}`}>{reminder.category}</span>
                    </div>
                    <h4 className={`font-bold ${colorScheme.title} text-lg`}>{reminder.clean_text || reminder.raw_text}</h4>
                    {reminder.context_tags.length > 0 && (
                      <p className={`text-sm ${colorScheme.desc} mt-1`}>{reminder.context_tags.map(t => `#${t}`).join(' ')}</p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Recent Ideas */}
        <section className="pb-12">
          <h2 className="text-2xl font-extrabold mb-6">Recent Ideas</h2>
          {recentIdeas.length === 0 ? (
            <div className="bg-surface-container-low p-8 rounded-xl text-center">
              <span className="material-symbols-outlined text-4xl text-on-surface-variant/30 mb-2">lightbulb</span>
              <p className="text-on-surface-variant">No ideas captured yet. Start typing below!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentIdeas.map((idea) => (
                <div key={idea.id} className="group flex items-center gap-6 p-4 rounded-xl bg-surface-container-low hover:bg-white transition-all duration-300">
                  <div className="w-16 h-16 rounded-lg bg-primary-container/20 flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-primary text-2xl">lightbulb</span>
                  </div>
                  <div className="flex-grow min-w-0">
                    <h5 className="font-bold text-on-surface truncate">{idea.clean_text || idea.raw_text}</h5>
                    <p className="text-sm text-on-surface-variant line-clamp-1">{idea.raw_text}</p>
                  </div>
                  <div className="text-right hidden sm:block flex-shrink-0">
                    <p className="text-xs font-bold text-on-surface-variant uppercase tracking-tighter">
                      {new Date(idea.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
}
