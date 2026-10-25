import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
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
      <body className="min-h-full flex flex-col relative font-sans">
        <div className="absolute top-0 left-1/2 w-full max-w-[1250px] z-50 pt-10 sm:pt-2 -translate-x-1/2">
          <Navbar />
        </div>

        {children}
        <Footer />
      </body>
    </html>
  );
}
