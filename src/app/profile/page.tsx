"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import {
  UserRound,
  Mail,
  MapPin,
  CalendarDays,
  Plane,
  Ticket,
  Wallet,
  Globe,
  Loader2,
  Pencil,
  X,
  Save,
  CheckCircle2,
  Clock,
  CircleX,
  ArrowRight,
} from "lucide-react";
import { apiFetch } from "@/lib/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type Booking = {
  _id?: string;
  id?: string;
  bookingId?: string;
  destinationId?: string;
  destinationName?: string;
  title?: string;
  name?: string;
  image?: string;
  imageUrl?: string;
  departure?: string;
  departureDate?: string;
  price?: number | string;
  totalPrice?: number | string;
  status?: string;
  createdAt?: string;
};

type Destination = {
  _id?: string;
  id?: string;
  destinationName?: string;
  name?: string;
  country?: string;
};

type ProfileUser = {
  _id?: string;
  authUserId?: string;
  id?: string;
  name?: string;
  email?: string;
  profileImage?: string;
  image?: string;
  nationality?: string;
  createdAt?: string;
};

function extractArray<T>(data: unknown, keys: string[] = []): T[] {
  if (Array.isArray(data)) return data as T[];

  if (data && typeof data === "object") {
    const record = data as Record<string, unknown>;

    for (const key of keys) {
      if (Array.isArray(record[key])) {
        return record[key] as T[];
      }
    }
  }

  return [];
}

async function readResponse(response: Response) {
  const text = await response.text();

  if (!text) return {};

  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
}

function getBookingTitle(booking: Booking) {
  return (
    booking.title || booking.destinationName || booking.name || "Destination"
  );
}

function getBookingImage(booking: Booking) {
  return booking.image || booking.imageUrl || "/placeholder.jpg";
}

function getBookingPrice(booking: Booking) {
  const price = Number(booking.totalPrice ?? booking.price ?? 0);
  return Number.isFinite(price) ? price : 0;
}

function getBookingDate(booking: Booking) {
  return booking.departure || booking.departureDate || "";
}

function getBookingStatus(booking: Booking) {
  return String(booking.status || "Pending").toLowerCase();
}

function formatDate(date?: string) {
  if (!date) return "Not specified";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return date;

  return parsedDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(price);
}

