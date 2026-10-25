"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Star,
  Loader2,
  Check,
  ArrowRight,
  Pencil,
  Trash2,
  X,
  AlertTriangle,
  MapPin,
} from "lucide-react";

import { Button } from "@/components/ui/button";

type Destination = {
  _id: string;
  destinationName: string;
  country: string;
  category?: string;
  price: number;
  duration: string;
  departureDate: string;
  imageUrl: string;
  description: string;
  rating?: number;
};

type DestinationFormData = {
  destinationName: string;
  country: string;
  category: string;
  price: string;
  duration: string;
  departureDate: string;
  imageUrl: string;
  description: string;
};

const API_URL = "http://localhost:5000";

async function readApiResponse(response: Response) {
  const text = await response.text();

  let data: any;

  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    throw new Error(
      `API returned invalid JSON. Status: ${response.status}. Check your backend route.`,
    );
  }

  if (!response.ok) {
    throw new Error(
      data.message || `Request failed with status ${response.status}`,
    );
  }

  return data;
}

function createFormData(destination: Destination): DestinationFormData {
  return {
    destinationName: destination.destinationName ?? "",
    country: destination.country ?? "",
    category: destination.category ?? "",
    price: String(destination.price ?? ""),
    duration: destination.duration ?? "",
    departureDate: destination.departureDate
      ? destination.departureDate.slice(0, 10)
      : "",
    imageUrl: destination.imageUrl ?? "",
    description: destination.description ?? "",
  };
}

