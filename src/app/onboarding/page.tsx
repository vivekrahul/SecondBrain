import { verifyAuth } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { redirect } from 'next/navigation';
import OnboardingClient from './OnboardingClient';

export default async function OnboardingPage() {
  const auth = await verifyAuth();
  if (!auth) redirect('/login');

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('email, name, has_seen_onboarding')
    .eq('id', auth.userId)
    .single();

  if (profile?.has_seen_onboarding) {
    redirect('/');
  }

  const displayName = profile?.name || profile?.email?.split('@')[0] || '';

  return (
    <div className="bg-surface text-on-surface min-h-screen flex flex-col items-center justify-center">
      <header className="flex justify-between items-center px-6 py-4 w-full fixed top-0 bg-surface/90 backdrop-blur-xl z-50">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-xl font-extrabold text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>psychiatry</span>
          <span className="font-headline tracking-tight font-extrabold text-xl text-primary">Second Brain</span>
        </div>
      </header>

      <main className="max-w-md w-full mt-20 mb-24 px-4 sm:px-0">
        <div className="text-center mb-10 pb-6 border-b border-surface-variant">
          <div className="mb-6 inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10">
            <span className="material-symbols-outlined text-4xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>self_improvement</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-on-surface mb-3">Welcome, {displayName}.</h1>
          <p className="text-on-surface-variant text-base">A calm, behavior-shaping system. Just text it, we&apos;ll organize it.</p>
        </div>

        <div className="space-y-5">
          {/* Feature 1: Shopping */}
          <div className="cozy-card rounded-xl p-5 border-l-[3px] border-secondary">
            <div className="flex flex-col gap-3">
              <div className="text-on-surface-variant italic text-sm">&quot;Need eggs and coffee&quot;</div>
              <div className="flex items-center gap-4 bg-surface-container-lowest p-3 rounded-xl shadow-sm relative z-10">
                <span className="material-symbols-outlined text-secondary">shopping_cart</span>
                <div className="flex font-medium text-sm text-on-surface gap-3">
                  <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-secondary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check_box</span> Eggs</span>
                  <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-outline-variant text-sm">check_box_outline_blank</span> Coffee</span>
                </div>
              </div>
            </div>
          </div>

          {/* Feature 2: Tasks & Focus Mode */}
          <div className="cozy-card rounded-xl p-5 border-l-[3px] border-primary-container">
            <div className="flex flex-col gap-3">
              <div className="text-on-surface-variant italic text-sm">&quot;Finish presentation slides by tonight&quot;</div>
              <div className="flex items-center gap-4 bg-primary/5 p-3 rounded-xl border border-primary/10 relative z-10">
                <span className="material-symbols-outlined text-primary">timer</span>
                <div>
                  <div className="text-sm font-bold text-on-surface">Presentation slides</div>
                  <div className="text-xs text-primary font-medium mt-0.5">Start 25 min Focus Pomodoro →</div>
                </div>
              </div>
            </div>
          </div>

          {/* Feature 3: Ideas */}
          <div className="cozy-card rounded-xl p-5 border-l-[3px] border-primary">
            <div className="flex flex-col gap-3">
              <div className="text-on-surface-variant italic text-sm">&quot;Idea: A cozy dashboard for my life&quot;</div>
              <div className="flex items-center justify-between bg-surface-container-lowest p-3 rounded-xl shadow-sm relative z-10">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary-dim" style={{ fontVariationSettings: "'FILL' 1" }}>lightbulb</span>
                  <div className="text-sm font-bold text-on-surface">Cozy dashboard</div>
                </div>
                <span className="tag-amber px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider">PROJECT</span>
              </div>
            </div>
          </div>

        </div>
      </main>

      <div className="fixed bottom-0 left-0 w-full p-4 bg-surface/90 backdrop-blur-xl border-t border-surface-variant z-40">
        <div className="max-w-md mx-auto">
          <OnboardingClient />
        </div>
      </div>
    </div>
  );
}
