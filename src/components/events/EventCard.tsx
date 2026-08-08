import Link from "next/link";

import type { Event } from "../../services/eventService";

import {
  formatDate,
  formatRupiah,
} from "../../lib/utils";

interface EventCardProps {
  event: Event;
}

export default function EventCard({
  event,
}: EventCardProps) {
  return (
    <div className="border rounded-xl overflow-hidden">
      <img
        src={
          event.poster ||
          "/images/default-event.jpg"
        }
        alt={event.name}
        className="w-full h-48 object-cover"
      />

      <div className="p-4 space-y-2">
        <h3 className="font-bold text-lg">
          {event.name}
        </h3>

        <p className="text-sm text-gray-500">
          {event.city || "-"} •{" "}
          {event.venue || "-"}
        </p>

        <p className="text-sm">
          {formatDate(event.event_date)}
        </p>

        {event.min_price !== undefined && (
          <p className="font-semibold">
            Mulai{" "}
            {formatRupiah(event.min_price)}
          </p>
        )}

        <Link
          href={`/events/${event.id}`}
          className="inline-block px-3 py-2 rounded-lg bg-black text-white text-sm"
        >
          Lihat Event
        </Link>
      </div>
    </div>
  );
}