export default function Profile() {
  const router = useRouter();

  const [user, setUser] = useState<ProfileUser | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    profileImage: "",
    nationality: "",
  });

  const loadProfile = useCallback(async () => {
    setLoading(true);

    try {
      const [userResponse, bookingsResponse, destinationsResponse] =
        await Promise.all([
          apiFetch("/users/me"),
          apiFetch("/bookings"),
          fetch(`${API_URL}/destinations`, {
            method: "GET",
            headers: { Accept: "application/json" },
            cache: "no-store",
          }),
        ]);

      if (userResponse.status === 401 || bookingsResponse.status === 401) {
        toast.error("Please log in to view your profile.");
        router.replace("/login");
        return;
      }

      if (userResponse.status === 403 || bookingsResponse.status === 403) {
        throw new Error(
          "You do not have permission to access this information.",
        );
      }

      const userData = await readResponse(userResponse);

      if (!userResponse.ok) {
        throw new Error(userData.message || "Failed to load profile.");
      }

      const profileUser: ProfileUser =
        userData?.user || userData?.data || userData;

      setUser(profileUser);

      setFormData({
        name: profileUser?.name || "",
        profileImage: profileUser?.profileImage || profileUser?.image || "",
        nationality: profileUser?.nationality || "",
      });

      if (bookingsResponse.ok) {
        const bookingsData = await readResponse(bookingsResponse);

        setBookings(
          extractArray<Booking>(bookingsData, ["bookings", "data", "results"]),
        );
      } else {
        setBookings([]);
        console.error(
          "Bookings API error:",
          bookingsResponse.status,
          await bookingsResponse.text(),
        );
      }

      if (destinationsResponse.ok) {
        const destinationsData = await readResponse(destinationsResponse);

        setDestinations(
          extractArray<Destination>(destinationsData, [
            "destinations",
            "data",
            "results",
          ]),
        );
      } else {
        setDestinations([]);
      }
    } catch (error) {
      console.error("Profile loading error:", error);

      const message =
        error instanceof Error ? error.message : "Failed to load profile.";

      if (message.toLowerCase().includes("log in")) {
        toast.error("Please log in to view your profile.");
        router.replace("/login");
        return;
      }

      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  const updateProfile = async () => {
    if (!formData.name.trim()) {
      toast.error("Name is required.");
      return;
    }

    setSaving(true);

    try {
      const response = await apiFetch("/users/me", {
        method: "PATCH",
        body: JSON.stringify({
          name: formData.name.trim(),
          profileImage: formData.profileImage.trim(),
          nationality: formData.nationality.trim(),
        }),
      });

      const data = await readResponse(response);

      if (response.status === 401) {
        toast.error("Your session has expired. Please log in again.");
        router.replace("/login");
        return;
      }

      if (!response.ok) {
        throw new Error(data.message || "Failed to update profile.");
      }

      const updatedUser: ProfileUser = data?.user || data?.data || data;

      setUser((previous) => ({
        ...previous,
        ...updatedUser,
        name: updatedUser.name ?? formData.name.trim(),
        profileImage: updatedUser.profileImage ?? formData.profileImage.trim(),
        nationality: updatedUser.nationality ?? formData.nationality.trim(),
      }));

      setFormData({
        name: updatedUser.name ?? formData.name.trim(),
        profileImage: updatedUser.profileImage ?? formData.profileImage.trim(),
        nationality: updatedUser.nationality ?? formData.nationality.trim(),
      });

      setEditing(false);
      toast.success("Profile updated successfully.");
    } catch (error) {
      console.error("Profile update error:", error);

      const message =
        error instanceof Error ? error.message : "Failed to update profile.";

      if (message.toLowerCase().includes("log in")) {
        toast.error("Please log in to update your profile.");
        router.replace("/login");
        return;
      }

      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const activeBookings = bookings.filter(
    (booking) => getBookingStatus(booking) !== "cancelled",
  );

  const confirmedBookings = bookings.filter(
    (booking) => getBookingStatus(booking) === "confirmed",
  );

  const totalSpend = confirmedBookings.reduce(
    (total, booking) => total + getBookingPrice(booking),
    0,
  );

  const upcomingTrips = bookings.filter((booking) => {
    const status = getBookingStatus(booking);
    const date = getBookingDate(booking);

    return (
      (status === "confirmed" || status === "pending") &&
      date &&
      new Date(date).getTime() >= Date.now()
    );
  });

  const countriesVisited = new Set(
    bookings
      .filter((booking) => {
        const date = getBookingDate(booking);

        return (
          getBookingStatus(booking) === "confirmed" &&
          date &&
          new Date(date).getTime() < Date.now()
        );
      })
      .map((booking) => {
        const destination = destinations.find((item) => {
          const destinationId = String(item._id || item.id || "");
          return destinationId === String(booking.destinationId || "");
        });

        return destination?.country;
      })
      .filter((country): country is string => Boolean(country)),
  ).size;

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-600" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-3 pb-8 pt-20 sm:px-5 sm:pt-24 md:px-6 md:pt-28 lg:px-8 lg:pt-32">
      <Toaster position="top-right" />

      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <p className="text-sm font-medium text-cyan-700">
            Wanderlust / My Account
          </p>

          <h1 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
            My Profile
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Manage your personal information and travel activity.
          </p>
        </div>

        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col items-center text-center">
              <div className="relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-cyan-100">
                {user?.profileImage || user?.image ? (
                  <Image
                    src={user.profileImage || user.image || ""}
                    alt={user.name || "Profile"}
                    fill
                    sizes="96px"
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <UserRound className="h-12 w-12 text-cyan-700" />
                )}
              </div>

              <h2 className="mt-4 text-xl font-semibold text-slate-900">
                {user?.name || "Traveler"}
              </h2>

              <p className="mt-1 break-all text-sm text-slate-500">
                {user?.email}
              </p>

              {user?.nationality && (
                <p className="mt-3 flex items-center gap-2 text-sm text-slate-600">
                  <MapPin className="h-4 w-4 text-cyan-600" />
                  {user.nationality}
                </p>
              )}

              <button
                type="button"
                onClick={() => setEditing(true)}
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-cyan-200 px-4 py-2.5 text-sm font-semibold text-cyan-700 transition hover:bg-cyan-50"
              >
                <Pencil className="h-4 w-4" />
                Edit Profile
              </button>
            </div>

            <div className="mt-6 border-t border-slate-100 pt-5">
              <div className="flex items-start gap-3">
                <CalendarDays className="mt-0.5 h-5 w-5 text-cyan-600" />

                <div>
                  <p className="text-sm font-medium text-slate-800">
                    Member since
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    {formatDate(user?.createdAt)}
                  </p>
                </div>
              </div>
            </div>
          </section>

          <div className="min-w-0 space-y-6">
            <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[
                {
                  label: "Total Bookings",
                  value: bookings.length,
                  icon: Ticket,
                },
                {
                  label: "Upcoming Trips",
                  value: upcomingTrips.length,
                  icon: Plane,
                },
                {
                  label: "Total Spent",
                  value: formatPrice(totalSpend),
                  icon: Wallet,
                },
                {
                  label: "Countries Visited",
                  value: countriesVisited,
                  icon: Globe,
                },
              ].map((stat) => {
                const Icon = stat.icon;

                return (
                  <div
                    key={stat.label}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm text-slate-500">{stat.label}</p>

                      <div className="rounded-xl bg-cyan-50 p-2">
                        <Icon className="h-5 w-5 text-cyan-700" />
                      </div>
                    </div>

                    <p className="mt-4 break-words text-2xl font-bold text-slate-900">
                      {stat.value}
                    </p>
                  </div>
                );
              })}
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    My Bookings
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Your travel reservations and booking status.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => router.push("/bookings")}
                  className="inline-flex items-center gap-2 self-start text-sm font-semibold text-cyan-700 hover:text-cyan-800"
                >
                  View all
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>

              {bookings.length === 0 ? (
                <div className="py-12 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
                    <Ticket className="h-7 w-7 text-slate-400" />
                  </div>

                  <h3 className="mt-4 font-semibold text-slate-800">
                    No bookings found
                  </h3>

                  <p className="mt-2 text-sm text-slate-500">
                    Your reservations will appear here after booking a trip.
                  </p>

                  <button
                    type="button"
                    onClick={() => router.push("/destinations")}
                    className="mt-5 rounded-xl bg-cyan-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-cyan-700"
                  >
                    Explore Destinations
                  </button>
                </div>
              ) : (
                <div className="mt-5 space-y-4">
                  {bookings.slice(0, 5).map((booking, index) => {
                    const id =
                      booking._id ||
                      booking.id ||
                      booking.bookingId ||
                      `booking-${index}`;

                    const status = getBookingStatus(booking);

                    const statusStyle =
                      status === "confirmed"
                        ? "bg-emerald-50 text-emerald-700"
                        : status === "cancelled"
                          ? "bg-red-50 text-red-700"
                          : "bg-amber-50 text-amber-700";

                    const StatusIcon =
                      status === "confirmed"
                        ? CheckCircle2
                        : status === "cancelled"
                          ? CircleX
                          : Clock;

                    return (
                      <article
                        key={id}
                        className="flex flex-col gap-4 rounded-xl border border-slate-100 p-4 transition hover:border-cyan-100 sm:flex-row sm:items-center"
                      >
                        <div className="relative h-36 w-full shrink-0 overflow-hidden rounded-lg bg-slate-100 sm:h-24 sm:w-32">
                          {getBookingImage(booking) !== "/placeholder.jpg" ? (
                            <Image
                              src={getBookingImage(booking)}
                              alt={getBookingTitle(booking)}
                              fill
                              sizes="(max-width: 640px) 100vw, 128px"
                              className="object-cover"
                              unoptimized
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center">
                              <Plane className="h-8 w-8 text-slate-400" />
                            </div>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <h3 className="truncate font-semibold text-slate-900">
                            {getBookingTitle(booking)}
                          </h3>

                          <p className="mt-2 text-sm text-slate-500">
                            Booking ID:{" "}
                            {booking.bookingId ||
                              booking._id ||
                              booking.id ||
                              "N/A"}
                          </p>

                          <p className="mt-1 text-sm text-slate-500">
                            Departure: {formatDate(getBookingDate(booking))}
                          </p>

                          <div className="mt-3 flex flex-wrap items-center gap-3">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${statusStyle}`}
                            >
                              <StatusIcon className="h-3.5 w-3.5" />
                              {status}
                            </span>

                            <span className="text-sm font-bold text-slate-900">
                              {formatPrice(getBookingPrice(booking))}
                            </span>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="text-lg font-bold text-slate-900">
                Account Information
              </h2>

              <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div className="flex items-start gap-3">
                  <UserRound className="mt-0.5 h-5 w-5 text-cyan-600" />

                  <div className="min-w-0">
                    <p className="text-sm text-slate-500">Full Name</p>
                    <p className="mt-1 break-words font-medium text-slate-800">
                      {user?.name || "Not provided"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="mt-0.5 h-5 w-5 text-cyan-600" />

                  <div className="min-w-0">
                    <p className="text-sm text-slate-500">Email Address</p>
                    <p className="mt-1 break-all font-medium text-slate-800">
                      {user?.email || "Not provided"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-5 w-5 text-cyan-600" />

                  <div>
                    <p className="text-sm text-slate-500">Nationality</p>
                    <p className="mt-1 font-medium text-slate-800">
                      {user?.nationality || "Not provided"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CalendarDays className="mt-0.5 h-5 w-5 text-cyan-600" />

                  <div>
                    <p className="text-sm text-slate-500">Joined</p>
                    <p className="mt-1 font-medium text-slate-800">
                      {formatDate(user?.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>

      {editing && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4"
          onClick={(event) => {
            if (event.target === event.currentTarget && !saving) {
              setEditing(false);
            }
          }}
        >
          <div className="my-auto w-full max-w-lg rounded-2xl bg-white p-5 shadow-xl sm:p-7">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Edit Profile
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Update your personal information.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setEditing(false)}
                disabled={saving}
                aria-label="Close edit profile"
                className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 disabled:opacity-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              className="mt-6 space-y-5"
              onSubmit={(event) => {
                event.preventDefault();
                void updateProfile();
              }}
            >
              <div>
                <label
                  htmlFor="profile-name"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Full Name
                </label>

                <input
                  id="profile-name"
                  type="text"
                  value={formData.name}
                  onChange={(event) =>
                    setFormData((previous) => ({
                      ...previous,
                      name: event.target.value,
                    }))
                  }
                  required
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                  placeholder="Enter your name"
                />
              </div>

              <div>
                <label
                  htmlFor="profile-image"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Profile Image URL
                </label>

                <input
                  id="profile-image"
                  type="url"
                  value={formData.profileImage}
                  onChange={(event) =>
                    setFormData((previous) => ({
                      ...previous,
                      profileImage: event.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div>
                <label
                  htmlFor="profile-nationality"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Nationality
                </label>

                <input
                  id="profile-nationality"
                  type="text"
                  value={formData.nationality}
                  onChange={(event) =>
                    setFormData((previous) => ({
                      ...previous,
                      nationality: event.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                  placeholder="Enter your nationality"
                />
              </div>

              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  disabled={saving}
                  className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}

                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
