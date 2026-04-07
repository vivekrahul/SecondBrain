import { verifyAuth } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import PWAInstallPrompt from '@/components/PWAInstallPrompt';
import EntryOptions from '@/components/EntryOptions';
import Link from 'next/link';
import type { BrainDump } from '@/lib/types';

async function getDashboardData(userId: string) {
  const today = new Date().toISOString().split('T')[0];

  const [remindersResult, recentIdeasResult, recentTasksResult, statsResult, taskStatsResult] = await Promise.all([
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
      .eq('status', 'Open')
      .order('created_at', { ascending: false })
      .limit(3),
    supabaseAdmin
      .from('brain_dump')
      .select('*')
      .eq('user_id', userId)
      .eq('category', 'Task')
      .eq('status', 'Open')
      .order('created_at', { ascending: false })
      .limit(5),
    supabaseAdmin
      .from('brain_dump')
      .select('id, category')
      .eq('user_id', userId)
      .eq('status', 'Open'),
    supabaseAdmin
      .from('brain_dump')
      .select('id')
      .eq('user_id', userId)
      .eq('category', 'Task')
      .eq('status', 'Open'),
  ]);

  const allOpen = statsResult.data || [];
  const ideaCount = allOpen.filter(e => e.category === 'Idea').length;
  const taskCount = taskStatsResult.data?.length || 0;

  return {
    reminders: (remindersResult.data || []) as BrainDump[],
    recentIdeas: (recentIdeasResult.data || []) as BrainDump[],
    recentTasks: (recentTasksResult.data || []) as BrainDump[],
    openCount: allOpen.length,
    ideaCount,
    taskCount,
  };
}

const reminderColors = [
  { bg: 'bg-[#a9ccff]/20', border: 'border-[#a9ccff]/20', icon: 'water_drop', iconColor: 'text-[#395d8a]', label: 'text-[#395d8a]', title: 'text-[#1d436e]', desc: 'text-[#274c78]' },
  { bg: 'bg-[#ff9fff]/20', border: 'border-[#ff9fff]/20', icon: 'favorite', iconColor: 'text-[#b41340]', label: 'text-[#b41340]', title: 'text-[#510017]', desc: 'text-[#a70138]' },
  { bg: 'bg-primary-container/20', border: 'border-primary-container/20', icon: 'auto_awesome', iconColor: 'text-primary', label: 'text-primary', title: 'text-on-primary-container', desc: 'text-on-primary-fixed-variant' },
];

