"use client";

import React, { useEffect, useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import EventList from "@/components/events/EventList";
import { getEvents, type Event } from "@/services/eventService";
import { ChevronLeft, ChevronRight, TrendingUp } from "lucide-react";

export default function Home() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  // Categories based on the image
  const categories = [
    { name: "Musik", icon: "🎸" },
    { name: "Pameran", icon: "🖼️" },
    { name: "Wahana", icon: "🎡" },
    { name: "Teater", icon: "🎭" },
    { name: "Olahraga", icon: "⚽" },
    { name: "Wisata", icon: "🏖️" },
    { name: "Talkshow", icon: "🎤" },
    { name: "Workshop", icon: "🛠️" },
    { name: "Kompetisi", icon: "🏆" }
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await getEvents({}).catch(() => []);
      setEvents(Array.isArray(res) ? res : (res as any)?.data || []);
    } catch (error) {
      console.error("Error fetching homepage data:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-black font-sans">
      <Navbar />

      {/* Hero Banner Carousel (Static for now) */}
      <section className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-10">
        <div className="relative w-full h-[200px] md:h-[350px] lg:h-[450px] rounded-3xl overflow-hidden group">
          <img 
            src="https://images.unsplash.com/photo-1540039155732-d68a27891823?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80" 
            alt="Hero Banner" 
            className="w-full h-full object-cover"
          />
          {/* Overlay text for demo purposes to look like the Funhouse banner */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
             <h1 className="text-4xl md:text-7xl font-black text-white drop-shadow-lg italic tracking-tighter">
               FUNHOUSE
             </h1>
          </div>
          
          <button className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 flex items-center justify-center text-gray-800 hover:bg-white shadow-md transition-all opacity-0 group-hover:opacity-100">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 flex items-center justify-center text-gray-800 hover:bg-white shadow-md transition-all opacity-0 group-hover:opacity-100">
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
        
        {/* Carousel Dots */}
        <div className="flex justify-center gap-2 mt-4">
          <div className="w-2 h-2 rounded-full bg-[#111d5e]"></div>
          <div className="w-2 h-2 rounded-full bg-gray-300"></div>
          <div className="w-2 h-2 rounded-full bg-gray-300"></div>
          <div className="w-2 h-2 rounded-full bg-gray-300"></div>
          <div className="w-2 h-2 rounded-full bg-gray-300"></div>
        </div>
      </section>

      {/* Lagi Trending Section 1 (Top 3) */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="w-6 h-6 text-[#111d5e]" />
          <h2 className="text-2xl font-extrabold text-gray-900">Lagi Trending</h2>
        </div>
        
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-72 rounded-2xl bg-gray-200 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {events.slice(0, 3).map((event) => (
              <div key={`trending1-${event.id}`} className="transform scale-[1.02] origin-top">
                <EventList events={[event]} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Promo Banner (LOKET SPOTLIGHT) */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="w-full h-24 md:h-32 rounded-2xl overflow-hidden bg-gradient-to-r from-green-500 via-teal-500 to-blue-500 flex items-center justify-center relative cursor-pointer hover:opacity-95 transition-opacity">
           <div className="flex flex-col items-center">
             <span className="text-white font-black text-3xl md:text-5xl italic tracking-tight">LOKET SPOTLIGHT</span>
           </div>
        </div>
      </section>

      {/* Categories */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-14">
        <h2 className="text-2xl font-extrabold text-gray-900 mb-6">Kategori</h2>
        <div className="flex justify-between items-center overflow-x-auto pb-4 gap-4 scrollbar-hide">
          {categories.map((cat, idx) => (
            <div key={idx} className="flex flex-col items-center gap-3 min-w-[70px] cursor-pointer group">
              <div className="w-14 h-14 rounded-full bg-blue-50 text-[#111d5e] flex items-center justify-center text-2xl group-hover:bg-blue-100 transition-colors shadow-sm">
                {cat.icon}
              </div>
              <span className="text-xs font-semibold text-gray-700">{cat.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Lagi Trending Section 2 (Grid 4x2) */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="w-6 h-6 text-[#111d5e]" />
          <h2 className="text-2xl font-extrabold text-gray-900">Lagi Trending</h2>
        </div>
        
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div key={n} className="h-64 rounded-2xl bg-gray-200 animate-pulse" />
            ))}
          </div>
        ) : (
          <EventList events={events.length > 3 ? events.slice(3, 11) : events} />
        )}

        <div className="mt-12 flex justify-center pb-20">
          <button className="px-8 py-2.5 rounded-full border border-gray-300 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors">
            Lihat Semua
          </button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
