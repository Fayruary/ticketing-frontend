import { apiFetch } from "../lib/api";

export interface TicketCategory {
  id: string;
  event_id: string;
  name: string;
  price: number;
  stock: number;
  description?: string;
  tickets_per_package?: number;
  max_per_transaction?: number;
}

export interface Ticket {
  id: string;
  order_detail_id: string;
  ticket_code: string;
  qr_code?: string;
  status: "active" | "used";

  owner_name?: string;
  owner_email?: string;
  event_name?: string;
  ticket_category?: string;
  event_date?: string;
  venue?: string;
}

export async function getTicketCategories(
  eventId: string
) {
  return apiFetch<TicketCategory[]>(
    `/tickets/category/event/${eventId}`
  );
}

export async function getTicketCategoryById(
  id: string
) {
  return apiFetch<TicketCategory>(
    `/tickets/category/${id}`
  );
}

export async function createTicketCategory(
  data: Partial<TicketCategory>
) {
  return apiFetch<TicketCategory>(
    "/tickets/category",
    {
      method: "POST",
      body: JSON.stringify(data),
    }
  );
}

export async function updateTicketCategory(
  id: string,
  data: Partial<TicketCategory>
) {
  return apiFetch<TicketCategory>(
    `/tickets/category/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(data),
    }
  );
}

export async function deleteTicketCategory(
  id: string
) {
  return apiFetch(
    `/tickets/category/${id}`,
    {
      method: "DELETE",
    }
  );
}

export async function getMyTickets() {
  return apiFetch<Ticket[]>("/tickets/my");
}

export async function getTicketByCode(
  code: string
) {
  return apiFetch<Ticket>(
    `/tickets/code/${code}`
  );
}