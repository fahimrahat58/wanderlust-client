"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  CalendarCheck,
  MapPin,
  RefreshCw,
  Plus,
  LayoutDashboard,
  Loader2,
  ShieldCheck,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

type UserInfo = {
  _id: string;
  name?: string;
  email?: string;
  role?: string;
  createdAt?: string;
};

type BookingInfo = {
  _id: string;
  bookingId?: string;
  userId?: string;
  email?: string;
  title?: string;
  destinationId?: string;
  departure?: string;
  price?: number | string;
  status?: string;
  createdAt?: string;
};

function formatDate(value?: string) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function statusStyle(status?: string) {
  const normalized = status?.toLowerCase();

  if (normalized === "confirmed") {
    return "bg-green-50 text-green-700";
  }

  if (normalized === "cancelled" || normalized === "canceled") {
    return "bg-red-50 text-red-700";
  }

  return "bg-amber-50 text-amber-700";
}

export default function AdminInfoClient() {
  const [users, setUsers] = useState<UserInfo[]>([]);
  const [bookings, setBookings] = useState<BookingInfo[]>([]);
  const [activeTab, setActiveTab] = useState<"users" | "bookings">("users");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [usersResponse, bookingsResponse] = await Promise.all([
        fetch(`${API_URL}/admin/users`, {
          credentials: "include",
          cache: "no-store",
        }),
        fetch(`${API_URL}/admin/bookings`, {
          credentials: "include",
          cache: "no-store",
        }),
      ]);

      if (
        usersResponse.status === 401 ||
        usersResponse.status === 403 ||
        bookingsResponse.status === 401 ||
        bookingsResponse.status === 403
      ) {
        throw new Error(
          "Admin access denied. Please sign in with the admin account.",
        );
      }

      if (!usersResponse.ok || !bookingsResponse.ok) {
        throw new Error("Information load kora jayni. Backend API check koro.");
      }

      const usersData = await usersResponse.json();
      const bookingsData = await bookingsResponse.json();

      setUsers(Array.isArray(usersData) ? usersData : (usersData.users ?? []));
      setBookings(
        Array.isArray(bookingsData)
          ? bookingsData
          : (bookingsData.bookings ?? []),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadData();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadData]);

  return (
    <main className="min-h-screen bg-[#f8f9fa] px-4 pb-8 pt-28 sm:px-6 sm:pt-32 lg:px-10 lg:pt-36">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-[#15A1BF]">
              <ShieldCheck size={17} />
              Admin Dashboard
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Manage Wanderlust
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              View registered users and manage destination bookings.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => void loadData()}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>

            <Link
              href="/adddestinations"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#15A1BF] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#1089a3]"
            >
              <Plus size={17} />
              Add Destination
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Total Users</p>
                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {loading ? "—" : users.length}
                </p>
              </div>
              <div className="rounded-xl bg-cyan-50 p-3 text-[#15A1BF]">
                <Users size={24} />
              </div>
            </div>
            <p className="mt-3 text-xs text-slate-400">Registered accounts</p>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Total Bookings</p>
                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {loading ? "—" : bookings.length}
                </p>
              </div>
              <div className="rounded-xl bg-cyan-50 p-3 text-[#15A1BF]">
                <CalendarCheck size={24} />
              </div>
            </div>
            <p className="mt-3 text-xs text-slate-400">All customer bookings</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setActiveTab("users")}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition ${activeTab === "users"
                ? "bg-[#15A1BF] text-white"
                : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
          >
            <Users size={17} />
            Users Information
          </button>

          <button
            onClick={() => setActiveTab("bookings")}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition ${activeTab === "bookings"
                ? "bg-[#15A1BF] text-white"
                : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
          >
            <CalendarCheck size={17} />
            Bookings Information
          </button>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <p>{error}</p>
            <p className="mt-1 text-xs">
              Check that the backend has both admin API routes and that
              credentials are enabled.
            </p>
          </div>
        )}

        <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
            <div className="flex items-center gap-3">
              {activeTab === "users" ? (
                <Users className="text-[#15A1BF]" size={21} />
              ) : (
                <CalendarCheck className="text-[#15A1BF]" size={21} />
              )}

              <div>
                <h2 className="font-bold text-slate-900">
                  {activeTab === "users"
                    ? "Users Information"
                    : "Bookings Information"}
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  {activeTab === "users"
                    ? `${users.length} registered users`
                    : `${bookings.length} total bookings`}
                </p>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex min-h-56 items-center justify-center gap-3 text-sm text-slate-500">
              <Loader2 className="animate-spin text-[#15A1BF]" size={22} />
              Loading information...
            </div>
          ) : activeTab === "users" ? (
            users.length === 0 ? (
              <div className="px-5 py-16 text-center text-sm text-slate-500">
                No users found.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[680px] text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-6 py-4 font-semibold">User</th>
                      <th className="px-6 py-4 font-semibold">Email</th>
                      <th className="px-6 py-4 font-semibold">Role</th>
                      <th className="px-6 py-4 font-semibold">Joined</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {users.map((user) => (
                      <tr key={user._id} className="hover:bg-slate-50/70">
                        <td className="px-6 py-4 font-medium text-slate-900">
                          {user.name || "Unnamed User"}
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                          {user.email || "—"}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${user.role === "admin"
                                ? "bg-cyan-50 text-cyan-700"
                                : "bg-slate-100 text-slate-600"
                              }`}
                          >
                            {user.role || "user"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-500">
                          {formatDate(user.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          ) : bookings.length === 0 ? (
            <div className="px-5 py-16 text-center text-sm text-slate-500">
              No bookings found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Booking ID</th>
                    <th className="px-6 py-4 font-semibold">Customer</th>
                    <th className="px-6 py-4 font-semibold">Destination</th>
                    <th className="px-6 py-4 font-semibold">Departure</th>
                    <th className="px-6 py-4 font-semibold">Price</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                    <th className="px-6 py-4 font-semibold">Booked On</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {bookings.map((booking) => (
                    <tr key={booking._id} className="hover:bg-slate-50/70">
                      <td className="px-6 py-4 font-medium text-slate-900">
                        {booking.bookingId || booking._id}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {booking.email || booking.userId || "—"}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-slate-700">
                          <MapPin
                            size={15}
                            className="shrink-0 text-[#15A1BF]"
                          />
                          {booking.title || booking.destinationId || "—"}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {formatDate(booking.departure)}
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-900">
                        ৳{Number(booking.price || 0).toLocaleString("en-BD")}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyle(
                            booking.status,
                          )}`}
                        >
                          {booking.status || "Pending"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-500">
                        {formatDate(booking.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/destinations"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
          >
            <MapPin size={16} />
            View Destinations
          </Link>

          <Link
            href="/bookings"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
          >
            <LayoutDashboard size={16} />
            Booking Management
          </Link>
        </div>
      </div>
    </main>
  );
}
