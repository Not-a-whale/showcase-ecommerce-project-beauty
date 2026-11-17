import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const REFRESH_COOKIE = 'refreshToken';
const PRIVATE_PREFIXES = ['/profile'];
const AUTH_ONLY_PATHS = ['/login', '/register'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = request.cookies.has(REFRESH_COOKIE);

  const isPrivate = PRIVATE_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix),
  );
  if (isPrivate && !hasSession) {
    const url = new URL('/login', request.url);
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  const isAuthOnly = AUTH_ONLY_PATHS.some((path) => pathname.startsWith(path));
  if (isAuthOnly && hasSession) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/profile/:path*', '/login', '/register'],
};
