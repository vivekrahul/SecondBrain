import Sidebar from '@/components/Sidebar';
import BottomNav from '@/components/BottomNav';
import CaptureBar from '@/components/CaptureBar';
import { verifyAuth } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const auth = await verifyAuth();
  let displayName = '';

  if (auth) {
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('name, email')
      .eq('id', auth.userId)
      .single();
    displayName = profile?.name || profile?.email?.split('@')[0] || '';
  }

  return (
    <div className="bg-surface text-on-surface min-h-screen flex flex-col md:flex-row overflow-hidden">
      {/* Desktop Sidebar */}
      <Sidebar displayName={displayName} />

      {/* Main Content */}
      <main className="flex-1 relative overflow-y-auto flex flex-col md:h-screen pb-40 md:pb-32">
        {children}
      </main>

      {/* Mobile Bottom Nav */}
      <BottomNav />

      {/* Capture Bar */}
      <CaptureBar />
    </div>
  );
}
