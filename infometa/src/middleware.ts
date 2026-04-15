import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Security headers for all responses (OWASP recommended)
  const response = NextResponse.next();
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-DNS-Prefetch-Control', 'off');
  response.headers.set('X-Download-Options', 'noopen');
  response.headers.set('X-Permitted-Cross-Domain-Policies', 'none');
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');

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

  // Redirect browser requests from /api/verify/TOKEN to friendly /verify?code=TOKEN
  // API clients (Accept: application/json) still get the JSON response
  if (pathname.startsWith('/api/verify/') && pathname.length > '/api/verify/'.length) {
    const accept = req.headers.get('accept') || '';
    const isBrowser = accept.includes('text/html');
    if (isBrowser) {
      const token = pathname.slice('/api/verify/'.length);
      const verifyUrl = new URL(`/verify?code=${encodeURIComponent(decodeURIComponent(token))}`, req.url);
      return NextResponse.redirect(verifyUrl, 302);
    }
  }

  // API rate limit + security headers
  if (pathname.startsWith('/api/')) {
    response.headers.set('X-RateLimit-Policy', 'sliding-window');
    response.headers.set('Cache-Control', 'no-store');
    response.headers.set('Pragma', 'no-cache');
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
