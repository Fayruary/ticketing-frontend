import React from "react";
import Link from "next/link";
import type { Event } from "@/services/eventService";
import { formatRupiah } from "@/lib/utils";
import { MapPin } from "lucide-react";

interface EventCardProps {
  event: Event;
}

export default function EventCard({ event }: EventCardProps) {
  // Placeholder images for concert posters
  const defaultPosters = [
    "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=800&q=80"
  ];
  
  // Pick deterministic poster if null
  const posterUrl = event.poster && event.poster.startsWith("http")
    ? event.poster
    : defaultPosters[Math.abs(event.name.length) % defaultPosters.length];

  // Dummy event creator
  const creatorName = "Pesta Bebas Berselancar";

  // Format date correctly for UI e.g. "Jiexpo Kemayoran 25 - 28 Agustus 2026"
  const formattedDate = new Date(event.event_date).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <Link href={`/events/${event.id}`} className="block group">
      <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col h-full">
        {/* Top Image Container */}
        <div className="relative h-48 w-full overflow-hidden bg-gray-100">
          <img
            src={posterUrl}
            alt={event.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>

        {/* Content Section */}
        <div className="p-4 flex-1 flex flex-col justify-between">
          <div className="space-y-1.5 mb-4">
            <h3 className="font-extrabold text-lg text-black line-clamp-1 leading-tight">
              {event.name}
            </h3>
            
            <p className="text-sm text-gray-500 line-clamp-1">
              {event.venue || event.city} {formattedDate}
            </p>

            <p className="text-sm font-bold text-gray-900 pt-1">
              {event.min_price && event.min_price > 0 ? `${formatRupiah(event.min_price)} - ${formatRupiah(event.min_price * 2)}` : "Rp 300.000 - 600.000"}
            </p>
          </div>

          {/* Footer info: Creator */}
          <div className="flex items-center gap-2 pt-3 border-t border-gray-100 mt-auto">
            <div className="w-6 h-6 rounded-full bg-gray-200 overflow-hidden shrink-0">
              <div className="w-full h-full flex items-center justify-center bg-gray-200 text-[10px] text-gray-500 font-bold uppercase">
                {creatorName.substring(0, 2)}
              </div>
            </div>
            <span className="text-xs font-semibold text-gray-700 truncate">{creatorName}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}