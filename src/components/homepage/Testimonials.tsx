"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, ArrowRight } from "lucide-react";

export default function Testimonials() {
  const testimonials = [
    {
      id: 1,
      quote:
        '"The Bali Trip Was Absolutely Magical! Every Detail Was Perfectly Planned. The Resorts Were Luxurious And The Cultural Experiences Were Unforgettable."',
      name: "Michael Chen",
      location: "Singapore",
      image:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=500&auto=format&fit=crop",
    },
    {
      id: 2,
      quote:
        '"Swiss Alps Adventure Exceeded All Expectations. The Mountain Views Were Breathtaking And Our Guide Was Incredibly Knowledgeable. Highly Recommend!"',
      name: "Sarah Johnson",
      location: "New York, USA",
      image:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=500&auto=format&fit=crop",
    },
    {
      id: 3,
      quote:
        '"Kyoto Blossom Tour Was A Dream Come True. Exceptional Hospitality, Breathtaking Scenery, And Seamless Transportation Throughout The Entire Journey."',
      name: "David Kim",
      location: "Seoul, South Korea",
      image:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=500&auto=format&fit=crop",
    },
    {
      id: 4,
      quote:
        '"Exploring Santorini With Wanderlust Was Flawless. The Hotel Recommendations And Sunset Cruises Were Packed With Unmatched Beauty And Value."',
      name: "Elena Rostova",
      location: "Athens, Greece",
      image:
        "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=500&auto=format&fit=crop",
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const itemsPerPage = 2;

  const totalPages = Math.ceil(testimonials.length / itemsPerPage);

  const handlePrev = () => {
    setCurrentIndex((prev) => Math.max(prev - itemsPerPage, 0));
  };

  const handleNext = () => {
    setCurrentIndex((prev) =>
      Math.min(prev + itemsPerPage, (totalPages - 1) * itemsPerPage),
    );
  };

  const visibleTestimonials = testimonials.slice(
    currentIndex,
    currentIndex + itemsPerPage,
  );

  return (
    <section className="w-full overflow-hidden bg-white px-4 py-12 text-slate-800 sm:px-6 sm:py-16 lg:px-8">
      <div className="mx-auto w-full max-w-6xl">
        {/* Header Section */}
        <div className="mb-8 flex flex-col gap-5 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <h2 className="break-words font-serif text-3xl font-normal tracking-tight text-slate-900 sm:text-4xl md:text-5xl">
              What Travelers Say
            </h2>
            <p className="mt-2 text-xs font-normal leading-5 text-slate-400 sm:text-sm">
              Real experiences from our happy travelers
            </p>
          </div>

          {/* Carousel Control Buttons */}
          <div className="flex shrink-0 items-center gap-3">
            <button
              type="button"
              onClick={handlePrev}
              disabled={currentIndex === 0}
              aria-label="Previous testimonials"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-400 transition-all hover:border-slate-400 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-30 sm:h-11 sm:w-11"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={handleNext}
              disabled={currentIndex + itemsPerPage >= testimonials.length}
              aria-label="Next testimonials"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-400 transition-all hover:border-slate-400 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-30 sm:h-11 sm:w-11"
            >
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Testimonials Cards Grid */}
        <div className="grid grid-cols-1 gap-5 sm:gap-6 md:grid-cols-2 lg:gap-8">
          {visibleTestimonials.map((item) => (
            <Card
              key={item.id}
              className="min-w-0 overflow-hidden rounded-none border border-slate-100 bg-[#FAFAFA]/50 p-4 shadow-xs sm:p-6 lg:p-8"
            >
              <CardContent className="flex min-w-0 flex-col justify-between gap-5 p-0 sm:gap-6 lg:flex-row lg:items-stretch">
                {/* Left Side: Quote, Name & Location */}
                <div className="flex min-w-0 flex-1 flex-col justify-between gap-6">
                  <p className="break-words font-serif text-sm font-medium leading-relaxed text-slate-800 sm:text-base sm:leading-snug">
                    {item.quote}
                  </p>

                  <div className="space-y-1">
                    <p className="flex items-center gap-1 text-xs font-medium text-[#15A1BF]">
                      <span className="inline-block h-px w-2.5 shrink-0 bg-[#15A1BF]" />
                      {item.name}
                    </p>
                    <p className="break-words pl-3.5 text-[10px] font-normal text-slate-400 sm:text-xs">
                      {item.location}
                    </p>
                  </div>
                </div>

                {/* Right Side: Profile Image */}
                <div className="h-52 w-full shrink-0 overflow-hidden sm:h-60 lg:h-auto lg:min-h-52 lg:w-36 xl:w-44">
                  <img
                    src={item.image}
                    alt={item.name}
                    loading="lazy"
                    className="h-full w-full object-cover object-center"
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}