import { verifyAuth } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import type { BrainDump } from '@/lib/types';
import TaskList from './TaskList';

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
      <header className="bg-surface/70 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex justify-between items-center w-full px-6 py-4">
          <span className="text-2xl font-black bg-gradient-to-br from-[#5f4ea5] to-[#b3a1ff] bg-clip-text text-transparent md:hidden">
            Second Brain
          </span>
        </div>
      </header>

      <div className="px-6 pt-8 max-w-screen-md mx-auto pb-40">
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
