import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { categorizeEntry } from '@/lib/groq';
import { verifyAuth } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { text, userId } = body;

    // If userId is provided (from webhook), use it directly.
    // Otherwise, verify from cookie.
    let authenticatedUserId = userId;

    if (!authenticatedUserId) {
      const auth = await verifyAuth();
      if (!auth) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      authenticatedUserId = auth.userId;
    }

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    // Categorize with Groq AI using Few-Shot Learning from user history
    const categorized = await categorizeEntry(text.trim(), authenticatedUserId);

    // Insert into brain_dump
    const { data, error } = await supabaseAdmin
      .from('brain_dump')
      .insert({
        user_id: authenticatedUserId,
        raw_text: text.trim(),
        category: categorized.Category,
        status: 'Open',
        reminder_date: categorized.Reminder_Date,
        context_tags: categorized.Tags,
        clean_text: categorized.Clean_Text,
      })
      .select()
      .single();

    if (error) {
      console.error('Insert error:', error);
      return NextResponse.json({ error: 'Failed to save entry' }, { status: 500 });
    }

    return NextResponse.json({ success: true, entry: data });
  } catch (error) {
    console.error('Process entry error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
