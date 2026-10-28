import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

const protectedRoutes = ["/profile", "/bookings", "/adddestinations", "/admin"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtectedRoute = protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

  const isProtectedDestinationRoute =
    /^\/destinations\/[^/]+(?:\/edit)?\/?$/.test(pathname);

  if (!isProtectedRoute && !isProtectedDestinationRoute) {
    return NextResponse.next();
  }

  const sessionCookie = getSessionCookie(request);

  if (sessionCookie) {
    return NextResponse.next();
  }

  const signInUrl = new URL("/sign-in", request.url);

  signInUrl.searchParams.set(
    "callbackURL",
    `${pathname}${request.nextUrl.search}`,
  );

  return NextResponse.redirect(signInUrl);
}

export const config = {
  matcher: [
    "/profile/:path*",
    "/bookings/:path*",
    "/adddestinations/:path*",
    "/admin/:path*",
    "/destinations/:path*",
  ],
};
