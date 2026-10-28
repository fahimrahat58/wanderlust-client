"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import {
  MapPin,
  Calendar,
  Star,
  ArrowUpRight,
  Loader2,
  SlidersHorizontal,
} from "lucide-react";

type Destination = {
  _id: string;
  category?: string;
  price: number;
  rating?: number;
  imageUrl?: string;
  destinationName: string;
  country: string;
  duration?: string;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function AllDestinations() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [category, setCategory] = useState("all");
  const [priceRange, setPriceRange] = useState("all");
  const [sortBy, setSortBy] = useState("default");

  useEffect(() => {
    const controller = new AbortController();

    const fetchDestinations = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`${API_URL}/destinations`, {
          method: "GET",
          credentials: "include",
          cache: "no-store",
          signal: controller.signal,
        });

        const responseData = await response.json().catch(() => null);

        if (!response.ok) {
          throw new Error(
            responseData?.message ||
              `Failed to fetch destinations (${response.status})`,
          );
        }

        const data: Destination[] = Array.isArray(responseData)
          ? responseData
          : responseData?.destinations;

        if (!Array.isArray(data)) {
          throw new Error("Invalid destination data received from server.");
        }

        if (!controller.signal.aborted) {
          setDestinations(data);
        }
      } catch (err) {
        if (err instanceof Error && err.name !== "AbortError") {
          console.error("Error fetching destinations:", err);

          if (!controller.signal.aborted) {
            setError(err.message);
            setDestinations([]);
          }
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchDestinations();

    return () => controller.abort();
  }, []);

  const filteredDestinations = destinations
    .filter((item) => {
      if (
        category !== "all" &&
        item.category?.toLowerCase() !== category.toLowerCase()
      ) {
        return false;
      }

      if (priceRange === "under500" && item.price >= 500) {
        return false;
      }

      if (
        priceRange === "500to1500" &&
        (item.price < 500 || item.price > 1500)
      ) {
        return false;
      }

      if (priceRange === "over1500" && item.price <= 1500) {
        return false;
      }

      return true;
    })
    .sort((a, b) => {
      if (sortBy === "price-low") return a.price - b.price;
      if (sortBy === "price-high") return b.price - a.price;

      if (sortBy === "rating") {
        return (b.rating ?? 0) - (a.rating ?? 0);
      }

      return 0;
    });

  const resetFilters = () => {
    setCategory("all");
    setPriceRange("all");
    setSortBy("default");
  };

  const hasActiveFilters =
    category !== "all" || priceRange !== "all" || sortBy !== "default";

  return (
    <section className="min-h-screen w-full overflow-x-clip bg-[#fafbfc] px-3 pb-12 pt-20 text-slate-800 sm:px-5 sm:pb-16 sm:pt-28 md:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl min-w-0">
        {/* Header */}
        <div className="mb-7 flex min-w-0 flex-col justify-between gap-4 sm:mb-10 sm:flex-row sm:items-end">
          <div className="min-w-0">
            <div className="mb-3 inline-flex max-w-full items-center gap-2 rounded-full border border-[#15A1BF]/20 bg-[#15A1BF]/5 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#1389a3] sm:tracking-[0.18em]">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#15A1BF]" />
              Find your next escape
            </div>

            <h1 className="break-words text-2xl font-medium tracking-tight text-slate-900 sm:text-3xl md:text-4xl lg:text-5xl">
              Explore Destinations
            </h1>

            <p className="mt-3 max-w-xl text-xs leading-6 text-slate-500 sm:text-sm">
              Discover extraordinary places, beautiful landscapes, and
              unforgettable travel experiences.
            </p>
          </div>

          <div className="flex min-w-0 items-center gap-2 text-xs text-slate-500">
            <MapPin className="h-4 w-4 shrink-0 text-[#15A1BF]" />
            <span>Discover somewhere new</span>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 min-w-0 rounded-xl border border-slate-200/80 bg-white p-3 shadow-sm sm:mb-7 sm:rounded-2xl sm:p-4">
          <div className="mb-3 flex items-center gap-2 px-1 text-xs font-semibold text-slate-700 sm:mb-4">
            <SlidersHorizontal className="h-4 w-4 shrink-0 text-[#15A1BF]" />
            Refine your search
          </div>

          <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Select
              value={category}
              onValueChange={(value) => setCategory(value ?? "all")}
            >
              <SelectTrigger className="h-11 w-full min-w-0 rounded-xl border-slate-200 bg-slate-50/70 text-xs font-medium text-slate-700 transition hover:bg-white focus:ring-1 focus:ring-[#15A1BF]">
                <span className="min-w-0 flex-1 truncate text-left">
                  {category === "all" ? "All Categories" : category}
                </span>
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Beach">Beach</SelectItem>
                <SelectItem value="Mountain">Mountain</SelectItem>
                <SelectItem value="Cultural">Cultural</SelectItem>
                <SelectItem value="Adventure">Adventure</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={priceRange}
              onValueChange={(value) => setPriceRange(value ?? "all")}
            >
              <SelectTrigger className="h-11 w-full min-w-0 rounded-xl border-slate-200 bg-slate-50/70 text-xs font-medium text-slate-700 transition hover:bg-white focus:ring-1 focus:ring-[#15A1BF]">
                <span className="min-w-0 flex-1 truncate text-left">
                  {priceRange === "all"
                    ? "All Prices"
                    : priceRange === "under500"
                      ? "Under $500"
                      : priceRange === "500to1500"
                        ? "$500 – $1,500"
                        : "Over $1,500"}
                </span>
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="all">All Prices</SelectItem>
                <SelectItem value="under500">Under $500</SelectItem>
                <SelectItem value="500to1500">$500 – $1,500</SelectItem>
                <SelectItem value="over1500">Over $1,500</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={sortBy}
              onValueChange={(value) => setSortBy(value ?? "default")}
            >
              <SelectTrigger className="h-11 w-full min-w-0 rounded-xl border-slate-200 bg-slate-50/70 text-xs font-medium text-slate-700 transition hover:bg-white focus:ring-1 focus:ring-[#15A1BF]">
                <span className="min-w-0 flex-1 truncate text-left">
                  {sortBy === "default"
                    ? "Recommended"
                    : sortBy === "price-low"
                      ? "Price: Low to High"
                      : sortBy === "price-high"
                        ? "Price: High to Low"
                        : "Highest Rated"}
                </span>
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="default">Recommended</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-5 flex min-w-0 flex-wrap items-center justify-between gap-3 sm:mb-6">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-900">
              Available destinations
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Showing {filteredDestinations.length}{" "}
              {filteredDestinations.length === 1
                ? "destination"
                : "destinations"}
            </p>
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="shrink-0 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 transition hover:border-[#15A1BF] hover:text-[#1389a3] sm:px-4"
            >
              Reset filters
            </button>
          )}
        </div>

        {/* Loading */}
        {loading ? (
          <div className="flex min-h-64 flex-col items-center justify-center rounded-xl border border-slate-200 bg-white px-4 sm:min-h-72 sm:rounded-2xl">
            <Loader2 className="mb-4 h-8 w-8 animate-spin text-[#15A1BF]" />
            <p className="text-center text-xs text-slate-500 sm:text-sm">
              Finding beautiful places for you...
            </p>
          </div>
        ) : error ? (
          /* Error State */
          <div className="rounded-xl border border-red-200 bg-white px-4 py-12 text-center sm:rounded-2xl sm:py-16">
            <MapPin className="mx-auto mb-4 h-8 w-8 text-red-400" />

            <h2 className="text-base font-semibold text-slate-800 sm:text-lg">
              Unable to load destinations
            </h2>

            <p className="mx-auto mt-2 max-w-sm break-words text-xs leading-5 text-slate-500 sm:text-sm">
              {error}
            </p>

            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-5 rounded-full bg-[#15A1BF] px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-[#108ca7]"
            >
              Try again
            </button>
          </div>
        ) : filteredDestinations.length === 0 ? (
          /* Empty State */
          <div className="rounded-xl border border-dashed border-slate-300 bg-white px-4 py-12 text-center sm:rounded-2xl sm:py-16">
            <MapPin className="mx-auto mb-4 h-8 w-8 text-slate-300" />

            <h2 className="text-base font-semibold text-slate-800 sm:text-lg">
              No destinations found
            </h2>

            <p className="mx-auto mt-2 max-w-sm text-xs leading-5 text-slate-500 sm:text-sm">
              Try changing your filters to discover more places.
            </p>

            <button
              type="button"
              onClick={resetFilters}
              className="mt-5 rounded-full bg-[#15A1BF] px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-[#108ca7]"
            >
              Clear filters
            </button>
          </div>
        ) : (
          /* Destination Cards */
          <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6 xl:gap-8">
            {filteredDestinations.map((item) => (
              <Link
                key={item._id}
                href={`/destinations/${item._id}`}
                className="group block min-w-0 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-[#15A1BF] focus-visible:ring-offset-2 sm:rounded-2xl sm:focus-visible:ring-offset-4"
                aria-label={`View details for ${item.destinationName}`}
              >
                <Card className="h-full min-w-0 overflow-hidden rounded-xl border border-slate-200/80 bg-white p-0 shadow-sm transition duration-300 group-hover:-translate-y-1 group-hover:border-slate-300 group-hover:shadow-xl group-hover:shadow-slate-200/70 sm:rounded-2xl">
                  <CardContent className="flex h-full min-w-0 flex-col p-0">
                    {/* Image */}
                    <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100 sm:aspect-[5/4] lg:aspect-[4/3]">
                      <img
                        src={
                          item.imageUrl ||
                          "https://images.unsplash.com/photo-1537996194471-e657df975ab4"
                        }
                        alt={item.destinationName}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                      />

                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10 opacity-70 transition-opacity duration-300 group-hover:opacity-100" />

                      <div className="absolute left-3 top-3 max-w-[60%] truncate rounded-full border border-white/30 bg-white/90 px-2.5 py-1.5 text-[9px] font-semibold uppercase tracking-wider text-slate-800 shadow-sm backdrop-blur-md sm:left-4 sm:top-4 sm:px-3 sm:text-[10px]">
                        {item.category || "Destination"}
                      </div>

                      <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-white px-2.5 py-1.5 text-[11px] font-semibold text-slate-800 shadow-md sm:right-4 sm:top-4 sm:gap-1.5 sm:px-3 sm:text-xs">
                        <Star className="h-3.5 w-3.5 shrink-0 fill-amber-400 text-amber-400" />
                        {item.rating ?? 4.5}
                      </div>

                      <div className="absolute inset-x-3 bottom-3 flex min-w-0 items-center gap-1.5 text-xs font-medium text-white drop-shadow-md sm:inset-x-4 sm:bottom-4">
                        <MapPin className="h-4 w-4 shrink-0" />
                        <span className="truncate">{item.country}</span>
                      </div>
                    </div>

                    {/* Card Details */}
                    <div className="flex min-w-0 flex-1 flex-col p-4 sm:p-5 lg:p-6">
                      <h3 className="line-clamp-2 min-h-[3rem] break-words text-base font-semibold leading-6 tracking-tight text-slate-900 transition-colors group-hover:text-[#1389a3] sm:min-h-[3.5rem] sm:text-lg sm:leading-7">
                        {item.destinationName}
                      </h3>

                      <div className="mt-3 flex min-w-0 items-center gap-2 text-xs text-slate-500">
                        <Calendar className="h-4 w-4 shrink-0 text-[#15A1BF]" />
                        <span className="truncate">
                          {item.duration || "7 Days / 6 Nights"}
                        </span>
                      </div>

                      <div className="my-4 border-t border-slate-100 sm:my-5" />

                      {/* Price and CTA */}
                      <div className="mt-auto flex min-w-0 items-end justify-between gap-2 sm:gap-3">
                        <div className="min-w-0">
                          <p className="mb-1 text-[9px] font-medium uppercase tracking-[0.12em] text-slate-400 sm:text-[10px] sm:tracking-[0.15em]">
                            Starting from
                          </p>

                          <div className="flex min-w-0 flex-wrap items-baseline gap-x-1">
                            <span className="break-words text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                              ${item.price.toLocaleString("en-US")}
                            </span>

                            <span className="text-[10px] text-slate-400 sm:text-xs">
                              / person
                            </span>
                          </div>
                        </div>

                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#15A1BF]/10 text-[#1389a3] transition duration-300 group-hover:bg-[#15A1BF] group-hover:text-white sm:h-10 sm:w-10">
                          <ArrowUpRight className="h-5 w-5 transition-transform duration-300 group-hover:rotate-45" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
