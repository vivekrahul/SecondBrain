import { verifyAuth } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import type { BrainDump } from '@/lib/types';
import EntryOptions from '@/components/EntryOptions';
import MobileHeader from '@/components/MobileHeader';

function groupByDate(entries: BrainDump[]) {
  const groups: { label: string; entries: BrainDump[] }[] = [];
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();

  for (const entry of entries) {
    const date = new Date(entry.created_at).toDateString();
    let label: string;
    if (date === today) label = 'Today';
    else if (date === yesterday) label = 'Yesterday';
    else label = new Date(entry.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    const existing = groups.find(g => g.label === label);
    if (existing) existing.entries.push(entry);
    else groups.push({ label, entries: [entry] });
  }
  return groups;
}

const categoryConfig: Record<string, { badge: string; accent: string; icon: string }> = {
  Gym: { badge: 'bg-gym-accent', accent: 'text-gym-accent', icon: 'fitness_center' },
  Career: { badge: 'bg-career-accent', accent: 'text-career-accent', icon: 'work' },
  Task: { badge: 'bg-tertiary-container', accent: 'text-tertiary', icon: 'task_alt' },
  Idea: { badge: 'bg-primary-container', accent: 'text-primary', icon: 'lightbulb' },
  Grocery: { badge: 'bg-[#e8f5e9]', accent: 'text-green-700', icon: 'shopping_cart' },
  Uncategorized: { badge: 'bg-surface-container-high', accent: 'text-on-surface-variant', icon: 'category' },
};

export default async function LogsPage() {
  const auth = await verifyAuth();
  if (!auth) return null;

  const { data } = await supabaseAdmin
    .from('brain_dump')
    .select('*')
    .eq('user_id', auth.userId)
    .order('created_at', { ascending: false })
    .limit(50);

  const entries = (data || []) as BrainDump[];
  const groups = groupByDate(entries);

  return (
    <>
      <div className="md:hidden pt-4 px-6 sticky top-0 w-full bg-surface z-50">
        <MobileHeader />
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-8 pb-40 animate-page-enter">
        {/* Hero */}
        <section className="mb-10">
          <h2 className="text-4xl font-extrabold tracking-tight mb-2">Activity Stream</h2>
          <p className="text-on-surface-variant max-w-md">Chronological logs from all your captured thoughts and actions.</p>
        </section>

        {entries.length === 0 ? (
          <div className="bg-surface-container-low p-12 rounded-xl text-center">
            <span className="material-symbols-outlined text-6xl text-on-surface-variant/20 mb-4">history</span>
            <h3 className="text-xl font-bold text-on-surface mb-2">No activity yet</h3>
            <p className="text-on-surface-variant">Start capturing thoughts using the input bar below.</p>
          </div>
        ) : (
          <div className="relative space-y-12">
            {/* Timeline line */}
            <div className="absolute left-6 top-4 bottom-4 w-0.5 bg-surface-container hidden md:block" />

            {groups.map((group) => (
              <div key={group.label} className="relative z-10">
                {/* Day Header */}
                <div className="flex items-center mb-8">
                  <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center border-4 border-surface shadow-sm text-primary font-bold mr-6">
                    <span className="text-xs uppercase">{group.label}</span>
                  </div>
                  <div className="h-[1px] flex-1 bg-surface-container" />
                </div>

                {/* Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pl-0 md:pl-20">
                  {group.entries.map((entry, i) => {
                    const config = categoryConfig[entry.category] || categoryConfig.Uncategorized;
                    const isWide = i === 0 && group.entries.length > 2;

                    return (
                      <div
                        key={entry.id}
                        className={`bg-surface-container-lowest rounded-lg p-6 group hover:translate-y-[-4px] transition-transform duration-300 animate-fade-in-up ${isWide ? 'md:col-span-2 relative overflow-hidden' : ''}`}
                        style={{ animationDelay: `${i * 0.05}s` }}
                      >
                        <div className="flex justify-between items-start mb-4">
                          <span className={`px-3 py-1 ${config.badge} text-on-surface text-[10px] font-bold tracking-widest uppercase rounded-full`}>
                            {entry.category}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-outline font-medium">
                              {new Date(entry.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            <EntryOptions entry={entry} darkIcon={true} />
                          </div>
                        </div>
                        <h3 className="text-lg font-bold mb-1">{entry.clean_text || entry.raw_text}</h3>
                        <p className="text-on-surface-variant text-sm mb-4">{entry.raw_text}</p>
                        {entry.context_tags.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {entry.context_tags.map((tag) => (
                              <span key={tag} className="px-3 py-1 bg-surface-container-low rounded-full text-xs font-medium text-on-surface-variant">
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                        {isWide && (
                          <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-career-accent/20 rounded-full blur-3xl" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