export default function DestinationDetailsClient({ id }: { id: string }) {
  const router = useRouter();

  const [destination, setDestination] = useState<Destination | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const [formData, setFormData] = useState<DestinationFormData>({
    destinationName: "",
    country: "",
    category: "",
    price: "",
    duration: "",
    departureDate: "",
    imageUrl: "",
    description: "",
  });

  useEffect(() => {
    let cancelled = false;

    async function fetchDestination() {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(
          `${API_URL}/destinations/${encodeURIComponent(id)}`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
            },
            cache: "no-store",
          },
        );

        const data = await readApiResponse(response);
        const item: Destination = data.destination ?? data;

        if (!item?._id) {
          throw new Error("Destination not found.");
        }

        if (!cancelled) {
          setDestination(item);
          setFormData(createFormData(item));
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to load destination.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    if (id) {
      fetchDestination();
    }

    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleInputChange = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleUpdate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!destination || saving || deleting) return;

    const previousDestination = destination;
    const previousFormData = formData;

    const optimisticDestination: Destination = {
      ...destination,
      destinationName: formData.destinationName,
      country: formData.country,
      category: formData.category,
      price: Number(formData.price),
      duration: formData.duration,
      departureDate: formData.departureDate,
      imageUrl: formData.imageUrl,
      description: formData.description,
    };

    // Update the UI immediately
    setDestination(optimisticDestination);
    setIsEditOpen(false);
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `${API_URL}/destinations/${encodeURIComponent(id)}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            ...formData,
            price: Number(formData.price),
          }),
        },
      );

      const data = await readApiResponse(response);
      const apiDestination: Partial<Destination> = data.destination ?? data;

      const updatedDestination: Destination = {
        ...optimisticDestination,
        ...apiDestination,
        _id: apiDestination._id ?? previousDestination._id,
      };

      setDestination(updatedDestination);
      setFormData(createFormData(updatedDestination));
      setSuccess("Destination updated successfully.");
    } catch (err) {
      // Restore original data if the request fails
      setDestination(previousDestination);
      setFormData(previousFormData);
      setIsEditOpen(true);

      setError(
        err instanceof Error ? err.message : "Failed to update destination.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!destination || deleting || saving) return;

    setDeleting(true);
    setError("");

    try {
      const response = await fetch(
        `${API_URL}/destinations/${encodeURIComponent(id)}`,
        {
          method: "DELETE",
          headers: {
            Accept: "application/json",
          },
        },
      );

      await readApiResponse(response);

      setIsDeleteOpen(false);

      // Navigate once; no additional refresh call
      router.replace("/destinations");
    } catch (err) {
      setIsDeleteOpen(false);

      setError(
        err instanceof Error ? err.message : "Failed to delete destination.",
      );
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center bg-white px-4">
        <Loader2 className="h-8 w-8 shrink-0 animate-spin text-[#15A1BF]" />
        <span className="ml-3 text-sm text-gray-600">
          Loading destination details...
        </span>
      </main>
    );
  }

  if (!destination) {
    return (
      <main className="mx-auto max-w-3xl bg-white px-4 py-10 sm:py-16">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-center shadow-sm sm:p-6">
          <AlertTriangle className="mx-auto mb-3 h-8 w-8 text-red-500" />

          <h1 className="text-xl font-bold text-gray-900">
            Destination not found
          </h1>

          <p className="mt-2 break-words text-sm text-red-600">
            {error || "This destination could not be loaded."}
          </p>

          <Link
            href="/destinations"
            className="mt-5 inline-flex items-center justify-center gap-2 rounded-lg bg-[#15A1BF] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#128ca7]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to destinations
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen overflow-x-clip bg-white pb-10 sm:pb-16">
      {/* Navbar */}
      <header className="border-b border-gray-100 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-4 gap-y-3 px-4 py-3 sm:px-6 sm:py-4 lg:px-8">
          <Link
            href="/"
            className="shrink-0 text-lg font-bold text-[#15A1BF] sm:text-xl"
          >
            Wanderlast
          </Link>

          <nav className="hidden items-center gap-5 text-xs font-medium text-gray-600 lg:flex xl:gap-8">
            <Link href="/" className="transition hover:text-[#15A1BF]">
              Home
            </Link>

            <Link
              href="/destinations"
              className="transition hover:text-[#15A1BF]"
            >
              Destinations
            </Link>

            <Link
              href="/my-bookings"
              className="transition hover:text-[#15A1BF]"
            >
              My Bookings
            </Link>

            <Link href="/admin" className="transition hover:text-[#15A1BF]">
              Admin
            </Link>
          </nav>

          <div className="flex flex-wrap items-center justify-end gap-x-3 gap-y-2 text-[11px] font-medium text-gray-600 sm:gap-x-5 sm:text-xs lg:gap-x-6">
            <Link href="/profile" className="transition hover:text-[#15A1BF]">
              Profile
            </Link>

            <Link href="/login" className="transition hover:text-[#15A1BF]">
              Login
            </Link>

            <Link href="/signup" className="transition hover:text-[#15A1BF]">
              Sign Up
            </Link>
          </div>

          <nav className="flex w-full items-center justify-center gap-x-5 gap-y-2 overflow-x-auto whitespace-nowrap border-t border-gray-100 pt-3 text-xs font-medium text-gray-600 sm:gap-x-8 lg:hidden">
            <Link href="/" className="transition hover:text-[#15A1BF]">
              Home
            </Link>

            <Link
              href="/destinations"
              className="transition hover:text-[#15A1BF]"
            >
              Destinations
            </Link>

            <Link
              href="/my-bookings"
              className="transition hover:text-[#15A1BF]"
            >
              My Bookings
            </Link>

            <Link href="/admin" className="transition hover:text-[#15A1BF]">
              Admin
            </Link>
          </nav>
        </div>
      </header>

      <div className="mx-auto w-full max-w-6xl px-3 py-4 sm:px-6 sm:py-6 lg:px-8">
        {/* Main Image */}
        <div className="relative mb-5 overflow-hidden rounded-xl bg-gray-100 sm:mb-6">
          <div className="absolute left-2 top-2 z-10 sm:left-4 sm:top-4">
            <Link
              href="/destinations"
              className="inline-flex max-w-full items-center gap-1.5 rounded-md bg-white/95 px-2.5 py-2 text-[10px] font-medium text-gray-700 shadow-sm backdrop-blur-sm transition hover:bg-white sm:px-3 sm:text-xs"
            >
              <ArrowLeft className="h-3.5 w-3.5 shrink-0" />
              <span>Back to Destinations</span>
            </Link>
          </div>

          <div className="absolute right-2 top-2 z-10 flex items-center gap-1.5 sm:right-4 sm:top-4 sm:gap-2">
            <button
              type="button"
              disabled={saving || deleting}
              onClick={() => {
                setError("");
                setSuccess("");
                setFormData(createFormData(destination));
                setIsEditOpen(true);
              }}
              className="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-white/95 px-2 py-2 text-[10px] font-medium text-gray-700 shadow-sm backdrop-blur-sm transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60 sm:px-3 sm:text-xs"
            >
              <Pencil className="h-3 w-3 text-gray-500" />
              Edit
            </button>

            <button
              type="button"
              disabled={saving || deleting}
              onClick={() => {
                setError("");
                setIsDeleteOpen(true);
              }}
              className="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-white/95 px-2 py-2 text-[10px] font-medium text-red-600 shadow-sm backdrop-blur-sm transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60 sm:px-3 sm:text-xs"
            >
              <Trash2 className="h-3 w-3 text-red-500" />
              Delete
            </button>
          </div>

          {/* Banner Image */}
          <div className="h-64 w-full sm:h-80 md:h-[400px] lg:h-[440px]">
            {destination.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={destination.imageUrl}
                alt={destination.destinationName}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-gray-400">
                No Image Available
              </div>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div
            role="alert"
            className="mb-5 flex min-w-0 items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 sm:p-4"
          >
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />

            <p className="min-w-0 flex-1 break-words">{error}</p>

            <button
              type="button"
              onClick={() => setError("")}
              className="shrink-0"
              aria-label="Close error"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div
            role="status"
            className="mb-5 flex min-w-0 items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-700 sm:p-4"
          >
            <Check className="h-5 w-5 shrink-0" />

            <p className="min-w-0 flex-1 break-words">{success}</p>

            <button
              type="button"
              onClick={() => setSuccess("")}
              className="shrink-0"
              aria-label="Close message"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Destination Content */}
        <div className="mt-5 rounded-xl border border-dashed border-cyan-300 p-4 sm:mt-6 sm:p-6 md:p-8">
          <div className="grid min-w-0 items-start gap-7 lg:grid-cols-[minmax(0,1.8fr)_minmax(260px,1fr)] lg:gap-8">
            {/* Left Content */}
            <div className="min-w-0">
              <h1 className="break-words text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl md:text-4xl">
                {destination.destinationName}
              </h1>

              {/* Country Name */}
              <div className="mt-2 flex min-w-0 items-center gap-1.5 text-sm text-gray-500">
                <MapPin className="h-4 w-4 shrink-0 text-[#15A1BF]" />
                <span className="break-words">
                  {destination.country || "Country not specified"}
                </span>
              </div>

              {/* Rating & Duration */}
              <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-gray-500">
                <div className="flex flex-wrap items-center gap-1">
                  <Star className="h-3.5 w-3.5 shrink-0 fill-emerald-500 text-emerald-500" />
                  <span className="font-bold text-emerald-600">
                    {destination.rating ?? 4.9}
                  </span>
                  <span className="text-gray-400">(1234 reviews)</span>
                </div>

                <span className="hidden text-gray-300 sm:inline">•</span>

                <span className="break-words font-medium text-gray-700">
                  {destination.duration || "7 Days / 6 Nights"}
                </span>
              </div>

              {/* Overview */}
              <div className="mt-6 sm:mt-8">
                <h2 className="text-base font-bold text-gray-900">Overview</h2>

                <p className="mt-2 break-words text-xs leading-relaxed text-gray-500 sm:text-sm">
                  {destination.description ||
                    "Discover the magic of Bali with pristine beaches, ancient temples, and vibrant culture. Experience luxury resorts, tropical landscapes, and unforgettable sunsets."}
                </p>
              </div>

              {/* Highlights */}
              <div className="mt-6 sm:mt-8">
                <h2 className="text-base font-bold text-gray-900">
                  Highlights
                </h2>

                <p className="mb-4 mt-1 break-words text-xs leading-relaxed text-gray-500 sm:text-sm">
                  Discover the magic of Bali with pristine beaches, ancient
                  temples, and vibrant culture. Experience luxury resorts,
                  tropical landscapes, and unforgettable sunsets.
                </p>

                <div className="grid grid-cols-1 gap-x-6 gap-y-3 text-xs text-gray-600 sm:grid-cols-2 sm:text-sm">
                  <div className="flex min-w-0 items-start gap-2">
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#15A1BF]" />
                    <span>Luxury beachfront accommodation</span>
                  </div>

                  <div className="flex min-w-0 items-start gap-2">
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#15A1BF]" />
                    <span>Wi-Fi and in Tropical &amp; cultural</span>
                  </div>

                  <div className="flex min-w-0 items-start gap-2">
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#15A1BF]" />
                    <span>Find luxury Bali massage treatment</span>
                  </div>

                  <div className="flex min-w-0 items-start gap-2">
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#15A1BF]" />
                    <span>Private beach dinner experience</span>
                  </div>

                  <div className="flex min-w-0 items-start gap-2">
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#15A1BF]" />
                    <span>Sunrise trek to Mount Batur</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Price Card */}
            <aside className="min-w-0 rounded-xl border border-gray-100 bg-gray-50/50 p-4 sm:p-5">
              <p className="text-[11px] text-gray-400">Starting from</p>

              <div className="mt-1 flex flex-wrap items-baseline gap-x-1 gap-y-1">
                <span className="break-words text-2xl font-bold text-[#15A1BF] sm:text-3xl">
                  ${Number(destination.price || 1299).toLocaleString("en-US")}
                </span>

                <span className="text-[10px] text-gray-400">per person</span>
              </div>

              {/* Date */}
              <div className="mt-5">
                <div className="relative rounded-md border border-gray-200 bg-white px-3 py-3 pr-10">
                  <span className="block break-words text-xs text-gray-500">
                    {destination.departureDate
                      ? destination.departureDate.slice(0, 10)
                      : "05/18/2028"}
                  </span>

                  <Calendar className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                </div>
              </div>

              {/* Book Now */}
              <Button
                type="button"
                className="mt-4 w-full gap-2 rounded-md bg-[#15A1BF] py-3 text-xs font-medium text-white hover:bg-[#1188a3]"
                onClick={() => {
                  setSuccess("Booking functionality will be added soon.");
                }}
              >
                Book Now
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>

              {/* Perks */}
              <div className="mt-5 space-y-3 text-[11px] leading-relaxed text-gray-500 sm:text-xs">
                <div className="flex items-start gap-2">
                  <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-green-500" />
                  <span>Free cancellation up to 7 days</span>
                </div>

                <div className="flex items-start gap-2">
                  <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-green-500" />
                  <span>Travel tax &amp; fees included</span>
                </div>

                <div className="flex items-start gap-2">
                  <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-green-500" />
                  <span>24/7 customer support</span>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>

      {/* Edit Form Modal */}
      {isEditOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-3 sm:p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !saving) {
              setIsEditOpen(false);
            }
          }}
        >
          <div className="my-auto max-h-[92dvh] w-full max-w-2xl overflow-y-auto overscroll-contain rounded-xl bg-white p-4 shadow-xl sm:rounded-2xl sm:p-6 md:p-7">
            <div className="mb-5 flex items-start justify-between gap-3 sm:mb-6">
              <div className="min-w-0">
                <h2 className="text-lg font-bold text-gray-900 sm:text-xl">
                  Edit destination
                </h2>

                <p className="mt-1 text-xs leading-relaxed text-gray-500 sm:text-sm">
                  Update destination information.
                </p>
              </div>

              <button
                type="button"
                disabled={saving}
                onClick={() => setIsEditOpen(false)}
                className="shrink-0 rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 disabled:opacity-60"
                aria-label="Close edit form"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="block min-w-0 text-sm font-medium text-gray-700">
                  Destination name
                  <input
                    required
                    name="destinationName"
                    value={formData.destinationName}
                    onChange={handleInputChange}
                    className="mt-2 w-full min-w-0 rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-[#15A1BF] focus:ring-2 focus:ring-cyan-100"
                  />
                </label>

                <label className="block min-w-0 text-sm font-medium text-gray-700">
                  Country
                  <input
                    required
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    className="mt-2 w-full min-w-0 rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-[#15A1BF] focus:ring-2 focus:ring-cyan-100"
                  />
                </label>

                <label className="block min-w-0 text-sm font-medium text-gray-700">
                  Category
                  <input
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="mt-2 w-full min-w-0 rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-[#15A1BF] focus:ring-2 focus:ring-cyan-100"
                  />
                </label>

                <label className="block min-w-0 text-sm font-medium text-gray-700">
                  Price ($)
                  <input
                    required
                    min="0"
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    className="mt-2 w-full min-w-0 rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-[#15A1BF] focus:ring-2 focus:ring-cyan-100"
                  />
                </label>

                <label className="block min-w-0 text-sm font-medium text-gray-700">
                  Duration
                  <input
                    required
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                    placeholder="e.g. 7 Days / 6 Nights"
                    className="mt-2 w-full min-w-0 rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-[#15A1BF] focus:ring-2 focus:ring-cyan-100"
                  />
                </label>

                <label className="block min-w-0 text-sm font-medium text-gray-700">
                  Departure date
                  <input
                    type="date"
                    name="departureDate"
                    value={formData.departureDate}
                    onChange={handleInputChange}
                    className="mt-2 w-full min-w-0 rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-[#15A1BF] focus:ring-2 focus:ring-cyan-100"
                  />
                </label>
              </div>

              <label className="block min-w-0 text-sm font-medium text-gray-700">
                Image URL
                <input
                  type="url"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleInputChange}
                  placeholder="https://example.com/image.jpg"
                  className="mt-2 w-full min-w-0 rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-[#15A1BF] focus:ring-2 focus:ring-cyan-100"
                />
              </label>

              <label className="block min-w-0 text-sm font-medium text-gray-700">
                Description
                <textarea
                  required
                  rows={5}
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="mt-2 w-full min-w-0 resize-y rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-[#15A1BF] focus:ring-2 focus:ring-cyan-100"
                />
              </label>

              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end sm:pt-3">
                <Button
                  type="button"
                  variant="outline"
                  disabled={saving}
                  onClick={() => {
                    setFormData(createFormData(destination));
                    setIsEditOpen(false);
                  }}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  disabled={saving}
                  className="w-full gap-2 bg-[#15A1BF] text-white hover:bg-[#1188a3] sm:w-auto"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4" />
                      Save changes
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-3 sm:p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !deleting) {
              setIsDeleteOpen(false);
            }
          }}
        >
          <div className="my-auto w-full max-w-md rounded-xl bg-white p-5 shadow-xl sm:rounded-2xl sm:p-7">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600 sm:h-14 sm:w-14">
              <Trash2 className="h-6 w-6 sm:h-7 sm:w-7" />
            </div>

            <h2 className="mt-5 text-center text-lg font-bold text-gray-900 sm:text-xl">
              Delete destination?
            </h2>

            <p className="mt-3 break-words text-center text-sm leading-6 text-gray-600">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-gray-900">
                {destination.destinationName}
              </span>
              ? This action cannot be undone.
            </p>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:mt-7 sm:flex-row">
              <Button
                type="button"
                variant="outline"
                disabled={deleting}
                onClick={() => setIsDeleteOpen(false)}
                className="w-full flex-1"
              >
                Cancel
              </Button>

              <Button
                type="button"
                disabled={deleting}
                onClick={handleDelete}
                className="w-full flex-1 gap-2 bg-red-600 text-white hover:bg-red-700"
              >
                {deleting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
