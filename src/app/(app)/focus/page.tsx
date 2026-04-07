import { verifyAuth } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import type { BrainDump } from '@/lib/types';
import FocusSession from './FocusSession';
import MobileHeader from '@/components/MobileHeader';

export default async function FocusPage() {
  const auth = await verifyAuth();
  if (!auth) return null;

  const [tasksRes, ideasRes] = await Promise.all([
    supabaseAdmin
      .from('brain_dump')
      .select('*')
      .eq('user_id', auth.userId)
      .eq('category', 'Task')
      .eq('status', 'Open')
      .order('created_at', { ascending: false })
      .limit(5),
    supabaseAdmin
      .from('brain_dump')
      .select('*')
      .eq('user_id', auth.userId)
      .eq('category', 'Idea')
      .eq('status', 'Open')
      .order('created_at', { ascending: false })
      .limit(3),
  ]);

  const tasks = (tasksRes.data || []) as BrainDump[];
  const ideas = (ideasRes.data || []) as BrainDump[];

  return (
    <>
      <div className="md:hidden px-6 sticky top-0 w-full bg-surface z-50">
        <MobileHeader />
      </div>
      <FocusSession tasks={tasks} ideas={ideas} />
    </>
  );
}
