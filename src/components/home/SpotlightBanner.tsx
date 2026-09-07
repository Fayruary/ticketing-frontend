import React from "react";
import PlaceholderBox from "@/components/ui/PlaceholderBox";

interface SpotlightBannerProps {
  className?: string;
}

export default function SpotlightBanner({ className = "" }: SpotlightBannerProps) {
  return (
    <section className={`w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 ${className}`}>
      {/* Container with background placeholder & structured promo elements */}
      <PlaceholderBox
        className="rounded-2xl border border-neutral-300 bg-gradient-to-r from-neutral-200 via-neutral-100 to-neutral-200 p-4 sm:p-6 lg:p-8 min-h-[120px] shadow-sm relative overflow-hidden"
        showIcon={false}
      >
        {/* Swappable Banner Background Area Indicator */}
        <div className="absolute top-2 right-3 px-2 py-0.5 bg-neutral-300/80 rounded text-[9px] font-medium text-neutral-600">
          Banner Promo Background Slot (Swap with graphic banner)
        </div>

        {/* Content Layout */}
        <div className="w-full flex flex-col lg:flex-row items-center justify-between gap-4 z-10">
          {/* Left Title Area */}
          <div className="flex items-center gap-3 shrink-0">
            {/* "Baru!" badge */}
            <div className="px-3 py-1 bg-emerald-500 text-white font-black text-xs rounded-full shadow-sm rotate-[-4deg]">
              Baru!
            </div>
            <div>
              <span className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-800 tracking-tight italic">
                LOKÉT{" "}
                <span className="text-orange-500">SPOTLIGHT</span>
              </span>
            </div>
          </div>

          {/* Middle Callout & Packages */}
          <div className="flex flex-wrap items-center justify-center gap-2 lg:gap-3 text-center">
            {/* Orange Tag */}
            <div className="bg-orange-500 text-white text-[11px] sm:text-xs font-bold px-3 py-1.5 rounded-xl shadow-sm max-w-[200px] sm:max-w-xs leading-tight">
              BUAT EVENT KAMU LEBIH DIKENAL DENGAN PROMOSI YANG LEBIH MAKSIMAL
            </div>

            {/* Packages */}
            <div className="flex flex-col items-center">
              <span className="text-[10px] font-bold text-slate-600 mb-1 tracking-wider uppercase">
                3 PAKET PILIHAN!
              </span>
              <div className="flex items-center gap-1.5">
                <span className="px-2.5 py-1 bg-emerald-600 text-white text-[10px] font-extrabold rounded-md shadow-sm">
                  SPOTLIGHT
                </span>
                <span className="px-2.5 py-1 bg-green-500 text-white text-[10px] font-extrabold rounded-md shadow-sm">
                  CELEBRATE
                </span>
                <span className="px-2.5 py-1 bg-teal-600 text-white text-[10px] font-extrabold rounded-md shadow-sm">
                  PASTIBISA
                </span>
              </div>
            </div>
          </div>

          {/* Right Custom Services Badge */}
          <div className="shrink-0 bg-slate-700/90 text-white p-2.5 rounded-xl max-w-[220px] text-center shadow-sm">
            <p className="text-[10px] font-medium leading-tight">
              Makin lengkap dengan <strong className="font-bold text-amber-300">Layanan Custom</strong>: Mulai dari Social Media, Newsletter, hingga Digital Ads!
            </p>
          </div>
        </div>
      </PlaceholderBox>
    </section>
  );
}
