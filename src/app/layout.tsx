import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";
import Navbar from "@/components/homepage/Navbar";
import Footer from "@/components/homepage/Footer";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
});

export const metadata: Metadata = {
  title: "Wanderlast - Discover Your Next Adventure",
  description: "Curated travel experiences and bookings.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${dmSans.className} h-full antialiased`}>
      <body className="relative flex min-h-full flex-col font-sans">
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              borderRadius: "10px",
              padding: "12px 16px",
              fontSize: "14px",
            },
            success: {
              duration: 3000,
            },
            error: {
              duration: 4000,
            },
          }}
        />

        <div className="absolute left-1/2 top-0 z-50 w-full max-w-[1250px] -translate-x-1/2 pt-10 sm:pt-2">
          <Navbar />
        </div>

        {children}

        <Footer />
      </body>
    </html>
  );
}
