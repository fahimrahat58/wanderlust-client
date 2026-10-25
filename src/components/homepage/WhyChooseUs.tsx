import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ShieldCheck, Map, Headphones } from "lucide-react";

export default function WhyChooseUs() {
  const features = [
    {
      icon: <ShieldCheck className="h-6 w-6 text-[#15A1BF]" />,
      title: "Safe & Secure",
      description:
        "Your safety is our priority with comprehensive travel insurance and 24/7 support.",
    },
    {
      icon: <Map className="h-6 w-6 text-[#15A1BF]" />,
      title: "Expert Guides",
      description:
        "Local experts who bring destinations to life with authentic cultural insights.",
    },
    {
      icon: <Headphones className="h-6 w-6 text-[#15A1BF]" />,
      title: "24/7 Support",
      description:
        "Round-the-clock customer service to assist you wherever your journey takes you.",
    },
  ];

  return (
    <section className="w-full overflow-hidden bg-[#F0F9FF] px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
      <div className="mx-auto w-full max-w-6xl">
        {/* Section Header */}
        <div className="mb-8 text-center sm:mb-10 lg:mb-12">
          <h2 className="break-words font-serif text-3xl font-normal tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
            Why Choose Wanderlust
          </h2>

          <p className="mx-auto mt-3 max-w-md text-xs font-normal leading-5 text-slate-400 sm:text-sm">
            Your trusted partner for exceptional travel experiences
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6">
          {features.map((item, index) => (
            <Card
              key={index}
              className="min-w-0 rounded-none border-0 bg-white p-5 shadow-none sm:p-6 lg:p-8"
            >
              <CardContent className="space-y-4 p-0 sm:space-y-5">
                {/* Icon */}
                <div className="flex h-10 w-10 items-center justify-start">
                  {item.icon}
                </div>

                {/* Title */}
                <h3 className="break-words font-serif text-lg font-normal text-slate-900 sm:text-xl">
                  {item.title}
                </h3>

                {/* Description */}
                <p className="break-words text-xs font-normal leading-relaxed text-slate-400 sm:text-sm">
                  {item.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
