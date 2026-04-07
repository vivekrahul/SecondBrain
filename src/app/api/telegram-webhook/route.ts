import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { categorizeEntry } from '@/lib/groq';
import { sendTelegramMessage, type TelegramUpdate } from '@/lib/telegram';

export async function POST(request: Request) {
  try {
    const update: TelegramUpdate = await request.json();

    // Only process text messages
    if (!update.message?.text) {
      return NextResponse.json({ ok: true });
    }

    const chatId = update.message.chat.id.toString();
    const text = update.message.text;

    // Handle /start command
    if (text === '/start') {
      await sendTelegramMessage(
        chatId,
        '🧠 <b>Second Brain Bot</b>\n\nSend me anything and I\'ll categorize and store it in your Second Brain.\n\nYour Chat ID: <code>' + chatId + '</code>\n\nAdd this to your Settings page to link your account.'
      );
      return NextResponse.json({ ok: true });
    }

    // Look up user by telegram_chat_id
    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('telegram_chat_id', chatId)
      .single();

    if (error || !profile) {
      await sendTelegramMessage(
        chatId,
        '❌ Your Telegram account is not linked.\n\nChat ID: <code>' + chatId + '</code>\n\nGo to Settings in the app and paste this Chat ID to link your account.'
      );
      return NextResponse.json({ ok: true });
    }

    // Categorize with Groq AI
    const categorized = await categorizeEntry(text);

    const recordsToInsert = categorized.entries.map((entry) => ({
      user_id: profile.id,
      raw_text: text,
      category: entry.Category,
      status: 'Open',
      reminder_date: entry.Reminder_Date,
      context_tags: entry.Tags,
      clean_text: entry.Clean_Text,
    }));

    // Insert into brain_dump
    const { error: insertError } = await supabaseAdmin
      .from('brain_dump')
      .insert(recordsToInsert);

    if (insertError) {
      console.error('Insert error:', insertError);
      await sendTelegramMessage(chatId, '❌ Failed to save. Please try again.');
      return NextResponse.json({ ok: true });
    }

    // Send confirmation
    let replyText = `✅ <b>Captured!</b>\n`;
    categorized.entries.forEach(entry => {
      const tags = entry.Tags.length > 0 ? entry.Tags.map(t => `#${t}`).join(' ') : '';
      const reminder = entry.Reminder_Date ? ` (📅 ${entry.Reminder_Date})` : '';
      replyText += `\n📂 <b>${entry.Category}</b>: ${entry.Clean_Text}${reminder} ${tags}`;
    });
    
    await sendTelegramMessage(chatId, replyText);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Telegram webhook error:', error);
    return NextResponse.json({ ok: true }); // Always return 200 to Telegram
  }
}
