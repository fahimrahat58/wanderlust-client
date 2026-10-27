"use client";

import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Loader2,
  ArrowLeft,
  X,
  Plus,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const API_URL = "http://localhost:5000";

type FormData = {
  destinationName: string;
  country: string;
  category: string;
  price: string;
  duration: string;
  departureDate: string;
  imageUrl: string;
  description: string;
};

type ApiResponse = {
  message?: string;
  destination?: { _id?: string };
  package?: { _id?: string };
};

export default function AddDestinationClient() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState<FormData>({
    destinationName: "",
    country: "",
    category: "Beach",
    price: "",
    duration: "",
    departureDate: "",
    imageUrl: "",
    description: "",
  });

  const handleChange = (
    e: ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (error) setError("");
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (loading) return;

    const destinationName = formData.destinationName.trim();
    const country = formData.country.trim();
    const duration = formData.duration.trim();
    const description = formData.description.trim();
    const imageUrl = formData.imageUrl.trim();
    const price = Number(formData.price);

    if (!destinationName || !country || !duration || !description) {
      setError("Please fill in all required fields.");
      return;
    }

    if (
      formData.price.trim() === "" ||
      !Number.isFinite(price) ||
      price < 0
    ) {
      setError("Please enter a valid non-negative price.");
      return;
    }

    if (
      imageUrl &&
      !/^https?:\/\/\S+$/i.test(imageUrl)
    ) {
      setError("Please enter a valid image URL.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const payload = {
        destinationName,
        country,
        category: formData.category,
        price,
        duration,
        departureDate: formData.departureDate,
        imageUrl,
        description,
      };

      const response = await fetch(`${API_URL}/adddestinations`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      const responseText = await response.text();

      let data: ApiResponse;

      try {
        data = responseText ? JSON.parse(responseText) : {};
      } catch {
        throw new Error(
          `Invalid response from server (${response.status}). Please check your backend.`,
        );
      }

      if (!response.ok) {
        throw new Error(
          data.message ||
            (response.status === 401
              ? "Please sign in to your admin account."
              : response.status === 403
                ? "Only the admin can add destinations."
                : `Failed to create destination (${response.status}).`),
        );
      }

      setFormData({
        destinationName: "",
        country: "",
        category: "Beach",
        price: "",
        duration: "",
        departureDate: "",
        imageUrl: "",
        description: "",
      });

      router.push("/destinations");
      router.refresh();
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen overflow-x-hidden bg-white px-3 pb-10 pt-20 text-slate-800 sm:px-6 sm:pb-16 sm:pt-28 lg:px-8">
      <div className="mx-auto w-full max-w-4xl min-w-0">
        <div className="mb-5 sm:mb-6">
          <Link
            href="/destinations"
            className="inline-flex max-w-full items-center gap-2 text-xs font-medium text-slate-500 transition hover:text-slate-900 sm:text-sm"
          >
            <ArrowLeft className="h-4 w-4 shrink-0" />
            Back to Destinations
          </Link>
        </div>

        <div className="min-w-0 border border-slate-200 bg-white p-4 shadow-sm sm:p-6 md:p-8 lg:p-10">
          <h1 className="mb-6 break-words font-serif text-xl font-normal text-slate-900 sm:mb-8 sm:text-2xl md:text-3xl">
            Add New Travel Package
          </h1>

          {error && (
            <div
              role="alert"
              className="mb-6 flex min-w-0 items-start gap-2 border border-rose-200 bg-rose-50 p-3 text-xs text-rose-600 sm:text-sm"
            >
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />

              <p className="min-w-0 flex-1 break-words">{error}</p>

              <button
                type="button"
                onClick={() => setError("")}
                aria-label="Dismiss error"
                className="shrink-0"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 md:gap-6">
              <div className="min-w-0 space-y-1.5">
                <label
                  htmlFor="destinationName"
                  className="block text-xs font-medium text-slate-600"
                >
                  Destination Name
                </label>

                <input
                  id="destinationName"
                  type="text"
                  name="destinationName"
                  value={formData.destinationName}
                  onChange={handleChange}
                  placeholder="Bali Paradise"
                  required
                  maxLength={150}
                  disabled={loading}
                  className="w-full min-w-0 border border-slate-200 px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-[#15A1BF] disabled:bg-slate-50"
                />
              </div>

              <div className="min-w-0 space-y-1.5">
                <label
                  htmlFor="category"
                  className="block text-xs font-medium text-slate-600"
                >
                  Category
                </label>

                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-full min-w-0 border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-[#15A1BF] disabled:bg-slate-50"
                >
                  <option value="Beach">Beach</option>
                  <option value="Mountain">Mountain</option>
                  <option value="City">City</option>
                  <option value="Desert">Desert</option>
                  <option value="Historical">Historical</option>
                </select>
              </div>

              <div className="min-w-0 space-y-1.5">
                <label
                  htmlFor="country"
                  className="block text-xs font-medium text-slate-600"
                >
                  Country
                </label>

                <input
                  id="country"
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  placeholder="Indonesia"
                  required
                  maxLength={100}
                  disabled={loading}
                  className="w-full min-w-0 border border-slate-200 px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-[#15A1BF] disabled:bg-slate-50"
                />
              </div>

              <div className="min-w-0 space-y-1.5">
                <label
                  htmlFor="duration"
                  className="block text-xs font-medium text-slate-600"
                >
                  Duration
                </label>

                <input
                  id="duration"
                  type="text"
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  placeholder="7 Days / 6 Nights"
                  required
                  maxLength={100}
                  disabled={loading}
                  className="w-full min-w-0 border border-slate-200 px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-[#15A1BF] disabled:bg-slate-50"
                />
              </div>

              <div className="min-w-0 space-y-1.5">
                <label
                  htmlFor="price"
                  className="block text-xs font-medium text-slate-600"
                >
                  Price (USD)
                </label>

                <input
                  id="price"
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="1299"
                  required
                  min="0"
                  step="any"
                  disabled={loading}
                  className="w-full min-w-0 border border-slate-200 px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-[#15A1BF] disabled:bg-slate-50"
                />
              </div>

              <div className="min-w-0 space-y-1.5">
                <label
                  htmlFor="departureDate"
                  className="block text-xs font-medium text-slate-600"
                >
                  Departure Date
                </label>

                <input
                  id="departureDate"
                  type="date"
                  name="departureDate"
                  value={formData.departureDate}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-full min-w-0 max-w-full appearance-none border border-slate-200 px-2 py-2.5 text-sm text-slate-800 outline-none transition focus:border-[#15A1BF] disabled:bg-slate-50 sm:px-3"
                />
              </div>
            </div>

            <div className="min-w-0 space-y-1.5">
              <label
                htmlFor="imageUrl"
                className="block text-xs font-medium text-slate-600"
              >
                Image URL
              </label>

              <input
                id="imageUrl"
                type="url"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleChange}
                placeholder="https://example.com/image.jpg"
                disabled={loading}
                className="w-full min-w-0 border border-slate-200 px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-[#15A1BF] disabled:bg-slate-50"
              />
            </div>

            <div className="min-w-0 space-y-1.5">
              <label
                htmlFor="description"
                className="block text-xs font-medium text-slate-600"
              >
                Description
              </label>

              <textarea
                id="description"
                name="description"
                rows={4}
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe the travel experience..."
                required
                maxLength={5000}
                disabled={loading}
                className="w-full min-w-0 resize-y border border-slate-200 px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-[#15A1BF] disabled:bg-slate-50"
              />
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-end">
              <Button
                type="button"
                variant="outline"
                disabled={loading}
                onClick={() => router.push("/destinations")}
                className="w-full gap-2 rounded-none border-rose-300 bg-white px-5 py-2.5 text-sm font-medium text-rose-600 transition hover:border-rose-500 hover:bg-rose-50 hover:text-rose-700 sm:w-auto"
              >
                <X className="h-4 w-4 shrink-0" />
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={loading}
                className="w-full gap-2 rounded-none bg-[#15A1BF] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#11869F] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
                    Adding Package...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 shrink-0" />
                    Add Travel Package
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}