"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, Menu, X, LogOut, Loader2 } from "lucide-react";
import { signOut, useSession } from "@/lib/auth-client";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Destinations", href: "/destinations" },
  { name: "My Bookings", href: "/bookings" },
  { name: "Admin", href: "/admin" },
];

export default function Navbar() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const { data: session, isPending } = useSession();
  const user = session?.user;

  const handleSignOut = async () => {
    setIsSigningOut(true);

    try {
      await signOut();
      setIsOpen(false);
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Sign out failed:", error);
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white shadow-sm">
      <div className="mx-auto w-full max-w-screen-2xl px-4 sm:px-6 lg:px-8">
        <div className="relative flex h-14 items-center justify-between sm:h-16">
          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-3 text-xs font-semibold lg:flex xl:gap-5 xl:text-sm">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="whitespace-nowrap text-gray-700 transition-colors duration-200 hover:text-sky-500"
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Center Logo */}
          <div className="absolute left-1/2 -translate-x-1/2">
            <Link
              href="/"
              onClick={() => setIsOpen(false)}
              className="whitespace-nowrap font-serif text-lg font-bold tracking-tight text-sky-500 sm:text-2xl"
            >
              Wanderlast
            </Link>
          </div>

          {/* Desktop User Actions */}
          <div className="hidden items-center gap-3 text-xs font-semibold text-gray-700 lg:flex xl:gap-4 xl:text-sm">
            {!isPending &&
              (user ? (
                <>
                  <span className="max-w-40 truncate text-slate-600">
                    Hello, {user.name || user.email}
                  </span>

                  <Link
                    href="/profile"
                    className="flex items-center gap-1.5 whitespace-nowrap transition-colors hover:text-sky-500"
                  >
                    <User className="h-4 w-4 shrink-0" />
                    Profile
                  </Link>

                  <button
                    type="button"
                    onClick={handleSignOut}
                    disabled={isSigningOut}
                    className="flex items-center cursor-pointer gap-1.5 whitespace-nowrap rounded-md bg-red-600 px-3 py-2 text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSigningOut ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <LogOut className="h-4 w-4" />
                    )}
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/sign-in"
                    className="whitespace-nowrap transition-colors hover:text-sky-500"
                  >
                    Login
                  </Link>

                  <Link
                    href="/sign-up"
                    className="whitespace-nowrap transition-colors hover:text-sky-500"
                  >
                    Sign Up
                  </Link>
                </>
              ))}
          </div>

          {/* Mobile & Tablet Menu Toggle */}
          <div className="ml-auto flex lg:hidden">
            <button
              type="button"
              onClick={() => setIsOpen((prev) => !prev)}
              className="rounded-md p-2 text-gray-700 transition hover:bg-gray-100 hover:text-sky-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
              aria-label={isOpen ? "Close Menu" : "Open Menu"}
              aria-expanded={isOpen}
              aria-controls="mobile-navigation"
            >
              {isOpen ? (
                <X className="h-5 w-5 sm:h-6 sm:w-6" />
              ) : (
                <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile & Tablet Menu */}
      {isOpen && (
        <div
          id="mobile-navigation"
          className="border-t border-gray-200 bg-white px-4 pb-5 pt-3 shadow-lg sm:px-6 lg:hidden"
        >
          <div className="mx-auto flex w-full max-w-screen-sm flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="rounded-md px-3 py-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 hover:text-sky-500 sm:text-base"
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="mx-auto mt-3 flex w-full max-w-screen-sm flex-col gap-1 border-t border-gray-100 pt-3">
            {isPending ? (
              <div className="flex items-center justify-center py-3">
                <Loader2 className="h-5 w-5 animate-spin text-sky-500" />
              </div>
            ) : user ? (
              <>
                <div className="flex items-center gap-2 px-3 py-3 text-sm font-medium text-slate-600">
                  <User className="h-4 w-4 shrink-0 text-sky-500" />
                  <span className="break-all">
                    Hello, {user.name || user.email}
                  </span>
                </div>

                <Link
                  href="/profile"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2 rounded-md px-3 py-3 text-sm text-gray-700 transition-colors hover:bg-gray-50 hover:text-sky-500 sm:text-base"
                >
                  <User className="h-4 w-4 shrink-0" />
                  Profile
                </Link>

                <button
                  type="button"
                  onClick={handleSignOut}
                  disabled={isSigningOut}
                  className="flex w-full items-center gap-2 rounded-md bg-red-600 px-3 py-3 text-left text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60 sm:text-base"
                >
                  {isSigningOut ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <LogOut className="h-4 w-4" />
                  )}
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/sign-in"
                  onClick={() => setIsOpen(false)}
                  className="rounded-md px-3 py-3 text-sm text-gray-700 transition-colors hover:bg-gray-50 hover:text-sky-500 sm:text-base"
                >
                  Login
                </Link>

                <Link
                  href="/sign-up"
                  onClick={() => setIsOpen(false)}
                  className="rounded-md px-3 py-3 text-sm text-gray-700 transition-colors hover:bg-gray-50 hover:text-sky-500 sm:text-base"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
