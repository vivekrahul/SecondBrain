import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { createToken, getAuthCookieOptions } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { email, pin } = await request.json();

    if (!email || !pin) {
      return NextResponse.json({ error: 'Email and PIN are required' }, { status: 400 });
    }

    // Look up user by email
    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('email', email.toLowerCase().trim())
      .single();

    if (error || !profile) {
      return NextResponse.json({ error: 'Invalid email or PIN' }, { status: 401 });
    }

    // Verify PIN
    if (profile.pin !== pin) {
      return NextResponse.json({ error: 'Invalid email or PIN' }, { status: 401 });
    }

    // Create JWT token
    const token = await createToken(profile.id, profile.email);

    // Set cookie and return success
    const response = NextResponse.json({ 
      success: true, 
      user: { id: profile.id, email: profile.email } 
    });
    
    response.cookies.set(getAuthCookieOptions(token));
    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
