import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { verifyAuth } from '@/lib/auth';
import { cookies } from 'next/headers';

// GET: Fetch entries for authenticated user
export async function GET(request: Request) {
  try {
    const auth = await verifyAuth();
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');

    const cookieStore = await cookies();
    const workspace = cookieStore.get('sb-workspace-mode')?.value || 'home';

    let query = supabaseAdmin
      .from('brain_dump')
      .select('*')
      .eq('user_id', auth.userId)
      .eq('workspace', workspace)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (category) {
      query = query.eq('category', category);
    }
    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Fetch error:', error);
      return NextResponse.json({ error: 'Failed to fetch entries' }, { status: 500 });
    }

    return NextResponse.json({ entries: data });
  } catch (error) {
    console.error('Entries GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH: Update an entry (status, etc.)
export async function PATCH(request: Request) {
  try {
    const auth = await verifyAuth();
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, status, category, clean_text, context_tags, priority, reminder_date, is_human_corrected, workspace } = await request.json();
    if (!id) {
      return NextResponse.json({ error: 'Entry ID is required' }, { status: 400 });
    }

    const updates: Record<string, any> = {};
    if (status) {
      updates.status = status;
      if (status === 'Done') {
        updates.completed_at = new Date().toISOString();
      } else if (status === 'Open' || status === 'Archived') {
        updates.completed_at = null;
      }
    }
    if (priority) updates.priority = priority;
    if (reminder_date !== undefined) updates.reminder_date = reminder_date;
    if (workspace) updates.workspace = workspace;
    
    // If the user manually edits classification fields, mark it as human corrected 
    // so the AI can learn from it in few-shot prompting
    let isCorrection = typeof is_human_corrected === 'boolean' ? is_human_corrected : false;
    if (category) { updates.category = category; isCorrection = true; }
    if (clean_text) { updates.clean_text = clean_text; isCorrection = true; }
    if (context_tags) { updates.context_tags = context_tags; isCorrection = true; }
    
    if (isCorrection) {
      updates.is_human_corrected = true;
    }

    const { data, error } = await supabaseAdmin
      .from('brain_dump')
      .update(updates)
      .eq('id', id)
      .eq('user_id', auth.userId)
      .select()
      .single();

    if (error) {
      console.error('Update error:', error);
      return NextResponse.json({ error: 'Failed to update entry' }, { status: 500 });
    }

    return NextResponse.json({ success: true, entry: data });
  } catch (error) {
    console.error('Entries PATCH error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE: Delete an entry
export async function DELETE(request: Request) {
  try {
    const auth = await verifyAuth();
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Entry ID is required' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('brain_dump')
      .delete()
      .eq('id', id)
      .eq('user_id', auth.userId);

    if (error) {
      console.error('Delete error:', error);
      return NextResponse.json({ error: 'Failed to delete entry' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Entries DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
