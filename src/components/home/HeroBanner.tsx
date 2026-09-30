"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { getBanners, type Banner } from "@/services/bannerService";

interface HeroBannerProps {
  className?: string;
}

const FALLBACK_SLIDES = [
  {
    id: "f1",
    title: "TixGoo – Let's Enjoy The Show!",
    subtitle: "Temukan ribuan konser, festival, dan event seru di seluruh Indonesia.",
    image_url: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1400&q=80",
    link_url: "/",
  },
  {
    id: "f2",
    title: "Tiket Konser Favoritmu",
    subtitle: "Beli tiket online dengan aman, instan, dan dapatkan E-Ticket QR Code.",
    image_url: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1400&q=80",
    link_url: "/",
  },
  {
    id: "f3",
    title: "Festival Musik Terbesar 2026",
    subtitle: "Jangan lewatkan event-event spektakuler yang sudah menunggu kamu!",
    image_url: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=1400&q=80",
    link_url: "/",
  },
];

export default function HeroBanner({ className = "" }: HeroBannerProps) {
  const [slides, setSlides] = useState<any[]>(FALLBACK_SLIDES);
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const res: any = await getBanners();
        const bannerList: Banner[] = Array.isArray(res) ? res : res?.data || [];
        if (bannerList.length > 0) {
          setSlides(
            bannerList.map((b) => ({
              id: b.id,
              title: b.title || "TixGoo Event",
              subtitle: b.description || "Temukan event favoritmu",
              image_url: b.image_url,
              link_url: b.link_url || "/",
            }))
          );
        }
      } catch {
        // use fallback
      }
    };
    fetchBanners();
  }, []);

  const totalSlides = slides.length;

  const handlePrev = useCallback(() => {
    setActiveSlide((prev) => (prev === 0 ? totalSlides - 1 : prev - 1));
  }, [totalSlides]);

  const handleNext = useCallback(() => {
    setActiveSlide((prev) => (prev === totalSlides - 1 ? 0 : prev + 1));
  }, [totalSlides]);

  // Auto-slide every 5 seconds
  useEffect(() => {
    const timer = setInterval(handleNext, 5000);
    return () => clearInterval(timer);
  }, [handleNext]);

  const currentSlide = slides[activeSlide];

  return (
    <section className={`relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-8 ${className}`}>
      {/* Carousel Container */}
      <div className="relative group rounded-3xl overflow-hidden shadow-xl">
        {/* Slide Image */}
        <div className="relative h-[220px] sm:h-[340px] md:h-[420px] lg:h-[480px] w-full overflow-hidden">
          <img
            key={currentSlide.id}
            src={currentSlide.image_url}
            alt={currentSlide.title}
            className="w-full h-full object-cover transition-all duration-700"
            onError={(e: any) => {
              e.target.src = "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1400&q=80";
            }}
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

          {/* Content */}
          <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10 lg:p-14">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/90 text-amber-900 text-[10px] font-extrabold uppercase tracking-widest mb-3">
              <Sparkles className="w-3 h-3" />
              TixGoo • Let&apos;s Enjoy The Show
            </div>
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight drop-shadow-lg max-w-2xl">
              {currentSlide.title}
            </h1>
            <p className="mt-2 text-sm sm:text-base text-white/80 max-w-xl leading-relaxed hidden sm:block">
              {currentSlide.subtitle}
            </p>
            <Link
              href={currentSlide.link_url || "/"}
              className="mt-4 sm:mt-6 inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold bg-[#111d5e] text-white hover:bg-[#0c1543] transition-all shadow-lg"
            >
              Jelajah Event
            </Link>
          </div>
        </div>

        {/* Carousel Navigation Arrows */}
        <button
          onClick={handlePrev}
          aria-label="Previous Slide"
          className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-white/80 hover:bg-white text-gray-700 shadow-md border border-gray-200 flex items-center justify-center transition-all focus:outline-none opacity-0 group-hover:opacity-100"
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
        <button
          onClick={handleNext}
          aria-label="Next Slide"
          className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-white/80 hover:bg-white text-gray-700 shadow-md border border-gray-200 flex items-center justify-center transition-all focus:outline-none opacity-0 group-hover:opacity-100"
        >
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
      </div>

      {/* Carousel Dots Indicator */}
      <div className="flex justify-center items-center gap-2 mt-4">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setActiveSlide(idx)}
            aria-label={`Go to slide ${idx + 1}`}
            className={`transition-all duration-300 rounded-full ${
              activeSlide === idx
                ? "w-6 h-2.5 bg-[#111d5e]"
                : "w-2 h-2 bg-gray-300 hover:bg-gray-400"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
