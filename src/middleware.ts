import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { DASHBOARD_ROUTES } from "./constants/routes";

// Helper function to check onboarding status
// Returns `true` if onboarded, `false` if not, and `null` if the check fails.
async function getOnboardingStatus(
  request: NextRequest
): Promise<boolean | null> {
  try {
    const response = await fetch(
      new URL("/api/system/onboarding/check", request.url),
      {
        headers: { Cookie: request.headers.get("cookie") || "" },
      }
    );
    if (response.ok) {
      const data = await response.json();
      if (data.success) {
        return data.data.isOnboarded === true;
      }
    }
    // Return null if response not ok or success is false, so no redirect happens on API failure
    return null;
  } catch (error) {
    console.error("Middleware onboarding check failed:", error);
    return null; // Return null on fetch error
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  let token = request.cookies.get("token")?.value;

  // Check if we need to sync token from localStorage to cookies
  // This handles cases where localStorage has token but cookie doesn't (e.g., after page refresh)
  if (!token) {
    // Try to get token from request headers (if set by client-side)
    const authHeader = request.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7);
      // Set cookie for future requests
      const response = NextResponse.next();
      response.cookies.set("token", token, {
        path: "/",
        maxAge: 7 * 24 * 60 * 60, // 7 days
        httpOnly: false, // Allow client-side access
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      });
    }
  }

  // 1. Onboarding Check for specific routes
  // Only redirect from login/register if we can confirm the system is NOT onboarded.
  if (pathname.startsWith("/login") || pathname.startsWith("/register")) {
    const isOnboarded = await getOnboardingStatus(request);
    if (isOnboarded === false) {
      return NextResponse.redirect(new URL("/onboarding", request.url));
    }
  }

  // If system IS onboarded, but user tries to access onboarding, redirect them to login.
  // This check is safe because we know the user is not on /login or /register from the check above.
  if (pathname.startsWith("/onboarding")) {
    const isOnboarded = await getOnboardingStatus(request);
    if (isOnboarded === true) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // 2. Authentication Check
  const publicPaths = [
    "/",
    "/login",
    "/register",
    "/verify-email",
    "/about",
    "/onboarding",
  ];
  const isPublicPath = publicPaths.some((path) => pathname.startsWith(path));

  // If trying to access a protected route without a token, redirect to login
  if (!isPublicPath && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // If user is logged in and tries to access login/register, redirect to dashboard
  if (
    token &&
    (pathname.startsWith("/login") || pathname.startsWith("/register"))
  ) {
    return NextResponse.redirect(
      new URL(DASHBOARD_ROUTES.MULTI_SCHOOL_DASHBOARD, request.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
