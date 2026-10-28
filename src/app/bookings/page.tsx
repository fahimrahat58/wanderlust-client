"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import {
  Calendar,
  MapPin,
  Eye,
  Trash2,
  CheckCircle,
  Clock,
  XCircle,
  Loader2,
  ArrowRight,
  X,
  AlertTriangle,
} from "lucide-react";

import { authClient } from "@/lib/auth-client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export type BookingStatus = "Confirmed" | "Pending" | "Cancelled";

export interface Booking {
  id: string;
  destinationId?: string;
  title: string;
  image: string;
  departure: string;
  bookingId: string;
  price: number;
  status: BookingStatus;
}

async function getJwtToken(): Promise<string> {
  const tokenResponse = await authClient.token();
  const token = tokenResponse.data?.token;

  if (tokenResponse.error || !token) {
    throw new Error("Your session has expired. Please log in again.");
  }

  return token;
}

async function authenticatedFetch(
  endpoint: string,
  options: RequestInit = {},
): Promise<Response> {
  const token = await getJwtToken();

  const headers = new Headers(options.headers);

  headers.set("Accept", "application/json");
  headers.set("Authorization", `Bearer ${token}`);

  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  return fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
    cache: "no-store",
  });
}

async function readApiResponse(response: Response) {
  const text = await response.text();

  let data: any;

  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    throw new Error("Invalid server response. Please try again.");
  }

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong.");
  }

  return data;
}

function formatDate(date: string) {
  if (!date) return "Date not available";

  const dateOnly = date.slice(0, 10);

  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateOnly)) {
    return "Date not available";
  }

  const parsedDate = new Date(`${dateOnly}T00:00:00.000Z`);

  if (
    Number.isNaN(parsedDate.getTime()) ||
    parsedDate.toISOString().slice(0, 10) !== dateOnly
  ) {
    return "Date not available";
  }

  return parsedDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

function normalizeBooking(item: any): Booking | null {
  if (!item || typeof item !== "object") return null;

  const id = String(item.id ?? item._id ?? "");

  if (!id || !item.title || !item.bookingId) return null;

  const validStatuses: BookingStatus[] = ["Confirmed", "Pending", "Cancelled"];

  const status: BookingStatus = validStatuses.includes(item.status)
    ? item.status
    : "Pending";

  return {
    id,
    destinationId: item.destinationId ? String(item.destinationId) : undefined,
    title: String(item.title),
    image: typeof item.image === "string" ? item.image : "",
    departure: typeof item.departure === "string" ? item.departure : "",
    bookingId: String(item.bookingId),
    price: Number.isFinite(Number(item.price)) ? Number(item.price) : 0,
    status,
  };
}

