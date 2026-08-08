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
  ticket?: Ticket;
  checkin?: Checkin;
}

export async function checkinTicket(
  ticketCode: string
) {
  return apiFetch<CheckinResponse>(
    "/checkins",
    {
      method: "POST",
      body: JSON.stringify({
        ticket_code: ticketCode,
      }),
    }
  );
}

export async function getEventCheckins(
  eventId: string
) {
  return apiFetch<Checkin[]>(
    `/checkins/event/${eventId}`
  );
}