"use client";

import React, { useEffect, useState } from "react";
import { TrendingUp, ChevronRight } from "lucide-react";
import EventCard, { EventCardData } from "./EventCard";
import { getEvents, type Event } from "@/services/eventService";

interface TrendingRowProps {
  className?: string;
}

export default function TrendingRow({ className = "" }: TrendingRowProps) {
  const [events, setEvents] = useState<EventCardData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res: any = await getEvents({ status: "published" } as any);
        const list: Event[] = Array.isArray(res) ? res : res?.data || [];
        // Take first 3 published events for trending row
        setEvents(list.slice(0, 3).map((e) => ({
          id: e.id,
          name: e.name,
          city: e.city,
          venue: e.venue,
          event_date: e.event_date,
          min_price: e.min_price,
          poster: e.poster,
          organizer_name: (e as any).organizer_name,
          genre: e.genre,
          status: e.status,
        })));
      } catch {
        // Keep empty
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  if (loading) {
    return (
      <section className={`w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 ${className}`}>
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="w-6 h-6 text-[#111d5e]" />
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">Lagi Trending</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="rounded-2xl bg-gray-100 animate-pulse h-64" />
          ))}
        </div>
      </section>
    );
  }

  if (events.length === 0) return null;

  return (
    <section className={`w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 ${className}`}>
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-[#111d5e]" />
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">Lagi Trending</h2>
        </div>
        <a href="#events" className="flex items-center gap-1 text-xs font-semibold text-[#111d5e] hover:underline">
          Lihat Semua <ChevronRight className="w-4 h-4" />
        </a>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => (
          <EventCard key={event.id} event={event} imageAspectRatio="aspect-[16/9]" />
        ))}
      </div>
    </section>
  );
}
