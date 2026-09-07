import React from "react";
import { TrendingUp } from "lucide-react";
import EventCardTemplate, { EventCardData } from "./EventCardTemplate";

interface TrendingRowProps {
  className?: string;
}

const trendingEvents: EventCardData[] = [
  {
    id: "trending-1",
    title: "Sheila On 7",
    venueDate: "Jiexpo Kemayoran 25 - 28 Agustus 2026",
    priceRange: "Rp 300.000 - 600.000",
    organizer: "Pesta Bebas Berselancar",
    posterLabel: "Poster Sheila On 7",
  },
  {
    id: "trending-2",
    title: "Hindia",
    venueDate: "Jiexpo Kemayoran 25 - 28 Agustus 2026",
    priceRange: "Rp 300.000 - 600.000",
    organizer: "Pesta Bebas Berselancar",
    posterLabel: "Poster Hindia",
  },
  {
    id: "trending-3",
    title: "For Revenge",
    venueDate: "Jiexpo Kemayoran 25 - 28 Agustus 2026",
    priceRange: "Rp 300.000 - 600.000",
    organizer: "Pesta Bebas Berselancar",
    posterLabel: "Poster For Revenge",
  },
];

export default function TrendingRow({ className = "" }: TrendingRowProps) {
  return (
    <section className={`w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 ${className}`}>
      {/* Section Header */}
      <div className="flex items-center gap-2 mb-6">
        <TrendingUp className="w-6 h-6 text-[#111d5e]" />
        <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
          Lagi Trending
        </h2>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {trendingEvents.map((event) => (
          <EventCardTemplate
            key={event.id}
            event={event}
            imageAspectRatio="aspect-[16/9]"
          />
        ))}
      </div>
    </section>
  );
}
