import { apiFetch } from "../lib/api";
import type { Ticket } from "./ticketService";

export interface Checkin {
  id: number;
  ticket_id: string;
  staff_id: string;
  checkin_time: string;
}

export interface CheckinResponse {
  success: boolean;
  message: string;
  ticket?: Ticket | any;
  checkin?: Checkin;
}

export interface TicketValidationResult {
  id: string;
  ticket_code: string;
  status: "active" | "used" | "expired" | "cancelled" | string;
  is_valid: boolean;
  status_label: string;
  owner_name: string;
  owner_email: string;
  owner_phone?: string;
  event_id: string;
  event_name: string;
  event_poster?: string;
  event_date: string;
  event_time?: string;
  venue?: string;
  city?: string;
  ticket_category: string;
  ticket_price?: number;
  invoice_code?: string;
  payment_status?: string;
  checkin_time?: string | null;
  checked_in_by_staff?: string | null;
}

/**
 * Validasi status tiket berdasarkan kode (apakah masih valid / active, atau sudah used)
 * tanpa langsung mengubah status tiket.
 */
export async function validateTicketCode(
  ticketCode: string
): Promise<TicketValidationResult> {
  const clean = ticketCode.trim();
  const res = await apiFetch<TicketValidationResult>(
    `/tickets/code/${encodeURIComponent(clean)}`
  );
  return res;
}

/**
 * Melakukan check-in tiket (mengubah status tiket menjadi 'used' dan mencatat riwayat masuk).
 */
export async function checkinTicket(
  ticketCode: string
): Promise<CheckinResponse> {
  const clean = ticketCode.trim();
  const res: any = await apiFetch<any>("/checkins", {
    method: "POST",
    body: JSON.stringify({
      ticket_code: clean,
    }),
  });

  return {
    success: true,
    message: res?.message || "Check-in berhasil! Pengunjung diizinkan masuk venue.",
    ticket: res?.ticket || res,
    checkin: res?.checkin,
  };
}

/**
 * Mengambil daftar riwayat check-in untuk suatu event.
 */
export async function getEventCheckins(eventId: string) {
  return apiFetch<any[]>(`/checkins/event/${eventId}`);
}
