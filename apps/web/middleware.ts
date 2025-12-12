import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

// Routes that don't require authentication
// Note: /api/profile is included because mobile apps use Authorization header, not cookies.
// The profile route handles its own auth check internally.
const publicRoutes = ['/welcome', '/login', '/signup', '/api/auth', '/api/profile'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Allow static files and API routes for auth
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/unity-build') ||
    pathname.includes('.') // Static files
  ) {
    return NextResponse.next();
  }

  // Check authentication using cookies
  const sessionCookie = request.cookies.get('better-auth.session_token');
  
  if (!sessionCookie) {
    // Not authenticated - redirect to welcome
    return NextResponse.redirect(new URL('/welcome', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
