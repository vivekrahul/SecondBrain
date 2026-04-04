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
      <header className="flex justify-between items-center px-6 py-4 w-full fixed top-0 bg-[#f7f6f5] dark:bg-stone-950 z-50">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-xl font-extrabold text-[#5f4ea5] dark:text-[#b3a1ff]">neurology</span>
          <span className="font-headline tracking-tight font-extrabold text-xl text-[#5f4ea5] dark:text-[#b3a1ff]">Second Brain</span>
        </div>
      </header>

      <main className="max-w-md w-full mt-20 mb-24 px-4 sm:px-0">
        <div className="bg-surface-container-lowest rounded-xl p-8 shadow-[0_-8px_40px_rgba(46,47,47,0.05)] text-center mb-8 relative">
          <div className="mb-6 inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#b3a1ff]/10">
            <span className="material-symbols-outlined text-3xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>psychology</span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-on-surface mb-2">Welcome, {displayName}!</h1>
          <p className="text-on-surface-variant text-lg">Just text it. We&apos;ll sort it.</p>
        </div>

        <div className="space-y-6">
          {/* Transformation Card 1: Grocery */}
          <div className="bg-surface-container-low rounded-lg p-6 relative overflow-hidden">
            <div className="flex flex-col gap-4">
              <div className="text-on-surface-variant italic text-sm">&quot;Need eggs and whey protein next week&quot;</div>
              <div className="flex items-center gap-4 bg-[#b6eef5]/30 p-4 rounded-full border border-[#b6eef5]/50 relative z-10">
                <span className="material-symbols-outlined text-[#395d8a]">shopping_cart</span>
                <div className="flex gap-3 text-sm font-semibold text-[#1d436e]">
                  <span className="flex items-center gap-1"><span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>check_box</span> Eggs</span>
                  <span className="flex items-center gap-1"><span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>check_box</span> Whey protein</span>
                </div>
              </div>
            </div>
            <div className="absolute top-0 right-0 p-2 opacity-10">
              <span className="material-symbols-outlined text-6xl">nutrition</span>
            </div>
          </div>

          {/* Transformation Card 2: Gym */}
          <div className="bg-surface-container-low rounded-lg p-6 relative overflow-hidden">
            <div className="flex flex-col gap-4">
              <div className="text-on-surface-variant italic text-sm">&quot;Chest day: Benchpress 85kg 5x5&quot;</div>
              <div className="flex items-center gap-4 bg-[#b3a1ff]/20 p-4 rounded-full border border-[#b3a1ff]/30 relative z-10">
                <span className="material-symbols-outlined text-primary">fitness_center</span>
                <div>
                  <div className="text-sm font-bold text-on-primary-container">Benchpress</div>
                  <div className="text-xs text-primary">85kg, 5 sets, 5 reps</div>
                </div>
              </div>
            </div>
          </div>

          {/* Transformation Card 3: Idea */}
          <div className="bg-surface-container-low rounded-lg p-6 relative overflow-hidden">
            <div className="flex flex-col gap-4">
              <div className="text-on-surface-variant italic text-sm">&quot;Idea: Store Kholo neighborhood launch strategy&quot;</div>
              <div className="flex items-center justify-between bg-[#ffbe59]/20 p-4 rounded-full border border-[#ffbe59]/30 relative z-10">
                <div className="flex items-center gap-4">
                  <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>lightbulb</span>
                  <div className="text-sm font-bold text-[#624000]">Launch strategy</div>
                </div>
                <span className="bg-secondary-container text-[#624000] px-3 py-1 rounded-full text-[10px] font-bold tracking-wider">#URGENT</span>
              </div>
            </div>
          </div>

          {/* Transformation Card 4: Reminder */}
          <div className="bg-surface-container-low rounded-lg p-6 relative overflow-hidden">
            <div className="flex flex-col gap-4">
              <div className="text-on-surface-variant italic text-sm">&quot;Remind me to renew domain in 30 days&quot;</div>
              <div className="flex items-center gap-4 bg-[#ff9fff]/20 p-4 rounded-full border border-[#ff9fff]/30 relative z-10">
                <span className="material-symbols-outlined text-[#a70138]">calendar_today</span>
                <div>
                  <div className="text-sm font-bold text-on-surface">Renew domain</div>
                  <div className="text-xs text-[#a70138]">Due: May 15, 2026</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <OnboardingClient />

      {/* Decorative background elements for Luminous Calm aesthetic */}
      <div className="fixed top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#b3a1ff]/10 rounded-full blur-[120px] -z-10 pointer-events-none"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#ffbe59]/10 rounded-full blur-[120px] -z-10 pointer-events-none"></div>
    </div>
  );
}
