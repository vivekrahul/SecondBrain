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

    // Insert into brain_dump
    const { error: insertError } = await supabaseAdmin
      .from('brain_dump')
      .insert({
        user_id: profile.id,
        raw_text: text,
        category: categorized.Category,
        status: 'Open',
        reminder_date: categorized.Reminder_Date,
        context_tags: categorized.Tags,
        clean_text: categorized.Clean_Text,
      });

    if (insertError) {
      console.error('Insert error:', insertError);
      await sendTelegramMessage(chatId, '❌ Failed to save. Please try again.');
      return NextResponse.json({ ok: true });
    }

    // Send confirmation
    const tags = categorized.Tags.length > 0 ? categorized.Tags.map(t => `#${t}`).join(' ') : '';
    const reminder = categorized.Reminder_Date ? `\n📅 Reminder: ${categorized.Reminder_Date}` : '';
    
    await sendTelegramMessage(
      chatId,
      `✅ <b>Captured!</b>\n\n📂 ${categorized.Category}\n💡 ${categorized.Clean_Text}${reminder}\n${tags}`
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Telegram webhook error:', error);
    return NextResponse.json({ ok: true }); // Always return 200 to Telegram
  }
}
