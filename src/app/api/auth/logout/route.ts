import { NextResponse } from 'next/server';
import { getClearAuthCookieOptions } from '@/lib/auth';

export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.set(getClearAuthCookieOptions());
  return response;
}
