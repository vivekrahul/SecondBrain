import { verifyAuth } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import type { BrainDump } from '@/lib/types';
import { cookies } from 'next/headers';
import MobileHeader from '@/components/MobileHeader';

function getPast30Days() {
  const days = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().split('T')[0]);
  }
  return days;
}

export default async function InsightsPage() {
  const auth = await verifyAuth();
  if (!auth) return null;

  const cookieStore = await cookies();
  const workspace = cookieStore.get('sb-workspace-mode')?.value || 'home';

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const thirtyDaysStr = thirtyDaysAgo.toISOString();

  // Fetch all recent entries for consistency calculations
  const { data } = await supabaseAdmin
    .from('brain_dump')
    .select('*')
    .eq('user_id', auth.userId)
    .eq('workspace', workspace)
    .or(`created_at.gte.${thirtyDaysStr},completed_at.gte.${thirtyDaysStr}`)
    .order('created_at', { ascending: false });

  const entries = (data || []) as BrainDump[];

  // Process data
  const days = getPast30Days();
  const heatMap: Record<string, number> = {};
  days.forEach(d => (heatMap[d] = 0));

  let totalAdded = 0;
  let totalCompleted = 0;
  
  const categoryBreakdown: Record<string, { added: number; completed: number }> = {};

  entries.forEach(entry => {
    const addedDate = new Date(entry.created_at).toISOString().split('T')[0];
    const category = entry.category || 'Uncategorized';

    if (!categoryBreakdown[category]) {
      categoryBreakdown[category] = { added: 0, completed: 0 };
    }

    if (addedDate >= days[0]) {
      totalAdded++;
      categoryBreakdown[category].added++;
    }

    if (entry.status === 'Done' && entry.completed_at) {
      const completedDate = new Date(entry.completed_at).toISOString().split('T')[0];
      if (heatMap[completedDate] !== undefined) {
        heatMap[completedDate]++;
        totalCompleted++;
        categoryBreakdown[category].completed++;
      }
    }
  });

  const getIntensity = (count: number) => {
    if (count === 0) return 'bg-surface-container-high/50';
    if (count <= 2) return 'bg-primary/30';
    if (count <= 4) return 'bg-primary/60';
    return 'bg-primary';
  };

  const sortedCategories = Object.entries(categoryBreakdown).sort((a, b) => b[1].completed - a[1].completed);

  return (
    <>
      <div className="md:hidden pt-4 px-6 sticky top-0 w-full bg-surface z-50">
        <MobileHeader />
      </div>

      <div className="max-w-4xl mx-auto px-6 mt-8 pb-40 animate-page-enter">
        <header className="mb-12">
          <h1 className="text-3xl font-extrabold text-on-surface flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-4xl">analytics</span>
            Your Insights
          </h1>
          <p className="text-on-surface-variant mt-2 text-sm">
            Tracking your consistency and focus over the last 30 days in <span className="capitalize font-bold">{workspace}</span> mode.
          </p>
        </header>

        {/* Hero Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <div className="cozy-card p-6 flex flex-col justify-center items-center text-center">
            <span className="text-4xl font-black text-on-surface mb-1">{totalAdded}</span>
            <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Added</span>
          </div>
          <div className="cozy-card p-6 flex flex-col justify-center items-center text-center">
            <span className="text-4xl font-black text-primary mb-1">{totalCompleted}</span>
            <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Completed</span>
          </div>
          <div className="cozy-card p-6 col-span-2 flex flex-col justify-center items-start pl-8 bg-primary-container border-none text-on-primary-container">
            <span className="text-xl font-bold mb-1">Consistency Rate</span>
            <span className="text-sm opacity-80 mt-1">
              {totalAdded > 0 ? Math.round((totalCompleted / totalAdded) * 100) : 0}% completion ratio over the last 30 days. Maintain the momentum!
            </span>
          </div>
        </div>

        {/* Heatmap */}
        <div className="cozy-card p-6 mb-10 border-l-[3px] border-primary">
          <div className="flex items-center gap-2 mb-6">
            <span className="material-symbols-outlined text-primary">local_fire_department</span>
            <h2 className="text-lg font-bold">30-Day Consistency</h2>
          </div>
          <div className="flex flex-wrap gap-[6px]">
            {days.map((day, i) => {
               const isToday = i === days.length - 1;
               return (
                 <div key={day} className="flex flex-col items-center gap-1 group relative">
                   <div 
                     className={`w-6 h-6 sm:w-8 sm:h-8 rounded-md transition-all duration-300 hover:scale-110 ${getIntensity(heatMap[day])} ${isToday ? 'ring-2 ring-offset-2 ring-primary ring-offset-surface' : ''}`}
                   />
                   <span className="text-[10px] text-on-surface-variant opacity-50 absolute -bottom-5 hidden group-hover:block transition-opacity whitespace-nowrap bg-surface-container px-2 py-0.5 rounded-full z-10 shadow-sm border border-surface-variant">
                     {heatMap[day]} done
                   </span>
                 </div>
               )
            })}
          </div>
          <div className="mt-8 flex items-center gap-2 text-xs text-on-surface-variant justify-end">
            <span>Less</span>
            <div className="w-3 h-3 rounded-sm bg-surface-container-high/50" />
            <div className="w-3 h-3 rounded-sm bg-primary/30" />
            <div className="w-3 h-3 rounded-sm bg-primary/60" />
            <div className="w-3 h-3 rounded-sm bg-primary" />
            <span>More</span>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="cozy-card p-6 mb-10">
          <div className="flex items-center gap-2 mb-6">
            <span className="material-symbols-outlined text-secondary hover:animate-spin">donut_large</span>
            <h2 className="text-lg font-bold">Category Breakdown</h2>
          </div>
          <div className="space-y-6">
            {sortedCategories.length > 0 ? sortedCategories.map(([category, stats]) => {
              const maxVal = Math.max(...sortedCategories.map(s => s[1].added));
              // Normalize length so the longest item spans 100% of the bar width allowed
              const normalizeScale = maxVal > 0 ? (stats.added / maxVal) * 100 : 0;
              const addedPercent = Math.max(normalizeScale, 5); // At least 5% width to be visible
              
              const completedPercent = stats.added > 0 ? (stats.completed / stats.added) * 100 : 0;

              return (
                <div key={category} className="space-y-2">
                  <div className="flex justify-between items-end">
                    <span className="text-sm font-bold capitalize">{category === "Task" ? "Focus Flow" : category}</span>
                    <span className="text-xs text-on-surface-variant font-medium">{stats.completed} / {stats.added} done</span>
                  </div>
                  {/* Background Track (Added) */}
                  <div className="w-full relative h-3">
                     <div className="absolute top-0 left-0 h-3 bg-surface-container rounded-full overflow-hidden" style={{ width: `${addedPercent}%` }}>
                        {/* Foreground Track (Completed) */}
                        <div 
                          className="absolute top-0 left-0 h-full bg-secondary transition-all duration-1000 ease-out rounded-full"
                          style={{ width: `${completedPercent}%` }}
                        />
                     </div>
                  </div>
                </div>
              );
            }) : (
               <div className="text-sm text-outline-variant italic">No data to display for this timeframe.</div>
            )}
          </div>
        </div>

      </div>
    </>
  );
}
