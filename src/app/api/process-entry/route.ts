import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { categorizeEntry } from '@/lib/groq';
import { verifyAuth } from '@/lib/auth';
import { contentHash } from '@/lib/hash';

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

    // Build records, checking for duplicates via content hash
    const recordsToInsert = [];
    const duplicateEntries = [];

    for (const entry of categorized.entries) {
      const hash = await contentHash(entry.Clean_Text);

      // Check for duplicate in last 30 open entries for this user
      const { data: existing } = await supabaseAdmin
        .from('brain_dump')
        .select('id, clean_text, category, status')
        .eq('user_id', authenticatedUserId)
        .eq('content_hash', hash)
        .eq('status', 'Open')
        .limit(1);

      if (existing && existing.length > 0) {
        // Already exists — skip insert, add to duplicates list
        duplicateEntries.push({ ...existing[0], isDuplicate: true });
        continue;
      }

      recordsToInsert.push({
        user_id: authenticatedUserId,
        raw_text: text.trim(),
        category: entry.Category,
        status: 'Open',
        reminder_date: entry.Reminder_Date,
        context_tags: entry.Tags,
        clean_text: entry.Clean_Text,
        priority: entry.Priority,
        content_hash: hash,
      });
    }

    if (recordsToInsert.length === 0) {
      // All entries were duplicates
      return NextResponse.json({ 
        success: true, 
        entries: duplicateEntries,
        allDuplicates: true,
      });
    }

    // Insert into brain_dump
    const { data, error } = await supabaseAdmin
      .from('brain_dump')
      .insert(recordsToInsert)
      .select();

    if (error) {
      console.error('Insert error:', error);
      return NextResponse.json({ error: 'Failed to save entries' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      entries: [...(data || []), ...duplicateEntries],
      duplicateCount: duplicateEntries.length,
    });
  } catch (error) {
    console.error('Process entry error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