export default function BookingsPage() {
  const router = useRouter();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [bookingToCancel, setBookingToCancel] = useState<Booking | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const loadBookings = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await authenticatedFetch("/bookings", {
        method: "GET",
      });

      if (response.status === 401) {
        router.push("/sign-in");
        return;
      }

      const data = await readApiResponse(response);

      const rawBookings = Array.isArray(data)
        ? data
        : Array.isArray(data.bookings)
          ? data.bookings
          : [];

      const normalizedBookings = rawBookings
        .map(normalizeBooking)
        .filter((item: Booking | null): item is Booking => item !== null);

      setBookings(normalizedBookings);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unable to load your bookings.";

      setError(message);

      if (
        message.toLowerCase().includes("session has expired") ||
        message.toLowerCase().includes("please log in")
      ) {
        router.push("/sign-in");
      }
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void loadBookings();
  }, [loadBookings]);

  const handleCancel = (id: string) => {
    const booking = bookings.find((item) => item.id === id);

    if (!booking || booking.status === "Cancelled") return;

    setBookingToCancel(booking);
  };

  const confirmCancel = async () => {
    if (!bookingToCancel || isCancelling) return;

    const booking = bookingToCancel;

    setIsCancelling(true);

    try {
      const response = await authenticatedFetch(
        `/bookings/${encodeURIComponent(booking.id)}`,
        {
          method: "PATCH",
          body: JSON.stringify({ status: "Cancelled" }),
        },
      );

      if (response.status === 401) {
        router.push("/login");
        return;
      }

      const data = await readApiResponse(response);

      const updatedBooking: Booking = {
        ...booking,
        status: "Cancelled",
      };

      setBookings((previous) =>
        previous.map((item) =>
          item.id === booking.id ? updatedBooking : item,
        ),
      );

      setSelectedBooking((previous) =>
        previous?.id === booking.id ? updatedBooking : previous,
      );

      setBookingToCancel(null);

      toast.success(data.message || "Booking cancelled successfully!");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Unable to cancel this booking.",
      );
    } finally {
      setIsCancelling(false);
    }
  };

  const handleRemove = async (booking: Booking) => {
    if (booking.status !== "Cancelled" || removingId) return;

    setRemovingId(booking.id);

    try {
      const response = await authenticatedFetch(
        `/bookings/${encodeURIComponent(booking.id)}`,
        {
          method: "DELETE",
        },
      );

      if (response.status === 401) {
        router.push("/login");
        return;
      }

      const data = await readApiResponse(response);

      setBookings((previous) =>
        previous.filter((item) => item.id !== booking.id),
      );

      setSelectedBooking((previous) =>
        previous?.id === booking.id ? null : previous,
      );

      toast.success(data.message || "Booking removed successfully!");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Unable to remove this booking.",
      );
    } finally {
      setRemovingId(null);
    }
  };

  const handleView = (id: string) => {
    const booking = bookings.find((item) => item.id === id);

    if (booking) {
      setSelectedBooking(booking);
    }
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <Loader2 className="h-7 w-7 animate-spin text-cyan-600" />
        <span className="ml-3 text-sm text-gray-600">
          Loading your bookings...
        </span>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 pb-12 pt-28 sm:px-6 sm:pt-32 lg:px-8">
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

      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wider text-cyan-600">
            Your Travel Dashboard
          </p>

          <h1 className="mt-2 text-2xl font-bold text-gray-900 sm:text-3xl">
            My Bookings
          </h1>

          <p className="mt-2 text-sm text-gray-500 sm:text-base">
            Manage your trips and keep track of your reservations.
          </p>
        </div>

        {error && (
          <div
            role="alert"
            className="mb-5 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
            <p className="min-w-0 flex-1 break-words">{error}</p>

            <button
              type="button"
              onClick={() => setError("")}
              aria-label="Close error"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {bookings.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-5 py-12 text-center shadow-sm sm:py-16">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-cyan-50">
              <Calendar className="h-8 w-8 text-cyan-600" />
            </div>

            <h2 className="mt-5 text-xl font-bold text-gray-900">
              No Booking Available
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
              You haven&apos;t made any bookings yet. Explore destinations and
              book your next trip!
            </p>

            <button
              type="button"
              onClick={() => router.push("/destinations")}
              className="mt-6 inline-flex cursor-pointer! items-center justify-center gap-2 rounded-lg bg-cyan-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-700"
            >
              Explore Destinations
              <ArrowRight className="h-4 w-4" />
            </button>

            {error && (
              <button
                type="button"
                onClick={() => void loadBookings()}
                className="mx-auto mt-4 block text-sm font-medium text-cyan-700 underline"
              >
                Try again
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-gray-500">
                Total bookings:{" "}
                <span className="font-semibold text-gray-900">
                  {bookings.length}
                </span>
              </p>

              <p className="text-xs text-gray-400">
                {bookings.filter((item) => item.status !== "Cancelled").length}{" "}
                active
              </p>
            </div>

            <div className="space-y-5">
              {bookings.map((booking) => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  removing={removingId === booking.id}
                  onCancel={handleCancel}
                  onRemove={handleRemove}
                  onView={handleView}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {selectedBooking && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center overflow-y-auto bg-black/50 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedBooking(null);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="booking-dialog-title"
            className="my-auto max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-5 shadow-xl sm:p-7"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2
                  id="booking-dialog-title"
                  className="text-xl font-bold text-gray-900"
                >
                  Booking Details
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Your reservation information
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedBooking(null)}
                aria-label="Close booking details"
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {selectedBooking.image && (
              <div className="relative mt-5 h-48 overflow-hidden rounded-xl bg-gray-100">
                <Image
                  src={selectedBooking.image}
                  alt={selectedBooking.title}
                  fill
                  sizes="(max-width: 640px) 100vw, 448px"
                  className="object-cover"
                  unoptimized
                />
              </div>
            )}

            <h3 className="mt-5 break-words text-lg font-bold text-gray-900">
              {selectedBooking.title}
            </h3>

            <div className="mt-4 space-y-3 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 shrink-0 text-cyan-600" />
                <span>Departure: {formatDate(selectedBooking.departure)}</span>
              </div>

              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 shrink-0 text-cyan-600" />
                <span className="break-all">
                  Booking ID: {selectedBooking.bookingId}
                </span>
              </div>

              <p>
                Price:{" "}
                <span className="font-bold text-cyan-600">
                  ${selectedBooking.price.toLocaleString("en-US")}
                </span>
              </p>

              <p>
                Status:{" "}
                <span
                  className={
                    selectedBooking.status === "Cancelled"
                      ? "font-semibold text-red-600"
                      : "font-semibold text-gray-900"
                  }
                >
                  {selectedBooking.status}
                </span>
              </p>
            </div>

            <button
              type="button"
              onClick={() => setSelectedBooking(null)}
              className="mt-6 w-full rounded-lg bg-cyan-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-cyan-700"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <AlertDialog
        open={!!bookingToCancel}
        onOpenChange={(open) => {
          if (!open && !isCancelling) {
            setBookingToCancel(null);
          }
        }}
      >
        <AlertDialogContent className="w-[calc(100%-2rem)] rounded-xl sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Booking?</AlertDialogTitle>

            <AlertDialogDescription>
              Are you sure you want to cancel your booking for{" "}
              <span className="font-semibold text-gray-900">
                {bookingToCancel?.title}
              </span>
              ? You can remove it from your history later.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isCancelling}>
              Keep Booking
            </AlertDialogCancel>

            <AlertDialogAction
              disabled={isCancelling}
              onClick={(event) => {
                event.preventDefault();
                void confirmCancel();
              }}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {isCancelling ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cancelling...
                </>
              ) : (
                "Yes, Cancel Booking"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}

interface BookingCardProps {
  booking: Booking;
  removing: boolean;
  onCancel: (id: string) => void;
  onRemove: (booking: Booking) => void;
  onView: (id: string) => void;
}

function BookingCard({
  booking,
  removing,
  onCancel,
  onRemove,
  onView,
}: BookingCardProps) {
  const isConfirmed = booking.status === "Confirmed";
  const isPending = booking.status === "Pending";
  const isCancelled = booking.status === "Cancelled";

  return (
    <article className="flex flex-col gap-5 rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition-shadow hover:shadow-md sm:p-5 lg:flex-row lg:items-center lg:justify-between lg:gap-6">
      <div className="flex w-full min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:gap-5">
        <div className="relative h-48 w-full shrink-0 overflow-hidden rounded-lg bg-gray-100 sm:h-36 sm:w-48 md:w-56">
          {booking.image ? (
            <Image
              src={booking.image}
              alt={booking.title || "Destination"}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 192px, 224px"
              className="object-cover"
              unoptimized
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-gray-400">
              No image available
            </div>
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="mb-2">
            {isConfirmed && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-600">
                <CheckCircle className="h-3.5 w-3.5" />
                Confirmed
              </span>
            )}

            {isPending && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-100 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-600">
                <Clock className="h-3.5 w-3.5" />
                Pending
              </span>
            )}

            {isCancelled && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-100 bg-rose-50 px-3 py-1 text-xs font-medium text-rose-600">
                <XCircle className="h-3.5 w-3.5" />
                Cancelled
              </span>
            )}
          </div>

          <h2 className="break-words text-lg font-bold text-gray-900 sm:text-xl">
            {booking.title}
          </h2>

          <div className="mt-2 space-y-2 text-xs text-gray-500 sm:text-sm">
            <div className="flex items-start gap-2">
              <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
              <span>Departure: {formatDate(booking.departure)}</span>
            </div>

            <div className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
              <span className="break-all">Booking ID: {booking.bookingId}</span>
            </div>
          </div>

          <p className="mt-3 text-2xl font-bold text-cyan-600">
            ${booking.price.toLocaleString("en-US")}
          </p>
        </div>
      </div>

      <div className="flex w-full flex-wrap items-center justify-end gap-2 border-t border-gray-100 pt-4 sm:gap-3 lg:w-auto lg:shrink-0 lg:border-t-0 lg:pt-0">
        {isCancelled ? (
          <button
            type="button"
            disabled={removing}
            onClick={() => onRemove(booking)}
            className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 sm:px-4"
          >
            {removing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
            {removing ? "Removing..." : "Remove"}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onCancel(booking.id)}
            className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-lg border border-rose-200 px-3 py-2 text-sm font-medium text-rose-600 transition-colors hover:bg-rose-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2 sm:px-4"
          >
            <XCircle className="h-4 w-4" />
            Cancel
          </button>
        )}

        <button
          type="button"
          onClick={() => onView(booking.id)}
          className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-lg bg-cyan-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-cyan-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 sm:px-4"
        >
          <Eye className="h-4 w-4" />
          View
        </button>
      </div>
    </article>
  );
}
