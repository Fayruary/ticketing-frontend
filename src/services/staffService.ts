import { apiFetch } from "../lib/api";
import type { User } from "../lib/auth";

export interface EventStaff {
  id: number;
  event_id: string;
  user_id: string;
  user?: User;
}

export async function getStaff() {
  return apiFetch<User[]>("/staff");
}

export async function getEventStaff(
  eventId: string
) {
  return apiFetch<EventStaff[]>(
    `/staff/event/${eventId}`
  );
}

export async function assignStaff(data: {
  event_id: string;
  user_id: string;
}) {
  return apiFetch<EventStaff>("/staff", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function removeStaff(
  id: number
) {
  return apiFetch(`/staff/${id}`, {
    method: "DELETE",
  });
}