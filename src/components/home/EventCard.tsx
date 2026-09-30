import React from "react";
import Link from "next/link";
import { MapPin, Calendar, Ticket } from "lucide-react";

export interface EventCardData {
  id: string;
  name: string;
  city?: string;
  venue?: string;
  event_date?: string;
  min_price?: number;
  poster?: string;
  organizer_name?: string;
  genre?: string;
  status?: string;
}

interface EventCardProps {
  event: EventCardData;
  className?: string;
  imageAspectRatio?: string;
}

const CONCERT_IMAGES = [
  "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80",
];

function getEventImage(event: EventCardData): string {
  if (event.poster && event.poster.startsWith("http")) return event.poster;
  const idx = Math.abs((event.name?.length || 0) + (event.id?.length || 0)) % CONCERT_IMAGES.length;
  return CONCERT_IMAGES[idx];
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return "";
  try {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function formatRupiah(val?: number | string): string {
  const num = Number(val);
  if (!num || isNaN(num)) return "Gratis";
  return `Rp ${num.toLocaleString("id-ID")}`;
}

export default function EventCard({ event, className = "", imageAspectRatio = "aspect-[16/10]" }: EventCardProps) {
  const imageUrl = getEventImage(event);

  return (
    <Link
      href={`/events/${event.id}`}
      className={`group block bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 ${className}`}
    >
      {/* Event Poster */}
      <div className={`w-full ${imageAspectRatio} relative overflow-hidden`}>
        <img
          src={imageUrl}
          alt={event.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e: any) => {
            e.target.src = CONCERT_IMAGES[0];
          }}
        />
        {/* Genre badge */}
        {event.genre && (
          <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-[#111d5e]/80 text-white text-[10px] font-bold backdrop-blur-sm">
            {event.genre}
          </div>
        )}
      </div>

      {/* Card Details */}
      <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2">
        <h3 className="font-bold text-sm text-gray-900 line-clamp-2 group-hover:text-[#111d5e] transition-colors leading-snug">
          {event.name}
        </h3>

        {event.venue && (
          <div className="flex items-start gap-1.5">
            <MapPin className="w-3 h-3 text-gray-400 mt-0.5 shrink-0" />
            <p className="text-[11px] text-gray-500 line-clamp-1">
              {event.venue}{event.city ? ` · ${event.city}` : ""}
            </p>
          </div>
        )}

        {event.event_date && (
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3 h-3 text-gray-400 shrink-0" />
            <p className="text-[11px] text-gray-500">{formatDate(event.event_date)}</p>
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-gray-50">
          <div className="flex items-center gap-1.5">
            <Ticket className="w-3 h-3 text-[#111d5e] shrink-0" />
            <span className="text-xs font-bold text-[#111d5e]">
              {event.min_price && Number(event.min_price) > 0
                ? `Mulai ${formatRupiah(event.min_price)}`
                : "Gratis"}
            </span>
          </div>
          {event.organizer_name && (
            <span className="text-[10px] text-gray-400 truncate max-w-[80px]">{event.organizer_name}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
