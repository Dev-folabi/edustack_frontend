import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip middleware for static files and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/static') ||
    pathname.includes('.') ||
    pathname === '/onboarding'
  ) {
    return NextResponse.next();
  }
  
  try {
    // Check if system is onboarded
    const baseUrl = request.nextUrl.origin;
    const response = await fetch(`${baseUrl}/api/system/onboarding/status`, {
      headers: {
        'Cookie': request.headers.get('cookie') || '',
      },
    });
    
    if (response.ok) {
      const data = await response.json();
      
      // If system is not onboarded and user is not on onboarding page
      if (!data.isOnboarded && pathname !== '/onboarding') {
        return NextResponse.redirect(new URL('/onboarding', request.url));
      }
      
      // If system is onboarded and user is on onboarding page
      if (data.isOnboarded && pathname === '/onboarding') {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url));
      }
    }
  } catch (error) {
    console.error('Middleware error:', error);
    // On error, allow the request to continue
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};