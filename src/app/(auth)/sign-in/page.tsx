"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { signIn } from "@/lib/auth-client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, Loader2 } from "lucide-react";

const SignIn = () => {
  const router = useRouter();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { error: signInError } = await signIn.email({
        email: formData.email,
        password: formData.password,
        rememberMe: formData.rememberMe,
      });

      if (signInError) {
        setError(signInError.message || "Invalid email or password.");
        return;
      }

      router.push("/");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setLoading(true);

    try {
      await signIn.social({
        provider: "google",
        callbackURL: `${window.location.origin}/`,
        errorCallbackURL: `${window.location.origin}/sign-in`,
      });
    } catch {
      setError("Unable to sign in with Google. Please try again.");
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F8FAFC] px-4 pb-10 pt-28 font-sans sm:px-6 sm:pb-12 sm:pt-32">
      <div className="mx-auto flex w-full max-w-md flex-col items-center">
        <div className="mb-7 text-center sm:mb-8">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-800 sm:text-4xl">
            Welcome Back
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Resume your adventure with Wanderlust
          </p>
        </div>

        <div className="w-full rounded-xl border border-slate-100 bg-white p-5 shadow-sm sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-700"
              >
                Email Address
              </label>

              <div className="relative">
                <Mail
                  size={17}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  required
                  className="w-full rounded-lg border border-slate-200 bg-[#F8FAFC] py-3 pl-10 pr-4 text-sm text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-[#149BBC] focus:bg-white focus:ring-2 focus:ring-[#149BBC]/15"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-700"
              >
                Password
              </label>

              <div className="relative">
                <Lock
                  size={17}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  required
                  className="w-full rounded-lg border border-slate-200 bg-[#F8FAFC] py-3 pl-10 pr-4 text-sm text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-[#149BBC] focus:bg-white focus:ring-2 focus:ring-[#149BBC]/15"
                />
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 pt-1 text-xs">
              <label className="flex cursor-pointer select-none items-center gap-2 text-slate-600">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-slate-300 accent-[#149BBC] focus:ring-[#149BBC]"
                />
                Remember me
              </label>

              <Link
                href="/forgot-password"
                className="font-medium text-[#149BBC] hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            {error && (
              <p
                role="alert"
                className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-600"
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex w-full cursor-pointer! items-center justify-center gap-2 rounded-lg bg-[#149BBC] py-3 text-sm font-medium text-white shadow-sm transition-colors duration-200 hover:bg-[#10839F] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Signing In...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-200" />
            <span className="text-xs text-slate-400">Or continue with</span>
            <div className="h-px flex-1 bg-slate-200" />
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="flex w-full items-center cursor-pointer! justify-center gap-2.5 rounded-lg border border-slate-200 bg-white py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            Continue with Google
          </button>

          <p className="mt-6 text-center text-xs text-slate-500">
            Don&apos;t have an account?{" "}
            <Link
              href="/sign-up"
              className="font-semibold text-[#149BBC] hover:underline"
            >
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
};

export default SignIn;
