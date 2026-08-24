import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const host = request.headers.get('host') || '';

  // Extract hostname without port
  const hostname = host.split(':')[0].toLowerCase();

  // 1. Platform Admin Subdomain (e.g. admin.localhost or admin.educare.prohitcoretech.com)
  if (hostname.startsWith('admin.')) {
    if (url.pathname === '/') {
      return NextResponse.rewrite(new URL('/platform-admin', request.url));
    }
    if (!url.pathname.startsWith('/platform-admin')) {
      return NextResponse.rewrite(new URL(`/platform-admin${url.pathname}`, request.url));
    }
    return NextResponse.next();
  }

  // 2. Main Root / Landing Page (e.g. localhost, 127.0.0.1, educare.prohitcoretech.com, www.educare.prohitcoretech.com)
  if (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === 'educare.prohitcoretech.com' ||
    hostname === 'www.educare.prohitcoretech.com' ||
    hostname === 'prohiteducare.com' ||
    hostname === 'www.prohiteducare.com' ||
    hostname === ''
  ) {
    // If requesting platform-admin directly on root host, allow it
    if (url.pathname.startsWith('/platform-admin')) {
      return NextResponse.next();
    }
    // Next.js App Router automatically maps (marketing)/page.tsx to /
    return NextResponse.next();
  }

  // 3. Tenant / Academy Subdomain (e.g. viraj.localhost -> viraj, viraj.educare.prohitcoretech.com -> viraj)
  const parts = hostname.split('.');
  const slug = parts[0];

  if (slug && slug !== 'admin' && slug !== 'www') {
    if (url.pathname === '/') {
      return NextResponse.rewrite(new URL(`/${slug}/dashboard`, request.url));
    }
    if (!url.pathname.startsWith(`/${slug}`)) {
      return NextResponse.rewrite(new URL(`/${slug}${url.pathname}`, request.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
