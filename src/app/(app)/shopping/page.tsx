import { cookies } from 'next/headers';
import { verifyAuth } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import type { BrainDump } from '@/lib/types';
import ShoppingList from './ShoppingList';
import MobileHeader from '@/components/MobileHeader';

export default async function ShoppingPage() {
  const auth = await verifyAuth();
  if (!auth) return null;

  const cookieStore = await cookies();
  const workspace = cookieStore.get('sb-workspace-mode')?.value || 'home';

  const { data } = await supabaseAdmin
    .from('brain_dump')
    .select('*')
    .eq('user_id', auth.userId)
    .eq('workspace', workspace)
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
      <div className="md:hidden pt-4 px-6 sticky top-0 w-full bg-surface z-50">
        <MobileHeader />
      </div>

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
