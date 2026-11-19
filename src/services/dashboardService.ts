import { apiFetch } from "../lib/api";

export interface AdminDashboard {
  total_events: number;
  total_users: number;
  total_tickets: number;
  total_revenue: number;
  total_organizers?: number;
  total_orders?: number;
  pending_orders?: number;
  recent_orders?: any[];
}

export interface PetugasDashboard {
  total_tickets: number;
  online_tickets: number;
  offline_tickets: number;
  checked_in: number;
  not_checked_in: number;
  remaining_tickets: number;
  events_counted?: number;
}

export async function getAdminDashboard() {
  return apiFetch<AdminDashboard>(
    "/dashboard"
  );
}

export async function getEventStatistics() {
  return apiFetch(
    "/dashboard/events"
  );
}

export async function getPetugasDashboard(eventId?: string) {
  const query = eventId ? `?event_id=${encodeURIComponent(eventId)}` : "";
  return apiFetch<PetugasDashboard>(
    `/dashboard/petugas${query}`
  );
}
