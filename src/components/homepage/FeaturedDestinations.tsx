"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  MapPin,
  Calendar,
  Star,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Compass,
} from "lucide-react";

import { Button } from "@/components/ui/button";

type Destination = {
  _id: string;
  destinationName: string;
  country: string;
  category?: string;
  price: number;
  duration?: string;
  departureDate?: string;
  imageUrl?: string;
  description?: string;
  rating?: number;
};

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://wanderlust-server-sand.vercel.app";

const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1537996194471-e657df975ab4";

export default function FeaturedDestinations() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const itemsPerPage = 2;

  useEffect(() => {
    const fetchDestinations = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(API_URL, {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch destinations (${response.status})`);
        }

        const data: unknown = await response.json();

        if (!Array.isArray(data)) {
          throw new Error("Invalid API response");
        }

        setDestinations(data as Destination[]);
      } catch (err) {
        console.error("Failed to load destinations:", err);

        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong while loading destinations.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDestinations();
  }, []);

  const totalPages = Math.ceil(destinations.length / itemsPerPage);
  const currentPage =
    totalPages > 0 ? Math.floor(currentIndex / itemsPerPage) + 1 : 0;

  const visibleDestinations = destinations.slice(
    currentIndex,
    currentIndex + itemsPerPage,
  );

  const progressPercentage =
    totalPages > 0 ? (currentPage / totalPages) * 100 : 0;

  const handlePrev = () => {
    setCurrentIndex((prev) => Math.max(prev - itemsPerPage, 0));
  };

  const handleNext = () => {
    setCurrentIndex((prev) =>
      Math.min(prev + itemsPerPage, (totalPages - 1) * itemsPerPage),
    );
  };

  return (
    <section className="mx-auto w-full max-w-7xl overflow-hidden bg-white px-4 py-12 text-slate-800 sm:px-6 sm:py-16 md:px-8 md:py-20 lg:px-12 lg:py-24">
      {/* Header */}
      <div className="mb-8 flex flex-col justify-between gap-5 sm:mb-10 md:mb-12 md:flex-row md:items-end">
        <div className="min-w-0">
          <div className="mb-4 flex items-center gap-3">
            <span className="h-px w-8 shrink-0 bg-[#40C4AA] sm:w-10" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#40C4AA] sm:text-xs sm:tracking-[0.25em]">
              Discover the world
            </span>
          </div>

          <h2 className="break-words font-serif text-3xl font-normal tracking-tight text-slate-900 sm:text-4xl md:text-5xl lg:text-6xl">
            Featured Destinations
          </h2>

          <p className="mt-3 max-w-xl text-sm leading-6 text-slate-500 sm:mt-4 sm:text-base sm:leading-7">
            Handpicked places, unforgettable journeys, and extraordinary
            experiences waiting for you.
          </p>
        </div>

        <Link
          href="/destinations"
          className="inline-flex w-fit max-w-full shrink-0 items-center gap-2 border border-[#40C4AA] px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#239b85] transition-all duration-300 hover:bg-[#40C4AA] hover:text-white sm:gap-3 sm:px-5 sm:text-xs sm:tracking-[0.16em]"
        >
          Explore all
          <ArrowUpRight className="h-4 w-4 shrink-0" />
        </Link>
      </div>

      {/* Destinations */}
      {loading ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-7 lg:gap-10">
          {[1, 2].map((item) => (
            <div key={item} className="min-w-0 animate-pulse">
              <div className="h-64 rounded-2xl bg-slate-100 sm:h-80 lg:h-[370px]" />
              <div className="mt-5 h-4 w-1/3 rounded bg-slate-100" />
              <div className="mt-3 h-7 w-2/3 rounded bg-slate-100" />
              <div className="mt-4 h-4 w-1/2 rounded bg-slate-100" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-red-100 bg-red-50/50 px-4 py-8 text-center sm:min-h-72 sm:px-5">
          <p className="break-words text-sm text-red-600">{error}</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </div>
      ) : destinations.length === 0 ? (
        <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 px-4 py-8 text-center sm:min-h-72">
          <Compass className="mb-4 h-10 w-10 text-slate-300" />
          <h3 className="text-lg font-semibold text-slate-800">
            No destinations yet
          </h3>
          <p className="mt-2 text-sm text-slate-500">
            New adventures will appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-7 lg:gap-10">
          {visibleDestinations.map((item) => (
            <Link
              key={item._id}
              href={`/destinations/${item._id}`}
              className="group block min-w-0 rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-[#40C4AA] focus-visible:ring-offset-4"
              aria-label={`View details for ${item.destinationName}`}
            >
              <article className="h-full overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-[0_5px_25px_rgba(15,23,42,0.04)] transition-all duration-500 group-hover:-translate-y-1.5 group-hover:border-[#40C4AA]/30 group-hover:shadow-[0_20px_50px_rgba(15,23,42,0.12)]">
                {/* Image */}
                <div className="relative h-64 overflow-hidden bg-slate-100 xs:h-72 sm:h-80 lg:h-[370px]">
                  <img
                    src={item.imageUrl || DEFAULT_IMAGE}
                    alt={item.destinationName || "Travel destination"}
                    className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    loading="lazy"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-950/10 to-slate-950/10 opacity-90 transition-opacity duration-500 group-hover:opacity-100" />

                  {/* Category */}
                  {item.category && (
                    <span className="absolute left-3 top-3 max-w-[65%] truncate rounded-full border border-white/30 bg-white/15 px-3 py-2 text-[9px] font-semibold uppercase tracking-[0.12em] text-white shadow-sm backdrop-blur-md sm:left-6 sm:top-6 sm:px-4 sm:text-[10px] sm:tracking-[0.16em]">
                      {item.category}
                    </span>
                  )}

                  {/* Rating */}
                  <div className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full bg-white px-2.5 py-2 text-xs font-semibold text-slate-900 shadow-lg sm:right-6 sm:top-6 sm:px-3">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    {item.rating ?? 4.5}
                  </div>

                  {/* Image bottom information */}
                  <div className="absolute inset-x-4 bottom-4 min-w-0 text-white sm:inset-x-6 sm:bottom-6">
                    <div className="mb-2 flex items-center gap-2 text-xs font-medium text-white/85 sm:text-sm">
                      <MapPin className="h-4 w-4 shrink-0 text-[#67e8cf]" />
                      <span className="truncate">
                        {item.country || "Explore destination"}
                      </span>
                    </div>

                    <h3 className="line-clamp-2 break-words font-serif text-2xl font-normal leading-tight tracking-tight sm:text-3xl md:text-4xl lg:text-[2.65rem]">
                      {item.destinationName}
                    </h3>
                  </div>

                  {/* Floating arrow */}
                  <div className="absolute bottom-5 right-4 hidden h-11 w-11 translate-y-2 items-center justify-center rounded-full bg-[#40C4AA] text-white opacity-0 shadow-lg transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 sm:right-6 sm:flex">
                    <ArrowUpRight className="h-5 w-5" />
                  </div>
                </div>

                {/* Details */}
                <div className="p-4 sm:p-5 md:p-6">
                  <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div className="min-w-0">
                      <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400 sm:tracking-[0.2em]">
                        Starting from
                      </p>

                      <div className="flex flex-wrap items-baseline gap-1.5">
                        <span className="break-words text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
                          ${Number(item.price || 0).toLocaleString("en-US")}
                        </span>
                        <span className="text-xs text-slate-400">/ person</span>
                      </div>
                    </div>

                    <div className="flex w-fit max-w-full items-center gap-2 rounded-xl bg-slate-50 px-3 py-2.5 text-slate-500 sm:self-auto">
                      <Calendar className="h-4 w-4 shrink-0 text-[#40C4AA]" />
                      <span className="break-words text-xs font-medium">
                        {item.duration || "Flexible duration"}
                      </span>
                    </div>
                  </div>

                  {item.description && (
                    <p className="mt-4 line-clamp-2 break-words text-sm leading-6 text-slate-500">
                      {item.description}
                    </p>
                  )}

                  <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#269f89] transition-colors group-hover:text-[#167b69] sm:text-[11px] sm:tracking-[0.18em]">
                      Explore destination
                    </span>

                    <span className="flex shrink-0 items-center gap-1.5 text-xs font-medium text-slate-400 transition-colors group-hover:text-[#269f89] sm:gap-2">
                      View details
                      <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && !error && destinations.length > 0 && (
        <div className="mt-10 flex items-center gap-3 border-t border-slate-100 pt-5 sm:mt-16 sm:gap-6 sm:pt-6">
          <span className="shrink-0 text-xs font-semibold tabular-nums text-slate-700 sm:text-sm">
            {String(currentPage).padStart(2, "0")}
            <span className="mx-1 text-slate-300">/</span>
            {String(totalPages).padStart(2, "0")}
          </span>

          <div
            className="relative h-1 min-w-0 flex-1 overflow-hidden rounded-full bg-slate-100"
            aria-label={`Page ${currentPage} of ${totalPages}`}
          >
            <div
              className="absolute left-0 top-0 h-full rounded-full bg-[#40C4AA] transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={handlePrev}
              disabled={currentPage <= 1}
              aria-label="Previous destinations"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition-all hover:border-[#40C4AA] hover:bg-[#40C4AA] hover:text-white disabled:cursor-not-allowed disabled:opacity-30 sm:h-12 sm:w-12"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <button
              type="button"
              onClick={handleNext}
              disabled={currentPage >= totalPages}
              aria-label="Next destinations"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition-all hover:border-[#40C4AA] hover:bg-[#40C4AA] hover:text-white disabled:cursor-not-allowed disabled:opacity-30 sm:h-12 sm:w-12"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
