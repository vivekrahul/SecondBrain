import { verifyAuth } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import type { BrainDump } from '@/lib/types';
import ShoppingList from './ShoppingList';

export default async function ShoppingPage() {
  const auth = await verifyAuth();
  if (!auth) return null;

  const { data } = await supabaseAdmin
    .from('brain_dump')
    .select('*')
    .eq('user_id', auth.userId)
    .eq('category', 'Grocery')
    .order('created_at', { ascending: false })
    .limit(50);

  const items = (data || []) as BrainDump[];
  const openItems = items.filter(i => i.status === 'Open');
  const doneItems = items.filter(i => i.status === 'Done');
  const total = items.length;
  const donePercent = total > 0 ? Math.round((doneItems.length / total) * 100) : 0;

  return (
    <>
      {/* Top Bar */}
      <header className="bg-surface w-full top-0 px-6 py-4 sticky z-40">
        <div className="flex justify-between items-center w-full max-w-7xl mx-auto">
          <h1 className="text-xl font-extrabold text-on-surface tracking-tight md:hidden">Second Brain</h1>
        </div>
      </header>

      <div className="px-6 max-w-7xl mx-auto space-y-8 pt-6 pb-40 animate-page-enter">
        <ShoppingList
          openItems={openItems}
          doneItems={doneItems}
          donePercent={donePercent}
          total={total}
        />
      </div>
    </>
  );
}