export default async function DashboardPage() {
  const auth = await verifyAuth();
  if (!auth) return null;

  const { reminders, recentIdeas, recentTasks, openCount, ideaCount, taskCount } = await getDashboardData(auth.userId);

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
          <div className="flex gap-2">
            <Link href="/insights" className="text-on-surface-variant hover:opacity-80 transition-opacity active:scale-95 duration-200">
              <span className="material-symbols-outlined">analytics</span>
            </Link>
            <Link href="/settings" className="text-on-surface-variant hover:opacity-80 transition-opacity active:scale-95 duration-200">
              <span className="material-symbols-outlined">settings</span>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 space-y-10 animate-page-enter">
        {/* PWA Install Prompt */}
        <PWAInstallPrompt />

        {/* === Bento Grid: Hero + Quick Stats === */}
        <section className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Hero — Today's Focus */}
          <div className="md:col-span-8 bg-surface-container-lowest rounded-xl p-8 flex flex-col justify-between min-h-[320px] relative overflow-hidden group">
            <div className="relative z-10">
              <span className="font-bold text-primary tracking-widest uppercase text-xs">Today&apos;s Focus</span>
              <h2 className="text-4xl font-extrabold mt-2 leading-tight">
                Curate your thoughts,<br />clear your mind.
              </h2>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/logs" className="px-4 py-2 bg-secondary-container text-on-secondary-container rounded-full text-sm font-bold hover:scale-105 transition-transform active:scale-95">
                  {openCount} Open Items
                </Link>
                <Link href="/ideas" className="px-4 py-2 bg-tertiary-container text-on-tertiary-container rounded-full text-sm font-bold hover:scale-105 transition-transform active:scale-95">
                  {ideaCount} Ideas Captured
                </Link>
              </div>
            </div>
            <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-gradient-to-br from-primary-container to-tertiary-fixed rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity duration-700" />
          </div>

          {/* Quick Tip Widget */}
          <div className="md:col-span-4 space-y-6">
            <div className="bg-[#ffbe59]/20 rounded-xl p-6 h-full border border-[#ffbe59]/10 flex flex-col justify-between">
              <div className="flex justify-between items-start mb-4">
                <span className="material-symbols-outlined text-[#7d5300] bg-white p-2 rounded-full" style={{ fontVariationSettings: "'FILL' 1" }}>lightbulb</span>
                <span className="text-xs font-bold text-[#7d5300] uppercase tracking-widest">Quick Stats</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#624000]">{taskCount} Active Tasks</h3>
                <p className="text-sm mt-2 text-[#6f4900] opacity-80">
                  {taskCount === 0 
                    ? 'All clear! No pending tasks right now.'
                    : 'Stay focused and check off your to-dos below.'}
                </p>
              </div>
              <Link href="/tasks" className="mt-4 text-sm font-bold text-[#7d5300] flex items-center gap-1 hover:underline">
                View Tasks <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </Link>
            </div>
          </div>
        </section>

        {/* === Today's Reminders === */}
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
                const cs = reminderColors[i % reminderColors.length];
                return (
                  <div key={reminder.id} className={`${cs.bg} p-6 rounded-lg border ${cs.border} hover:scale-[1.02] transition-transform duration-300 group`}>
                    <div className="flex items-center gap-3 mb-4">
                      <span className={`material-symbols-outlined ${cs.iconColor}`}>{cs.icon}</span>
                      <span className={`text-[10px] font-extrabold uppercase tracking-widest ${cs.label}`}>{reminder.category}</span>
                    </div>
                    <h4 className={`font-bold ${cs.title} text-lg`}>{reminder.clean_text || reminder.raw_text}</h4>
                    {reminder.context_tags && reminder.context_tags.length > 0 && (
                      <p className={`text-sm ${cs.desc} mt-1`}>{reminder.context_tags.map(t => `#${t}`).join(' ')}</p>
                    )}
                    <div className="mt-4 flex justify-between items-center">
                      <span className={`text-xs font-bold ${cs.label}`}>
                        {new Date(reminder.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* === Recent Ideas === */}
        <section>
          <div className="flex justify-between items-end mb-6">
            <h2 className="text-2xl font-extrabold">Recent Ideas</h2>
            <Link href="/ideas" className="text-primary font-bold text-sm hover:underline">View All</Link>
          </div>
          {recentIdeas.length === 0 ? (
            <div className="bg-surface-container-low p-8 rounded-xl text-center">
              <span className="material-symbols-outlined text-4xl text-on-surface-variant/30 mb-2">lightbulb</span>
              <p className="text-on-surface-variant">No ideas yet. Start capturing sparks of inspiration!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentIdeas.map((idea) => (
                <div key={idea.id} className="group flex items-center gap-6 p-4 rounded-xl bg-surface-container-low hover:bg-white transition-all duration-300">
                  <div className="w-16 h-16 rounded-lg bg-primary-container/30 flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-primary text-2xl">lightbulb</span>
                  </div>
                  <div className="flex-grow min-w-0">
                    <h5 className="font-bold text-on-surface truncate">{idea.clean_text || idea.raw_text}</h5>
                    {idea.context_tags && idea.context_tags.length > 0 && (
                      <p className="text-sm text-on-surface-variant line-clamp-1">{idea.context_tags.map(t => `#${t}`).join(' ')}</p>
                    )}
                  </div>
                  <div className="text-right hidden sm:block flex-shrink-0">
                    <p className="text-xs font-bold text-on-surface-variant uppercase tracking-tighter">
                      {getRelativeTime(idea.created_at)}
                    </p>
                  </div>
                  <EntryOptions entry={idea} darkIcon={true} />
                </div>
              ))}
            </div>
          )}
        </section>

        {/* === Active Tasks === */}
        <section className="pb-12">
          <div className="flex justify-between items-end mb-6">
            <h2 className="text-2xl font-extrabold">Active Tasks</h2>
            <Link href="/tasks" className="text-primary font-bold text-sm hover:underline">View All</Link>
          </div>
          {recentTasks.length === 0 ? (
            <div className="bg-surface-container-low p-8 rounded-xl text-center">
              <span className="material-symbols-outlined text-4xl text-on-surface-variant/30 mb-2">task_alt</span>
              <p className="text-on-surface-variant">No active tasks. You&apos;re all caught up!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentTasks.map((task) => (
                <div key={task.id} className="group flex items-center gap-6 p-4 rounded-xl bg-surface-container-low hover:bg-white transition-all duration-300">
                  <div className="w-16 h-16 rounded-lg bg-tertiary-container/30 flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-tertiary text-2xl">task_alt</span>
                  </div>
                  <div className="flex-grow min-w-0">
                    <h5 className="font-bold text-on-surface truncate">{task.clean_text || task.raw_text}</h5>
                    {task.context_tags && task.context_tags.length > 0 && (
                      <p className="text-sm text-on-surface-variant line-clamp-1">{task.context_tags.map(t => `#${t}`).join(' ')}</p>
                    )}
                  </div>
                  <div className="text-right hidden sm:block flex-shrink-0">
                    <p className="text-xs font-bold text-on-surface-variant uppercase tracking-tighter">
                      {getRelativeTime(task.created_at)}
                    </p>
                  </div>
                  <EntryOptions entry={task} darkIcon={true} />
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
}

function getRelativeTime(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
