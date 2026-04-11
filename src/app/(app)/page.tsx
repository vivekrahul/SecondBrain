import { verifyAuth } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import PWAInstallPrompt from '@/components/PWAInstallPrompt';
import Link from 'next/link';
import MobileHeader from '@/components/MobileHeader';
import DashboardCapture from '@/components/DashboardCapture';
import type { BrainDump } from '@/lib/types';

import { cookies } from 'next/headers';

async function getDashboardData(userId: string, workspace: string) {
  const today = new Date().toISOString().split('T')[0];

  const [tasksRes, ideasRes, shoppingRes] = await Promise.all([
    supabaseAdmin
      .from('brain_dump')
      .select('*')
      .eq('user_id', userId)
      .eq('workspace', workspace)
      .eq('category', 'Task')
      .eq('status', 'Open')
      .order('created_at', { ascending: false })
      .limit(5),
    supabaseAdmin
      .from('brain_dump')
      .select('*')
      .eq('user_id', userId)
      .eq('workspace', workspace)
      .eq('category', 'Idea')
      .eq('status', 'Open')
      .order('created_at', { ascending: false })
      .limit(3),
    supabaseAdmin
      .from('brain_dump')
      .select('*')
      .eq('user_id', userId)
      .eq('workspace', workspace)
      .eq('category', 'Grocery')
      .eq('status', 'Open')
      .order('created_at', { ascending: false })
      .limit(4),
  ]);

  return {
    tasks: (tasksRes.data || []) as BrainDump[],
    ideas: (ideasRes.data || []) as BrainDump[],
    rhythms: (shoppingRes.data || []) as BrainDump[],
  };
}

