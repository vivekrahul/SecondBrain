import { verifyAuth } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import SettingsClient from './SettingsClient';
import MobileHeader from '@/components/MobileHeader';

export default async function SettingsPage() {
  const auth = await verifyAuth();
  if (!auth) return null;

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('email, telegram_chat_id, name, hidden_tabs')
    .eq('id', auth.userId)
    .single();

  return (
    <>
      <div className="md:hidden pt-4 px-6 sticky top-0 w-full bg-surface z-50">
        <MobileHeader />
      </div>

      <div className="px-6 pt-8 max-w-xl mx-auto pb-40 animate-page-enter">
        {/* Hero Branding */}
        <section className="mb-12 text-center">
          <div className="inline-block p-1 bg-gradient-to-br from-primary to-primary-container rounded-full mb-6">
            <div className="bg-surface rounded-full p-6">
              <span className="material-symbols-outlined text-5xl bg-gradient-to-br from-primary to-primary-container bg-clip-text text-transparent" style={{ fontVariationSettings: "'FILL' 1" }}>
                psychology_alt
              </span>
            </div>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-2">Second Brain</h1>
          <p className="text-on-surface-variant font-medium">Elevate your digital sanctuary</p>
        </section>

        <SettingsClient
          email={profile?.email || auth.email}
          name={profile?.name || ''}
          telegramChatId={profile?.telegram_chat_id || ''}
          userId={auth.userId}
          hiddenTabs={profile?.hidden_tabs || []}
        />
      </div>
    </>
  );
}
