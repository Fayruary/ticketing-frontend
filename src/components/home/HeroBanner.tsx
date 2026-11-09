"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { getActiveBanners, resolveBannerImageUrl } from "@/services/bannerService";

interface HeroBannerProps {
  className?: string;
}

// Link dari dashboard admin, mis. "/events/konser-sheila-on-7". Kalau lupa diawali "/", ditambahkan otomatis.
const normalizeLink = (url?: string) => {
  const v = (url || "").trim();
  if (!v) return "";
  return /^(https?:\/\/|\/|#)/.test(v) ? v : `/${v}`;
};

const FALLBACK_IMG =
  "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1400&q=80";

const FALLBACK_SLIDES = [
  {
    id: "f1",
    title: "TixGoo – Let's Enjoy The Show!",
    subtitle: "Temukan ribuan konser, festival, dan event seru di seluruh Indonesia.",
    image_url: FALLBACK_IMG,
    link_url: "/events",
  },
  {
    id: "f2",
    title: "Tiket Konser Favoritmu",
    subtitle: "Beli tiket online dengan aman, instan, dan dapatkan E-Ticket QR Code.",
    image_url: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1400&q=80",
    link_url: "/events",
  },
  {
    id: "f3",
    title: "Festival Musik Terbesar 2026",
    subtitle: "Jangan lewatkan event-event spektakuler yang sudah menunggu kamu!",
    image_url: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=1400&q=80",
    link_url: "/events",
  },
];

export default function HeroBanner({ className = "" }: HeroBannerProps) {
  const [slides, setSlides] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSlide, setActiveSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const bannerList = await getActiveBanners();
        if (!isMounted) return;
        if (Array.isArray(bannerList) && bannerList.length > 0) {
          setSlides(
            bannerList.map((b) => ({
              id: b.id,
              title: b.title || "TixGoo Event",
              subtitle: b.description || "Temukan event seru dan pesan tiketmu sekarang!",
              image_url: resolveBannerImageUrl(b.image || b.image_url),
              link_url: normalizeLink(b.link_url || (b as any).link || (b as any).url),
            }))
          );
          setActiveSlide(0);
        } else {
          // Belum ada banner aktif: pakai slide bawaan
          setSlides(FALLBACK_SLIDES);
        }
      } catch (err) {
        console.error("Gagal mengambil banner aktif:", err);
        if (isMounted) setSlides(FALLBACK_SLIDES);
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  const totalSlides = slides.length;

  const handlePrev = useCallback(() => {
    setActiveSlide((prev) => (prev === 0 ? totalSlides - 1 : prev - 1));
  }, [totalSlides]);

  const handleNext = useCallback(() => {
    setActiveSlide((prev) => (prev === totalSlides - 1 ? 0 : prev + 1));
  }, [totalSlides]);

  // Auto-slide tiap 5 detik, berhenti saat kursor di atas banner
  useEffect(() => {
    if (totalSlides <= 1 || isPaused) return;
    const timer = setInterval(handleNext, 5000);
    return () => clearInterval(timer);
  }, [handleNext, totalSlides, isPaused]);

  // Selama banner dari server belum selesai dimuat, tampilkan placeholder (bukan banner dummy)
  if (loading) {
    return (
      <section className={`w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-6 ${className}`}>
        <div
          className="relative h-[240px] sm:h-[360px] md:h-[420px] lg:h-[460px] w-full rounded-2xl overflow-hidden bg-gray-200 animate-pulse"
          role="status"
          aria-label="Memuat banner"
        >
          <div className="absolute inset-x-0 bottom-0 p-5 sm:p-10 lg:p-12 space-y-3">
            <div className="h-7 sm:h-10 w-3/4 sm:w-1/2 rounded-lg bg-gray-300" />
            <div className="hidden sm:block h-4 w-1/3 rounded bg-gray-300" />
            <div className="h-11 w-40 rounded-full bg-gray-300" />
          </div>
        </div>
      </section>
    );
  }

  const current = slides[activeSlide] || slides[0];

  const navBtn =
    "w-9 h-9 rounded-full bg-white/15 hover:bg-white/30 text-white backdrop-blur-md border border-white/20 flex items-center justify-center transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70";

  return (
    <section className={`w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-6 ${className}`}>
      <div
        className="relative rounded-2xl overflow-hidden bg-gray-900 shadow-[0_8px_30px_rgba(17,29,94,0.18)]"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div className="relative h-[240px] sm:h-[360px] md:h-[420px] lg:h-[460px] w-full">
          {/* Semua gambar ditumpuk, yang aktif muncul dengan fade */}
          {slides.map((slide, idx) => (
            <img
              key={slide.id}
              src={slide.image_url}
              alt={idx === activeSlide ? slide.title : ""}
              aria-hidden={idx !== activeSlide}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
                idx === activeSlide ? "opacity-100" : "opacity-0"
              }`}
              onError={(e: any) => {
                e.target.src = FALLBACK_IMG;
              }}
            />
          ))}

          {/* Overlay: gelap di bawah dan kiri agar teks terbaca */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0c1543]/60 via-transparent to-transparent hidden sm:block" />

          <div className="absolute inset-x-0 bottom-0 p-5 sm:p-10 lg:p-12 pr-5 sm:pr-40">
            <div key={current.id} className="animate-[heroIn_500ms_ease-out]">
              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-white leading-[1.15] tracking-tight max-w-3xl line-clamp-2">
                {current.title}
              </h1>
              <p className="hidden sm:block mt-3 text-base text-white/80 max-w-xl leading-relaxed line-clamp-2">
                {current.subtitle}
              </p>
            </div>

            {/* Tombol hanya tampil kalau banner punya link tujuan (diisi di dashboard admin) */}
            {current.link_url && (
              <Link
                href={current.link_url}
                {...(/^https?:\/\//.test(current.link_url) ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                className="group mt-4 sm:mt-6 inline-flex items-center gap-3 pl-6 pr-1.5 py-1.5 rounded-full bg-white text-[#111d5e] text-sm font-semibold shadow-[0_4px_16px_rgba(0,0,0,0.25)] hover:bg-blue-50 active:scale-[0.98] transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-black/40"
              >
                Jelajahi event
                <span className="w-8 h-8 rounded-full bg-[#111d5e] text-white flex items-center justify-center transition-colors group-hover:bg-[#0c1543]">
                  <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                </span>
              </Link>
            )}
          </div>

          {/* Kontrol slide */}
          {totalSlides > 1 && (
            <div className="absolute right-4 bottom-5 sm:right-8 sm:bottom-10 flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-1.5">
                {slides.map((slide, idx) => (
                  <button
                    key={slide.id}
                    onClick={() => setActiveSlide(idx)}
                    aria-label={`Ke slide ${idx + 1}`}
                    aria-current={activeSlide === idx}
                    className={`h-1 rounded-full transition-all duration-300 ${
                      activeSlide === idx ? "w-7 bg-white" : "w-3 bg-white/40 hover:bg-white/70"
                    }`}
                  />
                ))}
              </div>
              <button onClick={handlePrev} aria-label="Slide sebelumnya" className={navBtn}>
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={handleNext} aria-label="Slide berikutnya" className={navBtn}>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes heroIn {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          div {
            animation: none !important;
          }
        }
      `}</style>
    </section>
  );
}