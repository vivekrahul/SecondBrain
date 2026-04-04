import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-secret-change-me'
);
const COOKIE_NAME = 'sb-auth-token';

const PUBLIC_PATHS = ['/login', '/api/auth/login', '/api/auth/register', '/api/telegram-webhook', '/api/cron/reminders'];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths
  if (PUBLIC_PATHS.some(p => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Allow static files and API routes that handle their own auth
  if (pathname.startsWith('/_next') || pathname.startsWith('/icons') || pathname === '/manifest.json' || pathname === '/favicon.ico') {
    return NextResponse.next();
  }

  // Check for auth token
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    await jwtVerify(token, JWT_SECRET);
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|icons|manifest.json).*)'],
};
