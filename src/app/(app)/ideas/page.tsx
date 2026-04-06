import { verifyAuth } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import type { BrainDump } from '@/lib/types';
import EntryOptions from '@/components/EntryOptions';

const cardColors = [
  { bg: 'bg-primary-container', text: 'text-on-primary-container', tag: 'bg-white/30', label: 'text-on-primary-container', time: 'text-on-primary-container/40' },
  { bg: 'bg-tertiary-container', text: 'text-on-tertiary-container', tag: 'bg-white/30', label: 'text-on-tertiary-container', time: 'text-on-tertiary-container/40' },
  { bg: 'bg-secondary-container', text: 'text-on-secondary-container', tag: 'bg-white/30', label: 'text-on-secondary-container', time: 'text-on-secondary-container/40' },
  { bg: 'bg-[#ff9fff]', text: 'text-[#620062]', tag: 'bg-white/30', label: 'text-[#620062]', time: 'text-[#620062]/40' },
];

const rotations = ['rotate-1', '-rotate-1', 'rotate-1', '-rotate-2'];

export default async function IdeasPage() {
  const auth = await verifyAuth();
  if (!auth) return null;

  const { data } = await supabaseAdmin
    .from('brain_dump')
    .select('*')
    .eq('user_id', auth.userId)
    .eq('category', 'Idea')
    .eq('status', 'Open')
    .order('created_at', { ascending: false })
    .limit(20);

  const ideas = (data || []) as BrainDump[];

  return (
    <>
      {/* Top Bar */}
      <header className="sticky top-0 z-50 bg-surface w-full px-6 py-4">
        <div className="flex justify-between items-center w-full max-w-3xl mx-auto">
          <h1 className="font-extrabold text-xl tracking-tight text-on-surface md:hidden">Second Brain</h1>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 pt-4 pb-40">
        {/* Welcome Section */}
        <section className="mb-10">
          <h2 className="text-4xl font-extrabold tracking-tight text-on-surface mb-2">Curated Thoughts</h2>
          <p className="text-on-surface-variant font-medium">Capture, connect, and refine your mental landscape.</p>
        </section>

        {ideas.length === 0 ? (
          <div className="bg-surface-container-low p-12 rounded-xl text-center">
            <span className="material-symbols-outlined text-6xl text-on-surface-variant/20 mb-4">lightbulb</span>
            <h3 className="text-xl font-bold text-on-surface mb-2">No ideas yet</h3>
            <p className="text-on-surface-variant">Your creative canvas awaits. Start capturing sparks of inspiration below.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {ideas.map((idea, i) => {
              const color = cardColors[i % cardColors.length];
              const rotation = rotations[i % rotations.length];
              
              // Every 5th card is a featured glass card
              if (i > 0 && i % 5 === 0) {
                return (
                  <article key={idea.id} className="col-span-1 md:col-span-2 bg-white/70 backdrop-blur-xl border border-white/40 p-10 rounded-xl shadow-[0_32px_64px_rgba(46,47,47,0.04)] my-6 animate-fade-in-up">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="p-3 bg-primary/10 rounded-full">
                        <span className="material-symbols-outlined text-primary">lightbulb</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-extrabold text-xl text-on-surface leading-none">Featured Insight</h3>
                        <span className="text-on-surface-variant text-xs font-bold tracking-widest uppercase">Deep Focus</span>
                      </div>
                      <div className="absolute top-6 right-6">
                        <EntryOptions entry={idea} darkIcon={true} />
                      </div>
                    </div>
                    <p className="text-on-surface text-2xl font-bold leading-snug">
                      {idea.clean_text || idea.raw_text}
                    </p>
                    <div className="mt-8 pt-6 border-t border-surface-container-high flex justify-between items-center">
                      <div className="flex gap-2">
                        {idea.context_tags.slice(0, 3).map((tag) => (
                          <span key={tag} className="px-3 py-1 bg-surface-container-low rounded-full text-xs font-medium text-on-surface-variant">#{tag}</span>
                        ))}
                      </div>
                      <span className="text-[10px] font-bold text-on-surface-variant/60 uppercase">
                        {new Date(idea.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  </article>
                );
              }

              return (
                <article
                  key={idea.id}
                  className={`${color.bg} p-8 rounded-lg flex flex-col gap-4 transform ${rotation} hover:rotate-0 transition-transform duration-300 animate-fade-in-up`}
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  <div className="flex justify-between items-start">
                    <span className={`${color.text} text-xs font-bold uppercase tracking-widest px-3 py-1 ${color.tag} rounded-full`}>
                      Idea
                    </span>
                    <div className="flex items-center gap-1 group/options">
                      {idea.context_tags.includes('review') && (
                        <span className="bg-white/90 text-on-primary-container px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest">Review</span>
                      )}
                      <EntryOptions entry={idea} />
                    </div>
                  </div>
                  <p className={`${color.text} text-lg font-bold leading-tight`}>
                    {idea.clean_text || idea.raw_text}
                  </p>
                  <div className="mt-4 flex items-center gap-2">
                    {idea.context_tags.slice(0, 2).map((tag) => (
                      <span key={tag} className="bg-white/90 text-on-primary-container px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest">
                        {tag}
                      </span>
                    ))}
                    <span className={`${color.time} text-[10px] font-bold uppercase`}>
                      {new Date(idea.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
