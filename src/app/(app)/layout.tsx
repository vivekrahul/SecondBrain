import Sidebar from '@/components/Sidebar';
import BottomNav from '@/components/BottomNav';
import CaptureBar from '@/components/CaptureBar';
import { WorkspaceProvider } from '@/context/WorkspaceContext';
import { verifyAuth } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { redirect } from 'next/navigation';

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const auth = await verifyAuth();
  let displayName = '';
  let hiddenTabs: string[] = [];

  if (auth) {
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('name, email, has_seen_onboarding, hidden_tabs')
      .eq('id', auth.userId)
      .single();
      
    if (profile && !profile.has_seen_onboarding) {
      redirect('/onboarding');
    }

    displayName = profile?.name || profile?.email?.split('@')[0] || '';
    hiddenTabs = profile?.hidden_tabs || [];
  }

  return (
    <WorkspaceProvider>
      <div className="bg-surface text-on-surface min-h-screen flex flex-col md:flex-row overflow-hidden">
        {/* Desktop Sidebar */}
        <Sidebar displayName={displayName} hiddenTabs={hiddenTabs} />

        {/* Main Content */}
        <main className="flex-1 relative overflow-y-auto flex flex-col md:h-screen pb-40 md:pb-32">
          {children}
        </main>

        {/* Mobile Bottom Nav */}
        <BottomNav hiddenTabs={hiddenTabs} />

        {/* Capture Bar */}
        <CaptureBar />
      </div>
    </WorkspaceProvider>
  );
}
