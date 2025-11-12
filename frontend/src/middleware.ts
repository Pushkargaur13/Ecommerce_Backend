// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PROTECTED_PATHS = ['/dashboard', '/admin']; // add other protected routes
const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:3000/api';
const COOKIE_NAME = process.env.COOKIE_REFRESH_NAME ?? 'refreshToken';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // allow next internals and API calls through
  if (pathname.startsWith('/_next') || pathname.startsWith('/api') || pathname.startsWith('/static')) {
    return NextResponse.next();
  }

  // only protect listed paths
  const needsAuth = PROTECTED_PATHS.some(p => pathname.startsWith(p));
  if (!needsAuth) return NextResponse.next();

  // check cookie (cookie name must match backend cookie)
  const cookie = req.cookies.get(COOKIE_NAME);
  const cookieValue = typeof cookie === 'string' ? cookie : cookie?.value;

  // Detect if this request is a browser navigation (want HTML)
  const accept = req.headers.get('accept') || '';
  const isNavigationRequest = accept.includes('text/html');

  if (!cookieValue) {
    if (isNavigationRequest) {
      const loginUrl = new URL('/', req.url);
      return NextResponse.redirect(loginUrl);
    } else {
      return NextResponse.next();
    }
  }

  // Validate the refresh token with backend and ensure user is ADMIN
  try {
    const verifyUrl = `${API_BASE}/auth/refresh`; // adjust if you have a dedicated verify endpoint
    const verifyRes = await fetch(verifyUrl, {
      method: 'POST',
      headers: {
        // forward only the refresh cookie to backend
        cookie: `${COOKIE_NAME}=${cookieValue}`,
        'content-type': 'application/json',
      },
      // avoid caching this call
      cache: 'no-store',
    });

    if (!verifyRes.ok) {
      throw new Error('invalid refresh response');
    }

    const data = await verifyRes.json();

    // backend response shapes vary; try common paths
    const maybeUser = data?.user ?? data;
    const user =
      maybeUser?.user ?? // nested { user: { ... } }
      maybeUser ??         // { id, role, ... }
      null;

    const role = user?.role ?? null;

    if (role === 'ADMIN') {
      return NextResponse.next();
    } else {
      if (isNavigationRequest) {
        const loginUrl = new URL('/', req.url);
        return NextResponse.redirect(loginUrl);
      }
      return NextResponse.next();
    }
  } catch (err) {
    // on error, redirect navigations to login so user can re-authenticate
    if (isNavigationRequest) {
      const loginUrl = new URL('/', req.url);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*'],
};
