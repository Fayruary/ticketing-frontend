import React from "react";
import { TrendingUp } from "lucide-react";
import EventCardTemplate, { EventCardData } from "./EventCardTemplate";

interface EventGridSectionProps {
  className?: string;
}

// 12 cards (3 rows x 4 columns) with the specified Indonesian placeholder text
const gridEvents: EventCardData[] = Array.from({ length: 12 }).map((_, index) => {
  const isFourthCol = (index + 1) % 4 === 0;
  return {
    id: `grid-event-${index + 1}`,
    title: "For Revenge",
    venueDate: isFourthCol
      ? "Pakansari 25 - 28 Agustus 2026"
      : "Jiexpo Kemayoran 25 - 28 Agustus 2026",
    priceRange: "Rp 300.000 - 600.000",
    organizer: "Pesta Bebas Berselancar",
    posterLabel: `Event Poster #${index + 1}`,
  };
});

export default function EventGridSection({ className = "" }: EventGridSectionProps) {
  return (
    <section className={`w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ${className}`}>
      {/* Section Header */}
      <div className="flex items-center gap-2 mb-6">
        <TrendingUp className="w-6 h-6 text-[#111d5e]" />
        <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
          Lagi Trending
        </h2>
      </div>

      {/* 3 rows x 4 columns Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {gridEvents.map((event) => (
          <EventCardTemplate
            key={event.id}
            event={event}
            imageAspectRatio="aspect-[16/10]"
          />
        ))}
      </div>

      {/* "Lihat Semua" Button */}
      <div className="mt-10 flex justify-center pb-8">
        <button
          type="button"
          className="px-8 py-2.5 rounded-full border border-gray-300 bg-white text-xs sm:text-sm font-bold text-gray-800 hover:bg-gray-50 hover:border-gray-400 active:scale-95 transition-all shadow-sm focus:outline-none"
        >
          Lihat Semua
        </button>
      </div>
    </section>
  );
}
