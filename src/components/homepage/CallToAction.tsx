import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function CallToAction() {
  const bgImage = "/CTA.png";

  return (
    <section className="relative flex w-full items-center justify-center overflow-hidden px-4 py-16 sm:px-6 sm:py-24 md:py-28 lg:py-36">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-500"
        style={{ backgroundImage: `url(${bgImage})` }}
      />

      {/* Dark Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/80 backdrop-brightness-75" />

      {/* Content Area */}
      <div className="relative z-10 mx-auto w-full max-w-4xl space-y-4 text-center">
        {/* Title */}
        <h2 className="break-words text-2xl font-serif font-normal leading-tight tracking-tight text-white sm:text-3xl md:text-4xl lg:text-5xl">
          Ready To Start Your Journey?
        </h2>

        {/* Subtitle */}
        <p className="mx-auto max-w-xl text-xs font-light leading-6 text-slate-300 sm:text-sm sm:leading-relaxed">
          Join thousands of travelers who have discovered the world with us
        </p>

        {/* CTA Button */}
        <div className="flex justify-center pt-3 sm:pt-4">
          <Link href="/destinations">
            <Button className="h-auto min-h-12 w-full max-w-xs cursor-pointer gap-2 rounded-none bg-white px-4 py-4 text-[10px] font-semibold uppercase tracking-wider text-slate-900 shadow-lg transition-all duration-200 hover:bg-slate-100 sm:w-auto sm:max-w-none sm:gap-3 sm:px-8 sm:py-6 sm:text-xs">
              <span>BOOK YOUR TRIP TODAY</span>
              <ArrowRight className="h-4 w-4 shrink-0 text-slate-800" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
