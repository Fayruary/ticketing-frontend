import React from "react";
import EventCard from "./EventCard";
import type { Event } from "@/services/eventService";
import { Music, AlertCircle } from "lucide-react";

interface EventListProps {
  events: Event[];
}

export default function EventList({ events }: EventListProps) {
  if (!events || events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center glass-panel rounded-3xl border border-zinc-800 my-8">
        <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-4">
          <Music className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Tidak Ada Event Konser</h3>
        <p className="text-sm text-zinc-400 max-w-md">
          Belum ada konser yang sesuai dengan kriteria pencarian atau filter kota yang Anda pilih. Silakan sesuaikan kata kunci atau filter.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {events.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
}