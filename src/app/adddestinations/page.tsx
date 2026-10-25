"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, ArrowLeft, X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AddDestinationClient() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
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
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/adddestinations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create travel package");
      }

      router.push("/destinations");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
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
            <div className="mb-6 break-words border border-rose-200 bg-rose-50 p-3 text-xs text-rose-600 sm:text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 md:gap-6">
              <div className="min-w-0 space-y-1.5">
                <label className="block text-xs font-medium text-slate-600">
                  Destination Name
                </label>
                <input
                  type="text"
                  name="destinationName"
                  value={formData.destinationName}
                  onChange={handleChange}
                  placeholder="Bali Paradise"
                  required
                  className="w-full min-w-0 border border-slate-200 px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-[#15A1BF]"
                />
              </div>

              <div className="min-w-0 space-y-1.5">
                <label className="block text-xs font-medium text-slate-600">
                  Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full min-w-0 border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-[#15A1BF]"
                >
                  <option value="Beach">Beach</option>
                  <option value="Mountain">Mountain</option>
                  <option value="City">City</option>
                  <option value="Desert">Desert</option>
                  <option value="Historical">Historical</option>
                </select>
              </div>

              <div className="min-w-0 space-y-1.5">
                <label className="block text-xs font-medium text-slate-600">
                  Country
                </label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  placeholder="Indonesia"
                  required
                  className="w-full min-w-0 border border-slate-200 px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-[#15A1BF]"
                />
              </div>

              <div className="min-w-0 space-y-1.5">
                <label className="block text-xs font-medium text-slate-600">
                  Duration
                </label>
                <input
                  type="text"
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  placeholder="7 Days / 6 Nights"
                  className="w-full min-w-0 border border-slate-200 px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-[#15A1BF]"
                />
              </div>

              <div className="min-w-0 space-y-1.5">
                <label className="block text-xs font-medium text-slate-600">
                  Price (USD)
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="1299"
                  required
                  min="0"
                  className="w-full min-w-0 border border-slate-200 px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-[#15A1BF]"
                />
              </div>

              <div className="min-w-0 space-y-1.5">
                <label className="block text-xs font-medium text-slate-600">
                  Departure Date
                </label>
                <input
                  type="date"
                  name="departureDate"
                  value={formData.departureDate}
                  onChange={handleChange}
                  className="w-full min-w-0 max-w-full appearance-none border border-slate-200 px-2 py-2.5 text-sm text-slate-800 outline-none transition focus:border-[#15A1BF] sm:px-3"
                />
              </div>
            </div>

            <div className="min-w-0 space-y-1.5">
              <label className="block text-xs font-medium text-slate-600">
                Image URL
              </label>
              <input
                type="url"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleChange}
                placeholder="https://example.com/image.jpg"
                className="w-full min-w-0 border border-slate-200 px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-[#15A1BF]"
              />
            </div>

            <div className="min-w-0 space-y-1.5">
              <label className="block text-xs font-medium text-slate-600">
                Description
              </label>
              <textarea
                name="description"
                rows={4}
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe the travel experience..."
                className="w-full min-w-0 resize-y border border-slate-200 px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-[#15A1BF]"
              />
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-end">
              <Button
                type="button"
                variant="outline"
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
                  <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4 shrink-0" />
                )}
                {loading ? "Adding Package..." : "Add Travel Package"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
