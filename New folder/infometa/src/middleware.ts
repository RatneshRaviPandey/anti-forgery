import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Security headers for all responses
  const response = NextResponse.next();
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Protect admin routes — redirect to login if no session
  if (pathname.startsWith('/admin')) {
    const token = req.cookies.get('infometa-session')?.value
      ?? req.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Protect portal routes — redirect to login if no session
  if (pathname.startsWith('/portal')) {
    const token = req.cookies.get('infometa-session')?.value
      ?? req.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // API rate limit headers
  if (pathname.startsWith('/api/')) {
    response.headers.set('X-RateLimit-Policy', 'sliding-window');
  }

  return response;
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/portal/:path*',
    '/api/:path*',
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
