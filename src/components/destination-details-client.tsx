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
  CalendarDays,
  Clock3,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";

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
  createdAt?: string | Date;
  updatedAt?: string | Date;
};

type DestinationFormData = {
  destinationName: string;
  country: string;
  category: string;
  price: string;
  rating: string;
  duration: string;
  departureDate: string;
  imageUrl: string;
  description: string;
};

type Booking = {
  id?: string;
  _id?: string;
  destinationId?: string;
  destination?: { _id?: string };
  title?: string;
  image?: string;
  departure?: string;
  bookingId?: string;
  price?: number;
  status?: string;
};

type ApiResponse = Record<string, unknown> & {
  message?: string;
  destination?: Destination;
  bookings?: Booking[];
  data?: unknown;
};

function getTodayDate() {
  const now = new Date();

  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
    2,
    "0",
  )}-${String(now.getDate()).padStart(2, "0")}`;
}

function createFormData(destination: Destination): DestinationFormData {
  return {
    destinationName: destination.destinationName ?? "",
    country: destination.country ?? "",
    category: destination.category ?? "",
    price: String(destination.price ?? ""),
    rating: String(destination.rating ?? 4.9),
    duration: destination.duration ?? "",
    departureDate: destination.departureDate
      ? String(destination.departureDate).slice(0, 10)
      : "",
    imageUrl: destination.imageUrl ?? "",
    description: destination.description ?? "",
  };
}

function formatDateTime(value?: string | Date) {
  if (!value) return "Not available";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Not available";

  return new Intl.DateTimeFormat("en-BD", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Dhaka",
  }).format(date);
}

async function readApiResponse(response: Response): Promise<ApiResponse> {
  const text = await response.text();

  let data: ApiResponse;

  try {
    const parsed: unknown = text ? JSON.parse(text) : {};

    if (Array.isArray(parsed)) {
      data = { data: parsed };
    } else if (typeof parsed === "object" && parsed !== null) {
      data = parsed as ApiResponse;
    } else {
      throw new Error("Invalid response shape");
    }
  } catch {
    throw new Error(
      `Invalid API response (${response.status}). Check your backend route.`,
    );
  }

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Please log in to continue.");
    }

    if (response.status === 403) {
      throw new Error("Admin permission is required.");
    }

    throw new Error(
      data.message || `Request failed with status ${response.status}.`,
    );
  }

  return data;
}

function extractBookings(data: ApiResponse): Booking[] {
  if (Array.isArray(data.bookings)) {
    return data.bookings;
  }

  if (Array.isArray(data.data)) {
    return data.data as Booking[];
  }

  if (typeof data.data === "object" && data.data !== null) {
    const nestedBookings = (data.data as Record<string, unknown>).bookings;

    if (Array.isArray(nestedBookings)) {
      return nestedBookings as Booking[];
    }
  }

  return [];
}

export default function DestinationDetailsClient({ id }: { id: string }) {
  const router = useRouter();

  const [destination, setDestination] = useState<Destination | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [checkingBooking, setCheckingBooking] = useState(false);

  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);

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
    rating: "4.9",
    duration: "",
    departureDate: "",
    imageUrl: "",
    description: "",
  });

  // Check Admin permission through the protected backend endpoint.
  useEffect(() => {
    let cancelled = false;

    async function checkAdmin() {
      setCheckingAdmin(true);
      setIsAdmin(false);

      try {
        const response = await apiFetch("/admin/bookings");

        if (response.status === 401) {
          router.replace("/login");
          return;
        }

        if (response.status === 403) {
          if (!cancelled) setIsAdmin(false);
          return;
        }

        if (!response.ok) {
          if (!cancelled) setIsAdmin(false);
          return;
        }

        await readApiResponse(response);

        if (!cancelled) {
          setIsAdmin(true);
        }
      } catch (err) {
        if (cancelled) return;

        setIsAdmin(false);

        const message = err instanceof Error ? err.message.toLowerCase() : "";

        if (message.includes("log in")) {
          router.replace("/login");
        } else {
          console.error("Admin verification failed:", err);
        }
      } finally {
        if (!cancelled) {
          setCheckingAdmin(false);
        }
      }
    }

    checkAdmin();

    return () => {
      cancelled = true;
    };
  }, [router]);

  // Load destination details with JWT authentication.
  useEffect(() => {
    let cancelled = false;

    async function fetchDestination() {
      setLoading(true);
      setError("");

      try {
        const response = await apiFetch(
          `/destinations/${encodeURIComponent(id)}`,
        );

        const data = await readApiResponse(response);
        const item = (data.destination ?? data) as Destination;

        if (!item?._id) {
          throw new Error("Destination not found.");
        }

        if (cancelled) return;

        setDestination(item);
        setFormData(createFormData(item));

        const date = item.departureDate
          ? String(item.departureDate).slice(0, 10)
          : "";

        setSelectedDate(date && date >= getTodayDate() ? date : "");
      } catch (err) {
        if (cancelled) return;

        const message =
          err instanceof Error ? err.message : "Failed to load destination.";

        if (message.toLowerCase().includes("log in")) {
          router.replace("/login");
          return;
        }

        setError(message);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    if (!id) {
      setLoading(false);
      setError("Destination ID is missing.");
    } else {
      fetchDestination();
    }

    return () => {
      cancelled = true;
    };
  }, [id, router]);

  // Check whether this user has already booked this destination.
  useEffect(() => {
    if (!destination?._id) return;

    let cancelled = false;
    const destinationId = destination._id;

    async function checkBooking() {
      setCheckingBooking(true);

      try {
        const response = await apiFetch("/bookings");
        const data = await readApiResponse(response);
        const bookings = extractBookings(data);

        if (cancelled) return;

        setAlreadyBooked(
          bookings.some((booking) => {
            const bookingDestinationId =
              booking.destinationId ?? booking.destination?._id;

            const status = booking.status?.toLowerCase();

            return (
              bookingDestinationId === destinationId &&
              status !== "cancelled" &&
              status !== "rejected"
            );
          }),
        );
      } catch (err) {
        if (!cancelled) {
          setAlreadyBooked(false);

          const message = err instanceof Error ? err.message.toLowerCase() : "";

          if (!message.includes("log in")) {
            console.error("Failed to check bookings:", err);
          }
        }
      } finally {
        if (!cancelled) {
          setCheckingBooking(false);
        }
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
      const response = await apiFetch("/bookings", {
        method: "POST",
        body: JSON.stringify({
          destinationId: destination._id,
          departure: selectedDate,
        }),
      });

      if (response.status === 409) {
        setAlreadyBooked(true);
        toast.error("You have already booked this destination.");
        return;
      }

      const data = await readApiResponse(response);

      setAlreadyBooked(true);
      toast.success(data.message || "Booking saved successfully.");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unable to save your booking.";

      toast.error(message);

      if (message.toLowerCase().includes("log in")) {
        router.push("/login");
      }
    } finally {
      setBookingLoading(false);
    }
  };

  const handleUpdate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isAdmin) {
      toast.error("Admin permission is required.");
      return;
    }

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
    const rating = Number(formData.rating);

    if (formData.price.trim() === "" || !Number.isFinite(price) || price < 0) {
      toast.error("Please enter a valid price.");
      return;
    }

    if (
      formData.rating.trim() === "" ||
      !Number.isFinite(rating) ||
      rating < 1 ||
      rating > 5
    ) {
      toast.error("Rating must be between 1 and 5.");
      return;
    }

    if (formData.departureDate) {
      const date = new Date(`${formData.departureDate}T00:00:00.000Z`);

      if (
        Number.isNaN(date.getTime()) ||
        date.toISOString().slice(0, 10) !== formData.departureDate
      ) {
        toast.error("Please select a valid departure date.");
        return;
      }
    }

    const updatePayload = {
      destinationName: formData.destinationName.trim(),
      country: formData.country.trim(),
      category: formData.category.trim(),
      price,
      rating,
      duration: formData.duration.trim(),
      departureDate: formData.departureDate,
      imageUrl: formData.imageUrl.trim(),
      description: formData.description.trim(),
    };

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await apiFetch(
        `/destinations/${encodeURIComponent(id)}`,
        {
          method: "PATCH",
          body: JSON.stringify(updatePayload),
        },
      );

      const data = await readApiResponse(response);
      const apiDestination = (data.destination ?? data) as Partial<Destination>;

      const updatedDestination: Destination = {
        ...destination,
        ...apiDestination,
        ...updatePayload,
        _id: apiDestination._id ?? destination._id,
        createdAt: apiDestination.createdAt ?? destination.createdAt,
        updatedAt: apiDestination.updatedAt ?? new Date().toISOString(),
      };

      setDestination(updatedDestination);
      setFormData(createFormData(updatedDestination));
      setIsEditOpen(false);

      const oldDepartureDate = destination.departureDate
        ? String(destination.departureDate).slice(0, 10)
        : "";

      const newDate = updatedDestination.departureDate
        ? String(updatedDestination.departureDate).slice(0, 10)
        : "";

      if (selectedDate === oldDepartureDate) {
        setSelectedDate(newDate && newDate >= getTodayDate() ? newDate : "");
      }

      setSuccess("Destination updated successfully.");
      toast.success("Destination updated successfully.");
      router.refresh();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to update destination.";

      setError(message);
      toast.error(message);

      if (message.toLowerCase().includes("log in")) {
        router.push("/login");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!isAdmin) {
      toast.error("Admin permission is required.");
      return;
    }

    if (!destination || deleting || saving) return;

    setDeleting(true);
    setError("");

    try {
      const response = await apiFetch(
        `/destinations/${encodeURIComponent(id)}`,
        { method: "DELETE" },
      );

      await readApiResponse(response);

      setIsDeleteOpen(false);
      toast.success("Destination deleted successfully.");

      router.replace("/destinations");
      router.refresh();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to delete destination.";

      setError(message);
      toast.error(message);

      if (message.toLowerCase().includes("log in")) {
        router.push("/login");
      }
    } finally {
      setDeleting(false);
    }
  };

  if (loading || checkingAdmin) {
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
        <Toaster position="top-right" />

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
          style: { borderRadius: "10px", fontSize: "14px" },
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

          {isAdmin && (
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
                className="inline-flex items-center justify-center gap-1 rounded-md border border-gray-200 bg-white/95 px-2 py-2 text-[10px] font-medium text-gray-700 shadow-sm transition hover:bg-white disabled:opacity-60 sm:px-3 sm:text-xs"
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
                className="inline-flex items-center justify-center gap-1 rounded-md border border-gray-200 bg-white/95 px-2 py-2 text-[10px] font-medium text-red-600 shadow-sm transition hover:bg-white disabled:opacity-60 sm:px-3 sm:text-xs"
              >
                <Trash2 className="h-3 w-3 text-red-500" />
                Delete
              </button>
            </div>
          )}

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
              aria-label="Close error"
              className="shrink-0"
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
              aria-label="Close message"
              className="shrink-0"
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
                    {destination.rating ?? "Not rated"}
                  </span>
                  <span className="text-gray-400">(1234 reviews)</span>
                </div>

                <span className="hidden text-gray-300 sm:inline">•</span>

                <span className="break-words font-medium text-gray-700">
                  {destination.duration || "7 Days / 6 Nights"}
                </span>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                <div className="flex min-w-0 items-start gap-3 rounded-lg border border-gray-100 bg-gray-50 p-3">
                  <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-[#15A1BF]" />
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500">Created at</p>
                    <p className="mt-1 break-words text-sm font-medium text-gray-800">
                      {formatDateTime(destination.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="flex min-w-0 items-start gap-3 rounded-lg border border-gray-100 bg-gray-50 p-3">
                  <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-[#15A1BF]" />
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500">Last updated</p>
                    <p className="mt-1 break-words text-sm font-medium text-gray-800">
                      {formatDateTime(destination.updatedAt)}
                    </p>
                  </div>
                </div>
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
                    href="/bookings"
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

      {/* Edit destination dialog */}
      {isEditOpen && isAdmin && (
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
                  Update destination information and rating.
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
                  Rating (1–5)
                  <div className="relative mt-2">
                    <Star className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 fill-amber-400 text-amber-400" />
                    <input
                      required
                      type="number"
                      name="rating"
                      min="1"
                      max="5"
                      step="0.1"
                      value={formData.rating}
                      onChange={handleInputChange}
                      className="w-full min-w-0 rounded-lg border border-gray-300 py-2.5 pl-9 pr-3 outline-none focus:border-[#15A1BF] focus:ring-2 focus:ring-cyan-100"
                    />
                  </div>
                  <span className="mt-1 block text-xs font-normal text-gray-500">
                    Enter a rating between 1 and 5.
                  </span>
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
                    min={getTodayDate()}
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

      {/* Delete confirmation dialog */}
      {isDeleteOpen && isAdmin && (
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
