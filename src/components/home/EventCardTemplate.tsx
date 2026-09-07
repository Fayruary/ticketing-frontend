import React from "react";
import PlaceholderBox from "@/components/ui/PlaceholderBox";

export interface EventCardData {
  id?: string | number;
  title: string;
  venueDate: string;
  priceRange: string;
  organizer: string;
  posterLabel?: string;
}

interface EventCardTemplateProps {
  event: EventCardData;
  className?: string;
  imageAspectRatio?: string;
}

export default function EventCardTemplate({
  event,
  className = "",
  imageAspectRatio = "aspect-[16/10]",
}: EventCardTemplateProps) {
  return (
    <div
      className={`group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col h-full ${className}`}
    >
      {/* Event Poster / Image Placeholder Box */}
      <div className="w-full">
        <PlaceholderBox
          aspectRatio={imageAspectRatio}
          className="rounded-t-2xl rounded-b-none border-0 border-b border-gray-100 bg-neutral-200"
          label={event.posterLabel || "Event Poster"}
          sublabel="Swap with event image"
        />
      </div>

      {/* Card Details */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div className="space-y-1">
          <h3 className="font-bold text-base text-gray-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
            {event.title}
          </h3>
          <p className="text-xs text-gray-500 line-clamp-1">
            {event.venueDate}
          </p>
          <p className="text-xs font-bold text-gray-900 pt-1">
            {event.priceRange}
          </p>
        </div>

        {/* Organizer Section */}
        <div className="flex items-center gap-2 pt-3 mt-3 border-t border-gray-100">
          <div className="w-5 h-5 rounded-full bg-neutral-300 shrink-0 flex items-center justify-center">
            <span className="w-2 h-2 rounded-full bg-neutral-400"></span>
          </div>
          <span className="text-xs text-gray-600 truncate font-medium">
            {event.organizer}
          </span>
        </div>
      </div>
    </div>
  );
}
