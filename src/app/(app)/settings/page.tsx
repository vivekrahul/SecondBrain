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
      <header className="bg-surface/70 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex justify-between items-center w-full px-6 py-4">
          <span className="text-2xl font-black bg-gradient-to-br from-[#5f4ea5] to-[#b3a1ff] bg-clip-text text-transparent md:hidden">
            Second Brain
          </span>
        </div>
      </header>

      <div className="max-w-screen-md mx-auto px-6 mt-8 pb-40">
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
