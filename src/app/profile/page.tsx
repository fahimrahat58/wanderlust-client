"use client";

import { useCallback, useEffect, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import {
  Camera,
  MapPin,
  Pencil,
  Plane,
  Globe,
  TrendingUp,
  DollarSign,
  X,
  Save,
  Image as ImageIcon,
  Loader2,
  CalendarDays,
  UserRound,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const DEFAULT_IMAGE = "https://placehold.co/250x250?text=Profile";

type ProfileData = {
  name?: string;
  email?: string;
  profileImage?: string;
  nationality?: string;
  createdAt?: string | Date;
};

type Booking = {
  _id?: string;
  bookingId?: string;
  destinationId?: string;
  price?: number;
  status?: string;
  departure?: string;
};

type Destination = {
  _id?: string;
  country?: string;
};

type StatCardProps = {
  label: string;
  value: string;
  icon: ReactNode;
  iconClass: string;
};

export default function Profile() {
  const [profile, setProfile] = useState<ProfileData>({});
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [destinations, setDestinations] = useState<Destination[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [nameInput, setNameInput] = useState("");
  const [imageInput, setImageInput] = useState("");
  const [nationalityInput, setNationalityInput] = useState("");

  const [today, setToday] = useState<number | null>(null);

  useEffect(() => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    setToday(date.getTime());
  }, []);

  const loadProfile = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const [profileResponse, bookingsResponse, destinationsResponse] =
        await Promise.all([
          fetch(`${API_URL}/users/me`, {
            credentials: "include",
            cache: "no-store",
          }),
          fetch(`${API_URL}/bookings`, {
            credentials: "include",
            cache: "no-store",
          }),
          fetch(`${API_URL}/destinations`, {
            cache: "no-store",
          }),
        ]);

      const profileData = await profileResponse.json();

      if (!profileResponse.ok) {
        throw new Error(profileData.message || "Failed to load your profile.");
      }

      const savedProfile: ProfileData = profileData.user ?? profileData;

      setProfile(savedProfile);
      setNameInput(savedProfile.name || "");
      setImageInput(savedProfile.profileImage || "");
      setNationalityInput(savedProfile.nationality || "");

      if (bookingsResponse.ok) {
        const bookingsData = await bookingsResponse.json();

        setBookings(
          Array.isArray(bookingsData.bookings) ? bookingsData.bookings : [],
        );
      } else {
        setBookings([]);
      }

      if (destinationsResponse.ok) {
        const destinationsData = await destinationsResponse.json();

        setDestinations(
          Array.isArray(destinationsData)
            ? destinationsData
            : Array.isArray(destinationsData.destinations)
              ? destinationsData.destinations
              : [],
        );
      } else {
        setDestinations([]);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load your profile.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  const openEditDialog = () => {
    // প্রতিবার saved data থেকে form পূরণ হবে।
    setNameInput(profile.name || "");
    setImageInput(profile.profileImage || "");
    setNationalityInput(profile.nationality || "");
    setError("");
    setSuccess("");
    setIsDialogOpen(true);
  };

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const updatedFields: Record<string, string> = {};

    const originalName = profile.name || "";
    const originalImage = profile.profileImage || "";
    const originalNationality = profile.nationality || "";

    if (nameInput.trim() !== originalName) {
      if (!nameInput.trim()) {
        setError("Please enter your full name.");
        return;
      }

      updatedFields.name = nameInput.trim();
    }

    if (imageInput.trim() !== originalImage) {
      updatedFields.profileImage = imageInput.trim();
    }

    if (nationalityInput.trim() !== originalNationality) {
      updatedFields.nationality = nationalityInput.trim();
    }

    // কোনো field পরিবর্তন না হলে request পাঠানোর প্রয়োজন নেই।
    if (Object.keys(updatedFields).length === 0) {
      setIsDialogOpen(false);
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch(`${API_URL}/users/me`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedFields),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update your profile.");
      }

      const updatedProfile: ProfileData = data.user ?? data;

      // API response-এ কোনো field না থাকলে আগের data রাখা হবে।
      const mergedProfile: ProfileData = {
        ...profile,
        ...updatedProfile,
        ...updatedFields,
      };

      setProfile(mergedProfile);
      setNameInput(mergedProfile.name || "");
      setImageInput(mergedProfile.profileImage || "");
      setNationalityInput(mergedProfile.nationality || "");

      setIsDialogOpen(false);
      setSuccess("Profile updated successfully.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update your profile.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const activeBookings = bookings.filter(
    (booking) => booking.status?.toLowerCase() !== "cancelled",
  );

  const confirmedBookings = bookings.filter(
    (booking) => booking.status?.toLowerCase() === "confirmed",
  );

  const totalSpend = confirmedBookings.reduce(
    (total, booking) => total + (Number(booking.price) || 0),
    0,
  );

  const upcomingTrips =
    today === null
      ? 0
      : activeBookings.filter((booking) => {
          if (!booking.departure) return false;

          const departureDate = Date.parse(`${booking.departure}T00:00:00`);

          return (
            !Number.isNaN(departureDate) &&
            departureDate >= today &&
            ["pending", "confirmed"].includes(
              booking.status?.toLowerCase() || "",
            )
          );
        }).length;

  const destinationById = new Map(
    destinations.map((destination) => [
      String(destination._id || ""),
      destination,
    ]),
  );

  const countriesVisited =
    today === null
      ? 0
      : new Set(
          confirmedBookings
            .filter((booking) => {
              if (!booking.departure) return false;

              const departureDate = Date.parse(`${booking.departure}T00:00:00`);

              return !Number.isNaN(departureDate) && departureDate < today;
            })
            .map((booking) =>
              destinationById
                .get(String(booking.destinationId || ""))
                ?.country?.trim()
                .toLowerCase(),
            )
            .filter((country): country is string => Boolean(country)),
        ).size;

  const memberSince = profile.createdAt
    ? new Date(profile.createdAt).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      })
    : "Recently";

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f8f9fa] px-4">
        <div className="flex items-center gap-3 text-[#179BAE]">
          <Loader2 size={24} className="animate-spin" />
          <span className="text-sm font-medium">Loading your profile...</span>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f8f9fa] px-3 pb-8 pt-28 sm:px-6 sm:pb-10 sm:pt-32 lg:px-10 lg:pt-36">
      <div className="mx-auto max-w-5xl font-sans text-gray-800">
        <header className="mb-6 sm:mb-8">
          <h1 className="font-serif text-2xl font-bold text-gray-900 sm:text-3xl">
            My Profile
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-gray-500 sm:text-base">
            Manage your account settings and travel preferences.
          </p>
        </header>

        {error && !isDialogOpen && (
          <div
            role="alert"
            className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            <span>{error}</span>
            <button
              type="button"
              onClick={() => void loadProfile()}
              className="font-semibold underline"
            >
              Retry
            </button>
          </div>
        )}

        {success && (
          <div
            role="status"
            className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700"
          >
            {success}
          </div>
        )}

        <div className="grid grid-cols-1 items-start gap-5 sm:gap-6 md:grid-cols-3 lg:gap-8">
          <section className="flex min-w-0 flex-col items-center rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6">
            <div className="relative mb-4">
              <img
                src={profile.profileImage || DEFAULT_IMAGE}
                alt="Profile"
                onError={(event) => {
                  event.currentTarget.onerror = null;
                  event.currentTarget.src = DEFAULT_IMAGE;
                }}
                className="h-24 w-24 rounded-full border-2 border-white object-cover shadow-md sm:h-32 sm:w-32"
              />

              <button
                type="button"
                onClick={openEditDialog}
                aria-label="Edit profile image"
                className="absolute bottom-1 right-1 rounded-full border-2 border-white bg-[#149B9E] p-2 text-white shadow transition hover:bg-[#0f7a7c]"
              >
                <Camera size={15} />
              </button>
            </div>

            <h2 className="break-words text-center text-xl font-bold text-gray-900">
              {profile.name || "Wanderlust Traveler"}
            </h2>

            {profile.email && (
              <p className="mt-1 max-w-full break-all text-center text-xs text-gray-500">
                {profile.email}
              </p>
            )}

            <div className="mb-6 mt-3 flex items-center text-xs text-gray-400">
              <MapPin size={14} className="mr-1 shrink-0" />
              <span>{profile.nationality || "Nationality not specified"}</span>
            </div>

            <div className="mb-6 w-full space-y-4 border-t border-gray-100 pt-5">
              <div className="flex items-center justify-between gap-3 text-xs">
                <span className="text-gray-400">Member Since</span>
                <span className="text-right font-semibold text-gray-800">
                  {memberSince}
                </span>
              </div>

              <div className="flex items-start justify-between gap-3 text-xs">
                <span className="text-gray-400">Nationality</span>
                <span className="max-w-[60%] break-words text-right font-semibold text-gray-800">
                  {profile.nationality || "Not specified"}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={openEditDialog}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#179BAE] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#127d8d]"
            >
              <Pencil size={15} />
              Edit Profile
            </button>
          </section>

          <section className="min-w-0 md:col-span-2">
            <h2 className="mb-4 font-serif text-lg font-bold text-gray-900 sm:mb-6 sm:text-xl">
              Travel Statistics
            </h2>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <StatCard
                label="Total Bookings"
                value={String(activeBookings.length)}
                icon={<Plane size={21} />}
                iconClass="bg-cyan-50 text-cyan-500"
              />

              <StatCard
                label="Countries Visited"
                value={String(countriesVisited)}
                icon={<Globe size={21} />}
                iconClass="bg-emerald-50 text-emerald-500"
              />

              <StatCard
                label="Upcoming Trips"
                value={String(upcomingTrips)}
                icon={<TrendingUp size={21} />}
                iconClass="bg-orange-50 text-orange-400"
              />

              <StatCard
                label="Total Spend"
                value={`$${totalSpend.toLocaleString("en-US")}`}
                icon={<DollarSign size={21} />}
                iconClass="bg-fuchsia-50 text-fuchsia-400"
              />
            </div>

            <div className="mt-6 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cyan-50 text-[#179BAE]">
                  <CalendarDays size={20} />
                </div>

                <div className="min-w-0">
                  <h3 className="font-semibold text-gray-900">
                    Your Travel Journey
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    You have {upcomingTrips} upcoming{" "}
                    {upcomingTrips === 1 ? "trip" : "trips"}.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      {isDialogOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/50 px-3 py-4 backdrop-blur-sm sm:px-4 sm:py-6"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !isSaving) {
              setIsDialogOpen(false);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-profile-title"
            className="my-auto max-h-[calc(100dvh-2rem)] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-4 shadow-2xl sm:max-h-[calc(100dvh-3rem)] sm:p-8"
          >
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h2
                  id="edit-profile-title"
                  className="text-xl font-bold text-gray-900"
                >
                  Edit Profile
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Update your name, profile photo and nationality.
                </p>
              </div>

              <button
                type="button"
                disabled={isSaving}
                onClick={() => setIsDialogOpen(false)}
                aria-label="Close dialog"
                className="shrink-0 rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 sm:space-y-5">
              <div className="flex flex-col items-center">
                <img
                  src={imageInput.trim() || DEFAULT_IMAGE}
                  alt="Profile preview"
                  onError={(event) => {
                    event.currentTarget.onerror = null;
                    event.currentTarget.src = DEFAULT_IMAGE;
                  }}
                  className="h-20 w-20 rounded-full border border-gray-200 object-cover sm:h-24 sm:w-24"
                />
                <span className="mt-3 text-xs text-gray-500">
                  Profile photo preview
                </span>
              </div>

              <div>
                <label
                  htmlFor="profile-name"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Full Name
                </label>

                <div className="relative">
                  <UserRound
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    id="profile-name"
                    type="text"
                    value={nameInput}
                    onChange={(event) => setNameInput(event.target.value)}
                    placeholder="Enter your full name"
                    maxLength={100}
                    required
                    disabled={isSaving}
                    className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-[#179BAE] focus:ring-2 focus:ring-[#179BAE]/15 disabled:bg-gray-50"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="profile-image"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Profile Image URL
                </label>

                <div className="relative">
                  <ImageIcon
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    id="profile-image"
                    type="url"
                    value={imageInput}
                    onChange={(event) => setImageInput(event.target.value)}
                    placeholder="https://example.com/image.jpg"
                    maxLength={2048}
                    disabled={isSaving}
                    className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-[#179BAE] focus:ring-2 focus:ring-[#179BAE]/15 disabled:bg-gray-50"
                  />
                </div>

                <p className="mt-2 text-xs text-gray-400">
                  Enter a publicly accessible image URL.
                </p>
              </div>

              <div>
                <label
                  htmlFor="nationality"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Nationality
                </label>

                <div className="relative">
                  <Globe
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    id="nationality"
                    type="text"
                    value={nationalityInput}
                    onChange={(event) =>
                      setNationalityInput(event.target.value)
                    }
                    placeholder="e.g. Bangladesh"
                    maxLength={80}
                    disabled={isSaving}
                    className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-[#179BAE] focus:ring-2 focus:ring-[#179BAE]/15 disabled:bg-gray-50"
                  />
                </div>
              </div>

              {error && (
                <p role="alert" className="break-words text-sm text-red-600">
                  {error}
                </p>
              )}

              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => setIsDialogOpen(false)}
                  className="w-full rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 disabled:opacity-50 sm:w-auto"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#179BAE] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#127d8d] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                >
                  {isSaving ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Save size={16} />
                  )}
                  {isSaving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

function StatCard({ label, value, icon, iconClass }: StatCardProps) {
  return (
    <div className="flex min-w-0 items-center justify-between gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
      <div className="min-w-0">
        <p className="text-xs font-medium text-gray-400">{label}</p>
        <p className="mt-2 break-words text-xl font-bold text-gray-900 sm:text-2xl">
          {value}
        </p>
      </div>

      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${iconClass}`}
      >
        {icon}
      </div>
    </div>
  );
}
