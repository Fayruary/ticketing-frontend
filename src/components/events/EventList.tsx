import EventCard from "./EventCard";

import type { Event } from "../../services/eventService";

interface EventListProps {
  events: Event[];
}

export default function EventList({
  events,
}: EventListProps) {
  if (events.length === 0) {
    return (
      <p className="text-center py-10">
        Belum ada event.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {events.map((event) => (
        <EventCard
          key={event.id}
          event={event}
        />
      ))}
    </div>
  );
}