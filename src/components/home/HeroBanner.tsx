"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import PlaceholderBox from "@/components/ui/PlaceholderBox";

interface HeroBannerProps {
  className?: string;
}

export default function HeroBanner({ className = "" }: HeroBannerProps) {
  const [activeSlide, setActiveSlide] = useState(0);
  const totalSlides = 7;

  const handlePrev = () => {
    setActiveSlide((prev) => (prev === 0 ? totalSlides - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveSlide((prev) => (prev === totalSlides - 1 ? 0 : prev + 1));
  };

  return (
    <section className={`relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-8 ${className}`}>
      {/* Carousel Container */}
      <div className="relative group">
        {/* Main Banner Box with Neutral Placeholder Styling */}
        <PlaceholderBox
          height="h-[220px] sm:h-[340px] md:h-[420px] lg:h-[460px]"
          width="w-full"
          className="rounded-3xl border-2 border-dashed border-neutral-300 bg-neutral-100 relative overflow-hidden shadow-inner"
          showIcon={false}
        >
          {/* Subtle Corner Badges indicating swap area */}
          <div className="absolute top-4 left-4 z-10 px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-[11px] font-medium text-white tracking-wide">
            Hero Banner Template Area
          </div>
          <div className="absolute top-4 right-4 z-10 px-3 py-1 bg-neutral-200/80 border border-neutral-300 rounded-full text-[10px] font-semibold text-neutral-600">
            Ratio ~ 16:6 • 1280 x 480px
          </div>

          {/* Left Decorative Illustration Placeholder */}
          <div className="absolute left-6 md:left-12 top-1/2 -translate-y-1/2 hidden sm:flex flex-col items-center justify-center w-28 md:w-36 h-40 md:h-52 rounded-2xl bg-neutral-200/90 border border-neutral-300 p-2 text-center shadow-sm">
            <div className="w-10 h-10 rounded-full bg-neutral-300 flex items-center justify-center text-neutral-500 mb-2">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-neutral-600 uppercase">Illustration</span>
            <span className="text-[9px] text-neutral-400 mt-1">Left Graphic Slot</span>
          </div>

          {/* Center Title Content */}
          <div className="relative z-10 flex flex-col items-center justify-center text-center px-6 py-8">
            {/* Circus tent icon / badge placeholder */}
            <div className="w-12 h-10 md:w-16 md:h-12 bg-neutral-300 rounded-t-full border border-neutral-400 mb-2 flex items-center justify-center shadow-sm">
              <div className="w-2 h-2 rounded-full bg-red-400"></div>
            </div>

            {/* Main Title */}
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-[#0f6b92] tracking-tighter drop-shadow-sm uppercase font-sans">
              FUNHOUSE
            </h1>

            {/* Subtitle */}
            <p className="mt-1 text-lg sm:text-2xl md:text-3xl font-bold italic text-[#1389aa] tracking-tight">
              limited edition
            </p>

            <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 border border-neutral-300 text-neutral-500 text-xs shadow-sm">
              <span>Main Hero Carousel Content</span>
            </div>
          </div>

          {/* Right Decorative Illustration Placeholder */}
          <div className="absolute right-6 md:right-12 top-1/2 -translate-y-1/2 hidden sm:flex flex-col items-center justify-center w-28 md:w-36 h-40 md:h-52 rounded-2xl bg-neutral-200/90 border border-neutral-300 p-2 text-center shadow-sm">
            <div className="w-10 h-10 rounded-full bg-neutral-300 flex items-center justify-center text-neutral-500 mb-2">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-neutral-600 uppercase">Illustration</span>
            <span className="text-[9px] text-neutral-400 mt-1">Right Graphic Slot</span>
          </div>
        </PlaceholderBox>

        {/* Carousel Navigation Arrows */}
        <button
          onClick={handlePrev}
          aria-label="Previous Slide"
          className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-white/80 hover:bg-white text-gray-700 shadow-md border border-gray-200 flex items-center justify-center transition-all focus:outline-none"
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
        <button
          onClick={handleNext}
          aria-label="Next Slide"
          className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-white/80 hover:bg-white text-gray-700 shadow-md border border-gray-200 flex items-center justify-center transition-all focus:outline-none"
        >
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
      </div>

      {/* Carousel Dots Indicator */}
      <div className="flex justify-center items-center gap-2 mt-4">
        {Array.from({ length: totalSlides }).map((_, idx) => (
          <button
            key={idx}
            onClick={() => setActiveSlide(idx)}
            aria-label={`Go to slide ${idx + 1}`}
            className={`transition-all duration-300 rounded-full ${
              activeSlide === idx
                ? "w-2.5 h-2.5 bg-[#111d5e]"
                : "w-2 h-2 bg-gray-300 hover:bg-gray-400"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
