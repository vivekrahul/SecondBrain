import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { createToken, getAuthCookieOptions } from '@/lib/auth';

const MAX_USERS = 20;

export async function POST(request: Request) {
  try {
    const { email, pin } = await request.json();

    if (!email || !pin) {
      return NextResponse.json({ error: 'Email and PIN are required' }, { status: 400 });
    }

    // Validate PIN format (6 digits)
    if (!/^\d{6}$/.test(pin)) {
      return NextResponse.json({ error: 'PIN must be exactly 6 digits' }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    // Check user limit
    const { count, error: countError } = await supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('Count error:', countError);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }

    if ((count ?? 0) >= MAX_USERS) {
      return NextResponse.json({ error: 'Maximum number of users reached. Registration is closed.' }, { status: 403 });
    }

    // Check if email already exists
    const { data: existing } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('email', email.toLowerCase().trim())
      .single();

    if (existing) {
      return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 });
    }

    // Create the user
    const { data: profile, error: insertError } = await supabaseAdmin
      .from('profiles')
      .insert({
        email: email.toLowerCase().trim(),
        pin: pin,
      })
      .select()
      .single();

    if (insertError || !profile) {
      console.error('Insert error:', insertError);
      return NextResponse.json({ error: 'Failed to create account' }, { status: 500 });
    }

    // Create JWT token and auto-login
    const token = await createToken(profile.id, profile.email);

    const response = NextResponse.json({
      success: true,
      user: { id: profile.id, email: profile.email },
    });

    response.cookies.set(getAuthCookieOptions(token));
    return response;
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
