import { NextRequest, NextResponse } from "next/server";
import { auth } from "./lib/auth";

const protectedRoutes = ["/profile", "/bookings", "/adddestinations", "/admin"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtectedRoute = protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

  // Destination list (/destinations) stays public.
  // Destination details (/destinations/[id]) require login.
  const isProtectedDestinationRoute =
    /^\/destinations\/[^/]+(?:\/edit)?\/?$/.test(pathname);

  if (!isProtectedRoute && !isProtectedDestinationRoute) {
    return NextResponse.next();
  }

  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (session?.user) {
      return NextResponse.next();
    }
  } catch (error) {
    console.error("[Proxy] Session verification failed:", error);
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
