import { NextRequest, NextResponse } from "next/server";
import { auth } from "./lib/auth";

const protectedRoutes = ["/profile", "/bookings", "/adddestinations"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtectedRoute = protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

  const isProtectedDestinationRoute =
    /^\/destinations\/[^/]+(?:\/edit)?\/?$/.test(pathname);

  if (!isProtectedRoute && !isProtectedDestinationRoute) {
    return NextResponse.next();
  }

  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session?.user) {
    const signInUrl = new URL("/sign-in", request.url);
    signInUrl.searchParams.set("callbackURL", pathname);

    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/profile/:path*",
    "/bookings/:path*",

    "/adddestinations",
    "/destinations/:path*",
  ],
};
