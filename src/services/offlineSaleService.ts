import { apiFetch } from "../lib/api";

export interface OfflineSale {
  id: string;
  event_id: string;
  staff_id: string;
  buyer_name: string;
  phone: string;
  ticket_category_id: string;
  quantity: number;
  total: number;
  created_at?: string;
}

export interface CreateOfflineSaleData {
  event_id: string;
  buyer_name: string;
  phone: string;
  ticket_category_id: string;
  quantity: number;
}

export async function createOfflineSale(
  data: CreateOfflineSaleData
) {
  return apiFetch<OfflineSale>(
    "/offline-sales",
    {
      method: "POST",
      body: JSON.stringify(data),
    }
  );
}

export async function getOfflineSales() {
  return apiFetch<OfflineSale[]>(
    "/offline-sales"
  );
}

export async function getEventOfflineSales(
  eventId: string
) {
  return apiFetch<OfflineSale[]>(
    `/offline-sales/event/${eventId}`
  );
}