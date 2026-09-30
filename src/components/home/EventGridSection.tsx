"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { TrendingUp, Search, SlidersHorizontal, MapPin, Music, ChevronDown } from "lucide-react";
import EventCard, { EventCardData } from "./EventCard";
import { getEvents, type Event } from "@/services/eventService";

interface EventGridSectionProps {
  className?: string;
}

const CITIES = ["Semua Kota", "Jakarta", "Bandung", "Surabaya", "Yogyakarta", "Bali", "Medan", "Semarang"];
const GENRES = ["Semua", "Pop", "Rock", "Jazz", "EDM", "Hip Hop", "Dangdut", "Indie", "Metal", "R&B"];

export default function EventGridSection({ className = "" }: EventGridSectionProps) {
  const [events, setEvents] = useState<EventCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("Semua Kota");
  const [genre, setGenre] = useState("Semua");
  const [showFilters, setShowFilters] = useState(false);
  const ITEMS_PER_PAGE = 12;

  const fetchEvents = useCallback(async (resetPage = false) => {
    try {
      setLoading(true);
      const params: any = {};
      if (search.trim()) params.search = search.trim();
      if (city !== "Semua Kota") params.city = city;
      if (genre !== "Semua") params.genre = genre;

      const res: any = await getEvents(params);
      const list: Event[] = Array.isArray(res) ? res : res?.data || [];

      const published = list.filter((e) => e.status === "published");
      const mapped: EventCardData[] = published.map((e) => ({
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
      }));

      if (resetPage) {
        setEvents(mapped.slice(0, ITEMS_PER_PAGE));
        setPage(1);
        setHasMore(mapped.length > ITEMS_PER_PAGE);
      } else {
        setEvents(mapped.slice(0, page * ITEMS_PER_PAGE));
        setHasMore(mapped.length > page * ITEMS_PER_PAGE);
      }
    } catch {
      // keep empty
    } finally {
      setLoading(false);
    }
  }, [search, city, genre, page]);

  useEffect(() => {
    fetchEvents(true);
  }, [search, city, genre]);

  useEffect(() => {
    if (page > 1) fetchEvents();
  }, [page]);

  const handleLoadMore = () => {
    setPage((prev) => prev + 1);
  };

  return (
    <section id="events" className={`w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ${className}`}>
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-[#111d5e]" />
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">Semua Event</h2>
        </div>

        {/* Search Bar */}
        <div className="flex items-center gap-2 flex-1 max-w-lg">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Cari event, artis, venue..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-full text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#111d5e] focus:border-transparent transition-all"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-full border text-xs font-semibold transition-all ${
              showFilters ? "bg-[#111d5e] text-white border-[#111d5e]" : "bg-white text-gray-700 border-gray-200 hover:border-gray-300"
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filter
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="flex flex-wrap gap-3 mb-6 p-4 bg-gray-50 rounded-2xl border border-gray-100">
          {/* City Filter */}
          <div className="relative">
            <div className="flex items-center gap-1.5 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <MapPin className="w-3.5 h-3.5 text-gray-500" />
            </div>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="pl-8 pr-8 py-2 bg-white border border-gray-200 rounded-full text-xs font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#111d5e] appearance-none cursor-pointer"
            >
              {CITIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
          </div>

          {/* Genre Filter */}
          <div className="relative">
            <div className="flex items-center gap-1.5 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <Music className="w-3.5 h-3.5 text-gray-500" />
            </div>
            <select
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              className="pl-8 pr-8 py-2 bg-white border border-gray-200 rounded-full text-xs font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#111d5e] appearance-none cursor-pointer"
            >
              {GENRES.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
          </div>
        </div>
      )}

      {/* Grid */}
      {loading && events.length === 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-2xl bg-gray-100 animate-pulse h-64" />
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mb-4">
            <TrendingUp className="w-8 h-8 text-[#111d5e]" />
          </div>
          <h3 className="text-lg font-bold text-gray-800 mb-1">Belum Ada Event</h3>
          <p className="text-sm text-gray-500 max-w-xs">
            Belum ada event yang tersedia saat ini. Coba lagi nanti atau ubah filter pencarian kamu.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {events.map((event) => (
              <EventCard key={event.id} event={event} imageAspectRatio="aspect-[16/10]" />
            ))}
          </div>

          {/* Load More */}
          {hasMore && (
            <div className="mt-10 flex justify-center pb-8">
              <button
                onClick={handleLoadMore}
                disabled={loading}
                className="px-8 py-2.5 rounded-full border border-gray-300 bg-white text-xs sm:text-sm font-bold text-gray-800 hover:bg-gray-50 hover:border-[#111d5e] hover:text-[#111d5e] active:scale-95 transition-all shadow-sm focus:outline-none disabled:opacity-50"
              >
                {loading ? "Memuat..." : "Lihat Lebih Banyak"}
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
