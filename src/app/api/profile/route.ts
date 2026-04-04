import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { verifyAuth } from '@/lib/auth';

export async function PATCH(request: Request) {
  try {
    const auth = await verifyAuth();
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { telegram_chat_id, name } = body;

    // Build update object with only provided fields
    const updates: Record<string, string | null> = {};
    if (typeof telegram_chat_id !== 'undefined') updates.telegram_chat_id = telegram_chat_id || null;
    if (typeof name !== 'undefined') updates.name = name || null;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('profiles')
      .update(updates)
      .eq('id', auth.userId);

    if (error) {
      console.error('Profile update error:', error);
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Profile PATCH error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
