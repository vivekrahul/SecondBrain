import { verifyAuth } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import SettingsClient from './SettingsClient';

export default async function SettingsPage() {
  const auth = await verifyAuth();
  if (!auth) return null;

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('email, telegram_chat_id, name')
    .eq('id', auth.userId)
    .single();

  return (
    <>
      {/* Top Bar */}
      <header className="bg-surface w-full top-0 px-6 py-4 sticky z-40">
        <div className="flex justify-between items-center w-full max-w-7xl mx-auto">
          <h1 className="text-xl font-extrabold text-on-surface tracking-tight md:hidden">Second Brain</h1>
        </div>
      </header>

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
          <h2 className="text-4xl font-extrabold tracking-tight mb-2">Second Brain</h2>
          <p className="text-on-surface-variant font-medium">Elevate your digital sanctuary</p>
        </section>

        <SettingsClient
          email={profile?.email || auth.email}
          name={profile?.name || ''}
          telegramChatId={profile?.telegram_chat_id || ''}
          userId={auth.userId}
        />
      </div>
    </>
  );
}
