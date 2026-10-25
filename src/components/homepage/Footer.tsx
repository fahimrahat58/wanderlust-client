import React from "react";
import { Input } from "@/components/ui/input";
import { ArrowUpRight, X, Camera } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full overflow-hidden border-t border-neutral-900 bg-[#000000] px-4 pb-6 pt-12 text-white sm:px-6 sm:pb-8 sm:pt-16 lg:px-8">
      <div className="mx-auto w-full max-w-6xl">
        {/* Top Section: Brand & Description */}
        <div className="mb-10 sm:mb-12">
          <h1 className="mb-2 font-serif text-3xl font-normal tracking-tight text-white sm:text-4xl">
            Wanderlust
          </h1>
          <p className="max-w-md text-xs font-light leading-6 text-neutral-400 sm:text-sm">
            Your gateway to extraordinary travel experiences around the world.
          </p>
        </div>

        {/* Main Grid Links & Newsletter */}
        <div className="grid grid-cols-1 gap-x-6 gap-y-9 border-b border-neutral-800 pb-10 sm:grid-cols-2 sm:gap-y-10 sm:pb-12 lg:grid-cols-4 lg:gap-10 lg:pb-16">
          {/* Column 1: Newsletter */}
          <div className="min-w-0 space-y-4 lg:col-span-1">
            <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-300">
              NEWSLETTER
            </h3>
            <p className="max-w-xs text-xs leading-relaxed text-neutral-400">
              Subscribe for exclusive travel deals and inspiration.
            </p>

            {/* Input & Button Box */}
            <div className="relative flex w-full max-w-sm items-center">
              <Input
                type="email"
                placeholder="Enter email"
                className="h-11 rounded-none border-neutral-700 bg-[#222222] pr-12 text-xs text-white placeholder:text-neutral-500 focus-visible:border-neutral-500 focus-visible:ring-0"
              />
              <button
                type="button"
                aria-label="Subscribe to newsletter"
                className="absolute right-3 flex items-center justify-center text-neutral-400 transition-colors hover:text-white"
              >
                <ArrowUpRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="min-w-0 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-300">
              QUICK LINKS
            </h3>
            <ul className="space-y-3 text-xs text-neutral-400">
              <li>
                <a href="#home" className="transition-colors hover:text-white">
                  Home
                </a>
              </li>
              <li>
                <a
                  href="#destinations"
                  className="transition-colors hover:text-white"
                >
                  Destinations
                </a>
              </li>
              <li>
                <a
                  href="#bookings"
                  className="transition-colors hover:text-white"
                >
                  My Bookings
                </a>
              </li>
              <li>
                <a
                  href="#profile"
                  className="transition-colors hover:text-white"
                >
                  My Profile
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Support */}
          <div className="min-w-0 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-300">
              SUPPORT
            </h3>
            <ul className="space-y-3 text-xs text-neutral-400">
              <li>
                <a href="#help" className="transition-colors hover:text-white">
                  Help Center
                </a>
              </li>
              <li>
                <a
                  href="#terms"
                  className="transition-colors hover:text-white"
                >
                  Terms of Service
                </a>
              </li>
              <li>
                <a
                  href="#privacy"
                  className="transition-colors hover:text-white"
                >
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact Us */}
          <div className="min-w-0 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-300">
              CONTACT US
            </h3>
            <ul className="space-y-3 break-words text-xs text-neutral-400">
              <li>786 901 1622</li>
              <li>
                <a
                  href="mailto:info@wandarland.com"
                  className="transition-colors hover:text-white"
                >
                  info@wandarland.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Social Icons */}
        <div className="flex flex-col items-center justify-between gap-5 pt-6 text-center text-xs text-neutral-500 sm:flex-row sm:gap-4 sm:text-left">
          <p className="leading-5">
            © 2026 Wanderlust. All rights reserved.
          </p>

          {/* Social Media Icons */}
          <div className="flex items-center justify-center gap-5">
            <a
              href="#twitter"
              aria-label="Twitter"
              className="text-neutral-400 transition-colors hover:text-white"
            >
              <X className="h-4 w-4" />
            </a>
            <a
              href="#linkedin"
              aria-label="LinkedIn"
              className="text-neutral-400 transition-colors hover:text-white"
            >
              <span className="text-xs font-bold" aria-hidden="true">
                in
              </span>
            </a>
            <a
              href="#instagram"
              aria-label="Instagram"
              className="text-neutral-400 transition-colors hover:text-white"
            >
              <Camera className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}