import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

async function isSystemOnboarded(request: NextRequest): Promise<boolean> {
  try {
    const response = await fetch(new URL('/api/system/onboarding/status', request.url), {
      headers: {
        'Cookie': request.headers.get('cookie') || '',
      },
    });
    if (response.ok) {
      const data = await response.json();
      return data.isOnboarded === true;
    }
    return false;
  } catch (error) {
    console.error('Middleware onboarding check failed:', error);
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('token')?.value;

  // Onboarding Check
  const onboarded = await isSystemOnboarded(request);

  if (!onboarded) {
    if (!pathname.startsWith('/onboarding')) {
      return NextResponse.redirect(new URL('/onboarding', request.url));
    }
    return NextResponse.next();
  }

  if (onboarded && pathname.startsWith('/onboarding')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Authentication Check
  const publicPaths = ['/', '/login', '/register', '/verify-email', '/about'];
  // A more precise check for public paths
  const isPublicPath = publicPaths.includes(pathname) || pathname.startsWith('/about');


  if (token) {
    if (pathname.startsWith('/login') || pathname.startsWith('/register')) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  if (!token) {
    if (isPublicPath) {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};