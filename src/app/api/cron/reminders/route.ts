import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { sendTelegramMessage } from '@/lib/telegram';

export async function GET(request: Request) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const today = new Date().toISOString().split('T')[0];

    // Query entries with reminder_date = today and status = 'Open'
    const { data: reminders, error } = await supabaseAdmin
      .from('brain_dump')
      .select('*, profiles!inner(telegram_chat_id)')
      .eq('reminder_date', today)
      .eq('status', 'Open');

    if (error) {
      console.error('Reminder query error:', error);
      return NextResponse.json({ error: 'Query failed' }, { status: 500 });
    }

    let sent = 0;
    let skipped = 0;

    for (const reminder of reminders || []) {
      const chatId = (reminder.profiles as { telegram_chat_id: string | null })?.telegram_chat_id;
      if (!chatId) {
        skipped++;
        continue;
      }

      const message = `🔔 <b>Reminder</b>\n\n${reminder.clean_text || reminder.raw_text}\n\n📂 ${reminder.category}`;
      const success = await sendTelegramMessage(chatId, message);
      
      if (success) sent++;
      else skipped++;
    }

    return NextResponse.json({
      success: true,
      date: today,
      total: reminders?.length || 0,
      sent,
      skipped,
    });
  } catch (error) {
    console.error('Cron reminders error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
