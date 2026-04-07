import { verifyAuth } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import type { BrainDump } from '@/lib/types';
import TaskList from './TaskList';
import MobileHeader from '@/components/MobileHeader';

export default async function TasksPage() {
  const auth = await verifyAuth();
  if (!auth) return null;

  const { data } = await supabaseAdmin
    .from('brain_dump')
    .select('*')
    .eq('user_id', auth.userId)
    .eq('category', 'Task')
    .order('created_at', { ascending: false })
    .limit(50);

  const entries = (data || []) as BrainDump[];

  return (
    <>
      <div className="md:hidden pt-4 px-6 sticky top-0 w-full bg-surface/90 backdrop-blur-xl z-50">
        <MobileHeader />
      </div>

      <div className="px-6 pt-8 max-w-screen-md mx-auto pb-40 animate-page-enter">
        <section className="mb-10 text-center md:text-left flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-5xl font-extrabold tracking-tight mb-2">Tasks</h1>
            <p className="text-on-surface-variant text-lg">Things that need to get done.</p>
          </div>
        </section>

        <section>
          {entries.length === 0 ? (
            <div className="bg-surface-container-low p-12 rounded-xl text-center">
              <span className="material-symbols-outlined text-6xl text-on-surface-variant/20 mb-4">task_alt</span>
              <h3 className="text-xl font-bold text-on-surface mb-2">No tasks yet</h3>
              <p className="text-on-surface-variant">Type "Call mom tomorrow" in the capture bar.</p>
            </div>
          ) : (
            <TaskList initialEntries={entries} userId={auth.userId} />
          )}
        </section>
      </div>
    </>
  );
}