export default async function DashboardPage() {
  const auth = await verifyAuth();
  if (!auth) return null;

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('name, email')
    .eq('id', auth.userId)
    .single();

  const cookieStore = await cookies();
  const workspace = cookieStore.get('sb-workspace-mode')?.value || 'home';

  const displayName = profile?.name || profile?.email?.split('@')[0] || 'User';
  const { tasks, ideas, rhythms } = await getDashboardData(auth.userId, workspace);

  // Formatting date for header
  const dateOptions: Intl.DateTimeFormatOptions = { weekday: 'long', month: 'long', day: 'numeric' };
  const todayString = new Date().toLocaleDateString('en-US', dateOptions);

  return (
    <>
      <div className="md:hidden px-6 sticky top-0 w-full bg-surface z-50">
        <MobileHeader />
      </div>

      <div className="px-6 pt-4 md:pt-12 max-w-6xl mx-auto pb-40 animate-page-enter">
        <PWAInstallPrompt />

        {/* Desktop Header */}
        <header className="hidden md:flex justify-between items-center mb-12">
          <div className="flex items-center gap-4">
            <Link href="/settings" className="w-10 h-10 flex items-center justify-center rounded-xl bg-surface-container active:scale-95 transition-transform hover:bg-surface-container-high" aria-label="Settings">
              <span className="material-symbols-outlined text-primary">psychiatry</span>
            </Link>
            <h1 className="text-2xl font-semibold text-on-surface">
              Good morning, {displayName}. <span className="font-normal text-on-surface-variant">Here&apos;s your companion for today.</span>
            </h1>
          </div>
          <div className="flex items-center gap-2 text-sm text-on-surface-variant font-medium">
            <span className="material-symbols-outlined text-primary-dim text-lg">calendar_today</span>
            <span>{todayString}</span>
          </div>
        </header>

        {/* Input Bar */}
        <DashboardCapture />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Focus Flow */}
          <div className="cozy-card p-6 border-l-[3px] border-secondary-dim">
            <Link href="/tasks" className="flex justify-between hover:opacity-70 transition-opacity">
              <div className="flex items-center gap-3 mb-5">
                <span className="material-symbols-outlined text-secondary">eco</span>
                <h2 className="text-base text-on-surface">Focus Flow</h2>
              </div>
              <span className="material-symbols-outlined text-outline-variant text-sm mt-1">open_in_new</span>
            </Link>
            
            <ul className="space-y-4 text-sm text-on-surface min-h-[140px]">
              {tasks.length > 0 ? tasks.map(t => (
                <li key={t.id} className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-outline-variant text-[16px] mt-0.5">radio_button_unchecked</span>
                  <span className="line-clamp-2">{t.clean_text || t.raw_text}</span>
                </li>
              )) : (
                <li className="text-outline-variant italic text-xs">No pending tasks. Mind is clear!</li>
              )}
            </ul>
            <div className="mt-6 pt-4 border-t border-surface-variant text-xs text-outline-variant flex items-center">
              <span className="material-symbols-outlined text-[14px] mr-1">schedule</span>
              {tasks.length} Focus Items Today
            </div>
          </div>

          {/* Idea Sparks */}
          <div className="cozy-card p-6 border-l-[3px] border-primary-container">
            <Link href="/ideas" className="flex justify-between hover:opacity-70 transition-opacity">
              <div className="flex items-center gap-3 mb-5">
                <span className="material-symbols-outlined text-primary-dim">lightbulb</span>
                <h2 className="text-base text-on-surface">Idea Sparks</h2>
              </div>
              <span className="material-symbols-outlined text-outline-variant text-sm mt-1">open_in_new</span>
            </Link>

            <div className="space-y-4 min-h-[140px]">
              {ideas.length > 0 ? ideas.map(i => (
                <div key={i.id} className="space-y-2">
                  <div className="tag-amber px-3 py-1 rounded-md text-xs font-medium inline-block truncate max-w-full">
                    {i.context_tags?.[0] || 'Unsorted'}
                  </div>
                  <p className="text-sm text-on-surface line-clamp-2">{i.clean_text || i.raw_text}</p>
                </div>
              )) : (
                <div className="text-outline-variant italic text-xs">Awaiting inspiration...</div>
              )}
            </div>
            <div className="mt-6 pt-4 border-t border-surface-variant text-xs text-outline-variant">
              + More sparks awaiting synthesis.
            </div>
          </div>

          {/* Shopping */}
          <div className="cozy-card p-6 border-l-[3px] border-secondary-dim">
            <Link href="/shopping" className="flex justify-between hover:opacity-70 transition-opacity">
              <div className="flex items-center gap-3 mb-5">
                <span className="material-symbols-outlined text-secondary">shopping_cart</span>
                <h2 className="text-base text-on-surface">Shopping</h2>
              </div>
              <span className="material-symbols-outlined text-outline-variant text-sm mt-1">open_in_new</span>
            </Link>

            <div className="space-y-4 min-h-[140px]">
              {rhythms.length > 0 ? rhythms.map(r => (
                <div key={r.id} className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-outline-variant text-[16px] mt-0.5">radio_button_unchecked</span>
                  <span className="text-sm line-clamp-1">{r.clean_text || r.raw_text}</span>
                </div>
              )) : (
                 <div className="text-outline-variant italic text-xs">No shopping items yet.</div>
              )}
            </div>
            <div className="mt-6 pt-4 border-t border-surface-variant text-xs text-outline-variant">
              Tap to view full list.
            </div>
          </div>

          {/* Focus Mode CTA */}
          <Link href="/focus" className="cozy-card p-6 border-l-[3px] border-primary-container group">
            <div className="flex items-center gap-3 mb-5">
              <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>self_improvement</span>
              <h2 className="text-base text-on-surface">Focus Mode</h2>
            </div>
            <div className="min-h-[140px] flex flex-col justify-center items-center text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-primary text-3xl">timer</span>
              </div>
              <p className="text-sm text-on-surface font-medium mb-1">Need to deep-focus?</p>
              <p className="text-xs text-on-surface-variant">Start a Pomodoro session or pick a task to lock in.</p>
            </div>
            <div className="mt-6 pt-4 border-t border-surface-variant text-xs text-primary font-medium flex items-center gap-1">
              Enter Focus <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </div>
          </Link>

        </div>

        <footer className="max-w-4xl mx-auto p-6 cozy-card mt-12 text-center text-sm text-on-surface-variant">
            <p>You&apos;ve offloaded <span className="font-bold text-primary">{tasks.length + ideas.length + rhythms.length} thoughts</span> recently. Well done.</p>
            <p className="text-xs text-outline-variant mt-2">The AI is connecting your notes in the background. <Link href="/insights" className="text-primary-dim font-medium hover:underline">View Map?</Link></p>
        </footer>

      </div>
    </>
  );
}
