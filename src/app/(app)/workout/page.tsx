import { verifyAuth } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import type { BrainDump } from '@/lib/types';
import EntryOptions from '@/components/EntryOptions';
import MobileHeader from '@/components/MobileHeader';

export default async function WorkoutPage() {
  const auth = await verifyAuth();
  if (!auth) return null;

  const { data } = await supabaseAdmin
    .from('brain_dump')
    .select('*')
    .eq('user_id', auth.userId)
    .eq('category', 'Gym')
    .order('created_at', { ascending: false })
    .limit(20);

  const entries = (data || []) as BrainDump[];
  const openCount = entries.filter(e => e.status === 'Open').length;

  return (
    <>
      <div className="md:hidden pt-4 px-6 sticky top-0 w-full bg-surface z-50">
        <MobileHeader />
      </div>

      <div className="px-6 pt-8 max-w-4xl mx-auto pb-40 animate-page-enter">
        {/* Hero */}
        <section className="mb-12">
          <h1 className="text-5xl font-extrabold tracking-tight mb-2">Training Lab</h1>
          <p className="text-on-surface-variant text-lg">Your progress is the only anchor you need.</p>
        </section>

        {/* Bento Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="md:col-span-2 bg-surface-container-lowest rounded-xl p-8 flex flex-col justify-between h-64 relative overflow-hidden group soft-shadow-sm">
            <div className="z-10">
              <span className="font-bold uppercase tracking-widest text-primary opacity-60 text-xs">Active Entries</span>
              <h2 className="text-6xl font-black mt-2">
                {openCount} <span className="text-2xl font-medium text-on-surface-variant">open</span>
              </h2>
            </div>
            <div className="z-10 flex gap-2">
              <span className="status-green px-4 py-1 rounded-full text-xs font-bold">{entries.length} total logged</span>
            </div>
            <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-primary-container/20 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-700" />
          </div>

          <div className="bg-primary rounded-xl p-8 text-on-primary flex flex-col justify-between h-64 shadow-[0_8px_32px_0_rgba(95,78,165,0.15)]">
            <span className="material-symbols-outlined text-4xl">bolt</span>
            <div>
              <h3 className="text-xl font-bold">Gym Log</h3>
              <p className="opacity-80">Track your fitness gains</p>
              <p className="mt-4 font-black text-2xl">
                {entries.length > 0 
                  ? new Date(entries[0].created_at).toLocaleDateString('en-US', { weekday: 'short', hour: '2-digit', minute: '2-digit' })
                  : 'No entries yet'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <section>
          <div className="flex justify-between items-end mb-8">
            <h2 className="text-3xl font-bold">Recent Activity</h2>
          </div>

          {entries.length === 0 ? (
            <div className="bg-surface-container-low p-12 rounded-xl text-center">
              <span className="material-symbols-outlined text-6xl text-on-surface-variant/20 mb-4">fitness_center</span>
              <h3 className="text-xl font-bold text-on-surface mb-2">No gym entries yet</h3>
              <p className="text-on-surface-variant">Log your workouts by typing &quot;benchpress 80kg x 8&quot; in the capture bar.</p>
            </div>
          ) : (
            <div className="space-y-8 relative">
              <div className="absolute left-6 top-4 bottom-4 w-px bg-surface-variant hidden md:block" />

              {entries.map((entry, i) => (
                <div key={entry.id} className="md:pl-16 relative group animate-fade-in-up" style={{ animationDelay: `${i * 0.05}s` }}>
                  <div className="hidden md:block absolute left-[1.125rem] top-8 w-3 h-3 rounded-full bg-primary border-4 border-surface z-10" />
                  <div className="bg-surface-container-lowest rounded-lg p-8 soft-shadow-sm hover:shadow-[0_12px_48px_0_rgba(46,47,47,0.08)] transition-all duration-300">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-surface-container-low rounded-lg flex items-center justify-center">
                          <span className="material-symbols-outlined text-primary text-3xl">fitness_center</span>
                        </div>
                        <div>
                          <h3 className="text-xl font-extrabold tracking-tight leading-none">{entry.clean_text || entry.raw_text}</h3>
                          <p className="text-on-surface-variant font-medium mt-1">
                            {new Date(entry.created_at).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {entry.context_tags.map((tag) => (
                          <span key={tag} className="bg-surface-container-high text-on-surface px-4 py-1 rounded-full text-xs font-bold uppercase tracking-tighter">
                            {tag}
                          </span>
                        ))}
                        {entry.status === 'Done' && (
                          <span className="status-green px-4 py-1 rounded-full text-xs font-bold uppercase tracking-tighter">Done</span>
                        )}
                        <EntryOptions entry={entry} darkIcon={true} />
                      </div>
                    </div>
                    <p className="text-on-surface-variant">{entry.raw_text}</p>
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
