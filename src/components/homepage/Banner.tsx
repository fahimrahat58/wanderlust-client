"use client";

import Link from "next/link";
import { useState } from "react";
import Image from "next/image";
import {
  ArrowRight,
  MapPin,
  Calendar,
  DollarSign,
  Users,
  Search,
} from "lucide-react";

export default function HeroBanner() {
  const [location, setLocation] = useState("");
  const [duration, setDuration] = useState("");
  const [budget, setBudget] = useState("");
  const [people, setPeople] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ location, duration, budget, people });
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col justify-between overflow-hidden text-white">
      {/* Background Image */}
      <div className="absolute inset-0 -z-10">
        <Image
          src="/Banner.png"
          alt="Banner Background"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />

        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/40" />
      </div>

      {/* Main Content */}
      <div className="z-10 mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center px-4 pb-10 pt-24 text-center sm:px-6 sm:pb-14 sm:pt-28 md:px-8 md:pb-16 md:pt-32 lg:pb-20">
        <h1 className="mb-4 text-3xl font-serif font-normal leading-tight tracking-wide text-white drop-shadow-md sm:mb-5 sm:text-4xl md:text-5xl lg:text-6xl">
          Discover Your <br className="hidden sm:inline" /> Next Adventure
        </h1>

        <p className="mb-7 max-w-2xl text-sm font-normal leading-relaxed text-gray-200 sm:mb-8 sm:text-base md:text-lg">
          Explore breathtaking destinations and create unforgettable memories
          with our curated travel experiences.
        </p>

        {/* CTA Buttons */}
        <div className="flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row sm:gap-4">
          <Link
            href="/destinations"
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-sm bg-sky-500 px-7 py-3 text-xs font-normal uppercase tracking-wider text-white shadow-lg transition-all duration-300 hover:bg-sky-600 sm:w-auto sm:text-sm"
          >
            <span>EXPLORE NOW</span>
            <ArrowRight className="h-4 w-4 shrink-0" />
          </Link>

          <Link href="/destinations">
            <button
              type="button"
              className="w-full cursor-pointer rounded-sm border border-white/30 bg-white/20 px-7 py-3 text-xs font-normal uppercase tracking-wider text-white backdrop-blur-md transition-all duration-300 hover:bg-white/30 sm:w-auto sm:text-sm"
            >
              VIEW DESTINATION
            </button>
          </Link>
        </div>
      </div>

      {/* Bottom Search Bar */}
      <div className="z-10 w-full border-t border-white/10 bg-black/40 backdrop-blur-md">
        <form
          onSubmit={handleSearch}
          className="mx-auto grid w-full max-w-7xl grid-cols-1 divide-y divide-white/20 sm:grid-cols-2 sm:divide-y-0 sm:divide-x lg:grid-cols-5"
        >
          {/* Location */}
          <div className="flex min-w-0 items-center gap-3 p-4 transition hover:bg-white/5 sm:p-4 lg:p-3 xl:p-4">
            <MapPin className="h-4 w-4 shrink-0 text-sky-400" />

            <div className="min-w-0 flex-1">
              <label className="block text-[11px] font-normal uppercase tracking-wider text-gray-200">
                Location
              </label>

              <input
                type="text"
                placeholder="Address, City Or Zip"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="mt-1 w-full min-w-0 bg-transparent text-xs font-normal text-white placeholder-gray-400 outline-none focus:outline-none sm:text-sm"
              />
            </div>
          </div>

          {/* Date/Duration */}
          <div className="flex min-w-0 items-center gap-3 p-4 transition hover:bg-white/5 sm:p-4 lg:p-3 xl:p-4">
            <Calendar className="h-4 w-4 shrink-0 text-sky-400" />

            <div className="min-w-0 flex-1">
              <label className="block text-[11px] font-normal uppercase tracking-wider text-gray-200">
                Date/Duration
              </label>

              <input
                type="text"
                placeholder="Anytime/3 Days"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="mt-1 w-full min-w-0 bg-transparent text-xs font-normal text-white placeholder-gray-400 outline-none focus:outline-none sm:text-sm"
              />
            </div>
          </div>

          {/* Budget */}
          <div className="flex min-w-0 items-center gap-3 p-4 transition hover:bg-white/5 sm:p-4 lg:p-3 xl:p-4">
            <DollarSign className="h-4 w-4 shrink-0 text-sky-400" />

            <div className="min-w-0 flex-1">
              <label className="block text-[11px] font-normal uppercase tracking-wider text-gray-200">
                Budget
              </label>

              <input
                type="text"
                placeholder="$0-$3000"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="mt-1 w-full min-w-0 bg-transparent text-xs font-normal text-white placeholder-gray-400 outline-none focus:outline-none sm:text-sm"
              />
            </div>
          </div>

          {/* People */}
          <div className="flex min-w-0 items-center gap-3 p-4 transition hover:bg-white/5 sm:p-4 lg:p-3 xl:p-4">
            <Users className="h-4 w-4 shrink-0 text-sky-400" />

            <div className="min-w-0 flex-1">
              <label className="block text-[11px] font-normal uppercase tracking-wider text-gray-200">
                People
              </label>

              <input
                type="text"
                placeholder="5-10"
                value={people}
                onChange={(e) => setPeople(e.target.value)}
                className="mt-1 w-full min-w-0 bg-transparent text-xs font-normal text-white placeholder-gray-400 outline-none focus:outline-none sm:text-sm"
              />
            </div>
          </div>

          {/* Search Button */}
          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 bg-sky-500 p-4 text-sm font-normal text-white transition-colors duration-300 hover:bg-sky-600"
          >
            <Search className="h-4 w-4 shrink-0" />
            <span>Search</span>
          </button>
        </form>
      </div>
    </div>
  );
}
