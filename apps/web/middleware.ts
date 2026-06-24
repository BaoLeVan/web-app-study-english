import { NextResponse, type NextRequest } from 'next/server';

const PUBLIC_PATHS = ['/login', '/register', '/forgot-password'];
const AUTH_COOKIE = 'lf_access';

/**
 * Lightweight session gate. We don't verify the JWT signature here (no shared
 * secret in the edge runtime); the API is still the source of truth. This
 * middleware only handles the "logged out user visits a private page" redirect
 * and the inverse "logged in user visits /login" redirect.
 */
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get(AUTH_COOKIE)?.value;
  const isPublic = PUBLIC_PATHS.some((p) => pathname === p);

  if (!token && !isPublic) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }
  if (token && isPublic) {
    const url = req.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|sw.js).*)'],
};
