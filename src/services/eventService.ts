import { apiFetch } from "../lib/api";

export interface Event {
  id: string;
  organizer_id: string;
  name: string;
  description?: string;
  poster?: string;
  city?: string;
  venue?: string;
  capacity?: number;
  event_date?: string;
  event_time?: string;
  genre?: string;
  status:
    | "draft"
    | "published"
    | "finished"
    | "cancelled";
  created_at?: string;
  updated_at?: string;
  min_price?: number;
}

export interface EventFilter {
  city?: string;
  date?: string;
  genre?: string;
  search?: string;
}

export async function getEvents(
  params: EventFilter = {}
) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(
    ([key, value]) => {
      if (value) {
        searchParams.append(key, value);
      }
    }
  );

  const query = searchParams.toString();

  return apiFetch<Event[]>(
    `/events${query ? `?${query}` : ""}`
  );
}

export async function getEventById(
  id: string
) {
  return apiFetch<Event>(`/events/${id}`);
}

export async function createEvent(
  data: Partial<Event>
) {
  return apiFetch<Event>("/events", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateEvent(
  id: string,
  data: Partial<Event>
) {
  return apiFetch<Event>(`/events/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteEvent(
  id: string
) {
  return apiFetch(`/events/${id}`, {
    method: "DELETE",
  });
}

export async function publishEvent(
  id: string
) {
  return apiFetch(`/events/${id}/publish`, {
    method: "PATCH",
  });
}