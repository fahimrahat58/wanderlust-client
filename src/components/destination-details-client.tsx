"use client";

import { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import {
  ArrowLeft,
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

type Booking = {
  id: string;
  destinationId?: string;
  title: string;
  image: string;
  departure: string;
  bookingId: string;
  price: number;
  status: "Confirmed" | "Pending" | "Cancelled";
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

function getTodayDate() {
  const today = new Date();

  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(
    2,
    "0",
  )}-${String(today.getDate()).padStart(2, "0")}`;
}

export default function DestinationDetailsClient({ id }: { id: string }) {
  const router = useRouter();

  const [destination, setDestination] = useState<Destination | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [checkingBooking, setCheckingBooking] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [alreadyBooked, setAlreadyBooked] = useState(false);

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
            headers: { Accept: "application/json" },
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

          const destinationDate = item.departureDate?.slice(0, 10) ?? "";

          setSelectedDate(
            destinationDate && destinationDate >= getTodayDate()
              ? destinationDate
              : "",
          );
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to load destination.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    if (id) {
      fetchDestination();
    } else {
      setLoading(false);
      setError("Destination ID is missing.");
    }

    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    if (!destination?._id) return;

    let cancelled = false;

    async function checkBooking() {
      setCheckingBooking(true);

      try {
        const response = await fetch("/api/bookings", {
          method: "GET",
          headers: { Accept: "application/json" },
          cache: "no-store",
        });

        if (response.status === 401) {
          if (!cancelled) setAlreadyBooked(false);
          return;
        }

        if (!response.ok) {
          throw new Error("Unable to check your bookings.");
        }

        const data = await response.json();

        const bookings: Booking[] = Array.isArray(data)
          ? data
          : Array.isArray(data.bookings)
            ? data.bookings
            : [];

        if (cancelled) return;

        setAlreadyBooked(
          bookings.some(
            (booking) =>
              booking.destinationId === destination._id &&
              booking.status !== "Cancelled",
          ),
        );
      } catch (err) {
        if (!cancelled) {
          console.error("Failed to check bookings:", err);
          setAlreadyBooked(false);
        }
      } finally {
        if (!cancelled) setCheckingBooking(false);
      }
    }

    checkBooking();

    return () => {
      cancelled = true;
    };
  }, [destination?._id]);

  const handleInputChange = (
    event: ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleBooking = async () => {
    if (!destination || bookingLoading || alreadyBooked) return;

    if (!selectedDate) {
      toast.error("Please select your departure date.");
      return;
    }

    if (selectedDate < getTodayDate()) {
      toast.error("Please select today or a future date.");
      return;
    }

    setBookingLoading(true);

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          destinationId: destination._id,
          departure: selectedDate,
        }),
      });

      if (response.status === 401) {
        toast.error("Please log in to book this destination.");
        router.push("/login");
        return;
      }

      if (response.status === 409) {
        setAlreadyBooked(true);
        toast.error("You have already booked this destination.");
        return;
      }

      const data = await readApiResponse(response);

      setAlreadyBooked(true);
      toast.success(data.message || "Booking saved successfully!");
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Unable to save your booking. Please try again.",
      );
    } finally {
      setBookingLoading(false);
    }
  };

  const handleUpdate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!destination || saving || deleting) return;

    if (
      !formData.destinationName.trim() ||
      !formData.country.trim() ||
      !formData.duration.trim() ||
      !formData.description.trim()
    ) {
      toast.error("Please fill in all required fields.");
      return;
    }

    const price = Number(formData.price);

    if (formData.price.trim() === "" || !Number.isFinite(price) || price < 0) {
      toast.error("Please enter a valid price.");
      return;
    }

    const previousDestination = destination;
    const previousFormData = formData;

    const optimisticDestination: Destination = {
      ...destination,
      destinationName: formData.destinationName.trim(),
      country: formData.country.trim(),
      category: formData.category.trim(),
      price,
      duration: formData.duration.trim(),
      departureDate: formData.departureDate,
      imageUrl: formData.imageUrl.trim(),
      description: formData.description.trim(),
    };

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
            ...optimisticDestination,
            _id: undefined,
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

      const oldDepartureDate =
        previousDestination.departureDate?.slice(0, 10) ?? "";

      if (selectedDate === oldDepartureDate) {
        const updatedDate =
          updatedDestination.departureDate?.slice(0, 10) ?? "";

        setSelectedDate(
          updatedDate && updatedDate >= getTodayDate() ? updatedDate : "",
        );
      }

      setSuccess("Destination updated successfully.");
      toast.success("Destination updated successfully.");
    } catch (err) {
      setDestination(previousDestination);
      setFormData(previousFormData);
      setIsEditOpen(true);

      const message =
        err instanceof Error ? err.message : "Failed to update destination.";

      setError(message);
      toast.error(message);
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
          headers: { Accept: "application/json" },
        },
      );

      await readApiResponse(response);

      setIsDeleteOpen(false);
      toast.success("Destination deleted successfully.");
      router.replace("/destinations");
    } catch (err) {
      setIsDeleteOpen(false);

      const message =
        err instanceof Error ? err.message : "Failed to delete destination.";

      setError(message);
      toast.error(message);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center gap-3 bg-white px-4 pt-12 sm:min-h-[70vh]">
        <Loader2 className="h-7 w-7 shrink-0 animate-spin text-[#15A1BF] sm:h-8 sm:w-8" />
        <span className="text-center text-sm text-gray-600">
          Loading destination details...
        </span>
      </main>
    );
  }

  if (!destination) {
    return (
      <main className="mx-auto w-full max-w-3xl px-3 pb-10 pt-12 sm:px-6 sm:pt-16 lg:px-8 lg:pt-20">
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              borderRadius: "10px",
              fontSize: "14px",
            },
          }}
        />

        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-center shadow-sm sm:p-6">
          <AlertTriangle className="mx-auto mb-3 h-8 w-8 text-red-500" />

          <h1 className="text-xl font-bold text-gray-900">
            Destination not found
          </h1>

          <p className="mt-2 break-words text-sm text-red-600">
            {error || "This destination could not be loaded."}
          </p>

          <Link
            href="/destinations"
            className="mt-5 inline-flex items-center justify-center gap-2 rounded-lg bg-[#15A1BF] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#128ca7] sm:px-5"
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
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            borderRadius: "10px",
            fontSize: "14px",
          },
        }}
      />
      <div className="mx-auto w-full max-w-6xl px-3 pb-6 pt-24 sm:px-6 sm:pb-8 sm:pt-32 md:pt-36 lg:px-8 lg:pt-40">
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

          <div className="absolute right-2 top-2 z-10 flex max-w-[70%] items-center gap-1.5 sm:right-4 sm:top-4 sm:gap-2">
            <button
              type="button"
              disabled={saving || deleting}
              onClick={() => {
                setError("");
                setSuccess("");
                setFormData(createFormData(destination));
                setIsEditOpen(true);
              }}
              className="inline-flex min-w-0 items-center justify-center gap-1 rounded-md border border-gray-200 bg-white/95 px-2 py-2 text-[10px] font-medium text-gray-700 shadow-sm backdrop-blur-sm transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60 sm:px-3 sm:text-xs"
            >
              <Pencil className="h-3 w-3 shrink-0 text-gray-500" />
              Edit
            </button>

            <button
              type="button"
              disabled={saving || deleting}
              onClick={() => {
                setError("");
                setIsDeleteOpen(true);
              }}
              className="inline-flex min-w-0 items-center justify-center gap-1 rounded-md border border-gray-200 bg-white/95 px-2 py-2 text-[10px] font-medium text-red-600 shadow-sm backdrop-blur-sm transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60 sm:px-3 sm:text-xs"
            >
              <Trash2 className="h-3 w-3 shrink-0 text-red-500" />
              Delete
            </button>
          </div>

          <div className="h-56 w-full sm:h-72 md:h-[400px] lg:h-[440px]">
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

        <section className="mt-5 rounded-xl border border-dashed border-cyan-300 p-3 sm:mt-6 sm:p-5 md:p-8">
          <div className="grid min-w-0 items-start gap-6 md:gap-8 lg:grid-cols-[minmax(0,1.8fr)_minmax(260px,1fr)]">
            <div className="min-w-0">
              <h1 className="break-words text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl md:text-4xl">
                {destination.destinationName}
              </h1>

              <div className="mt-2 flex min-w-0 items-center gap-1.5 text-sm text-gray-500">
                <MapPin className="h-4 w-4 shrink-0 text-[#15A1BF]" />
                <span className="break-words">
                  {destination.country || "Country not specified"}
                </span>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-gray-500 sm:text-sm">
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

              <div className="mt-6 sm:mt-8">
                <h2 className="text-base font-bold text-gray-900">Overview</h2>
                <p className="mt-2 break-words text-sm leading-relaxed text-gray-500">
                  {destination.description ||
                    "Discover the magic of this destination and experience unforgettable landscapes, local culture, and beautiful views."}
                </p>
              </div>

              <div className="mt-6 sm:mt-8">
                <h2 className="text-base font-bold text-gray-900">
                  Highlights
                </h2>
                <p className="mb-4 mt-1 break-words text-sm leading-relaxed text-gray-500">
                  Explore local culture, enjoy beautiful scenery, and create
                  unforgettable travel memories.
                </p>

                <div className="grid grid-cols-1 gap-x-6 gap-y-3 text-sm text-gray-600 sm:grid-cols-2">
                  {[
                    "Comfortable accommodation",
                    "Local sightseeing experience",
                    "Discover local culture",
                    "Beautiful scenic locations",
                    "Memorable travel experience",
                  ].map((highlight) => (
                    <div
                      key={highlight}
                      className="flex min-w-0 items-start gap-2"
                    >
                      <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#15A1BF]" />
                      <span className="break-words">{highlight}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <aside className="min-w-0 w-full rounded-xl border border-gray-100 bg-gray-50/50 p-4 sm:p-5">
              <p className="text-xs text-gray-400">Starting from</p>

              <div className="mt-1 flex flex-wrap items-baseline gap-x-1 gap-y-1">
                <span className="break-words text-2xl font-bold text-[#15A1BF] sm:text-3xl">
                  ${Number(destination.price ?? 0).toLocaleString("en-US")}
                </span>
                <span className="text-xs text-gray-400">per person</span>
              </div>

              <div className="mt-5">
                <label
                  htmlFor="booking-date"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Select Departure Date
                </label>

                <input
                  id="booking-date"
                  type="date"
                  value={selectedDate}
                  min={getTodayDate()}
                  onChange={(event) => setSelectedDate(event.target.value)}
                  className="w-full min-w-0 rounded-md border border-gray-200 bg-white px-3 py-3 text-sm text-gray-700 outline-none focus:border-[#15A1BF] focus:ring-2 focus:ring-cyan-100"
                />
              </div>

              <Button
                type="button"
                disabled={
                  bookingLoading ||
                  checkingBooking ||
                  alreadyBooked ||
                  !selectedDate
                }
                onClick={handleBooking}
                className="mt-4 w-full gap-2 rounded-md bg-[#15A1BF] py-3 text-sm font-medium text-white hover:bg-[#1188a3] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {bookingLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Booking...
                  </>
                ) : checkingBooking ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Checking booking...
                  </>
                ) : alreadyBooked ? (
                  <>
                    <Check className="h-4 w-4" />
                    Already Booked
                  </>
                ) : (
                  <>
                    Book Now
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>

              {alreadyBooked && (
                <div className="mt-3 rounded-lg border border-green-200 bg-green-50 p-3">
                  <p className="text-sm leading-relaxed text-green-700">
                    You have already booked this destination. You can view your
                    booking in My Bookings.
                  </p>
                  <Link
                    href="/my-bookings"
                    className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-green-800 underline underline-offset-2"
                  >
                    View My Bookings
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              )}

              <div className="mt-5 space-y-3 text-xs leading-relaxed text-gray-500 sm:text-sm">
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
        </section>
      </div>

      {isEditOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-2 sm:p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !saving) {
              setIsEditOpen(false);
            }
          }}
        >
          <div className="my-auto max-h-[calc(100dvh-1rem)] w-full max-w-2xl overflow-y-auto overscroll-contain rounded-xl bg-white p-4 shadow-xl sm:max-h-[92dvh] sm:rounded-2xl sm:p-6 md:p-7">
            <div className="mb-5 flex items-start justify-between gap-3 sm:mb-6">
              <div className="min-w-0">
                <h2 className="text-lg font-bold text-gray-900 sm:text-xl">
                  Edit destination
                </h2>
                <p className="mt-1 text-sm leading-relaxed text-gray-500">
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
                    step="any"
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

      {isDeleteOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-3 sm:p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !deleting) {
              setIsDeleteOpen(false);
            }
          }}
        >
          <div className="my-auto w-full max-w-md rounded-xl bg-white p-4 shadow-xl sm:rounded-2xl sm:p-7">
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
