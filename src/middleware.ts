import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Helper function to check onboarding status
// Returns `true` if onboarded, `false` if not, and `null` if the check fails.
async function getOnboardingStatus(request: NextRequest): Promise<boolean | null> {
  try {
    const response = await fetch(new URL('/api/system/onboarding/check', request.url), {
      headers: { 'Cookie': request.headers.get('cookie') || '' },
    });
    if (response.ok) {
      const data = await response.json();
      if (data.success) {
        return data.data.isOnboarded === true;
      }
    }
    // Return null if response not ok or success is false, so no redirect happens on API failure
    return null;
  } catch (error) {
    console.error('Middleware onboarding check failed:', error);
    return null; // Return null on fetch error
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('token')?.value;

  // 1. Onboarding Check for specific routes
  // Only redirect from login/register if we can confirm the system is NOT onboarded.
  if (pathname.startsWith('/login') || pathname.startsWith('/register')) {
    const isOnboarded = await getOnboardingStatus(request);
    if (isOnboarded === false) {
      return NextResponse.redirect(new URL('/onboarding', request.url));
    }
  }

  // If system IS onboarded, but user tries to access onboarding, redirect them to login.
  // This check is safe because we know the user is not on /login or /register from the check above.
   if (pathname.startsWith('/onboarding')) {
     const isOnboarded = await getOnboardingStatus(request);
     if (isOnboarded === true) {
        return NextResponse.redirect(new URL('/login', request.url));
     }
   }

  // 2. Authentication Check
  const publicPaths = ['/', '/login', '/register', '/verify-email', '/about', '/onboarding'];
  const isPublicPath = publicPaths.some(path => pathname.startsWith(path));

  // If trying to access a protected route without a token, redirect to login
  if (!isPublicPath && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If user is logged in and tries to access login/register, redirect to dashboard
  if (token && (pathname.startsWith('/login') || pathname.startsWith('/register'))) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};