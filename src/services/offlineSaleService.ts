import { apiFetch } from "../lib/api";

export interface OfflineSale {
  id: string;
  event_id: string;
  staff_id: string;
  buyer_name: string;
  phone: string;
  buyer_email?: string | null;
  payment_method?: string;
  payment_status?: string;
  ticket_category_id: string;
  quantity: number;
  total: number;
  event_name?: string;
  ticket_category_name?: string;
  staff_name?: string;
  created_at?: string;
}

export interface CreateOfflineSaleData {
  event_id: string;
  buyer_name: string;
  phone: string;
  buyer_email?: string;
  payment_method?: string; // 'cash' | 'qris' | 'transfer'
  ticket_category_id: string;
  quantity: number;
}

export interface CreateOfflineSaleResponse {
  sale: OfflineSale;
  tickets: any[];
}

export async function createOfflineSale(
  data: CreateOfflineSaleData
) {
  return apiFetch<CreateOfflineSaleResponse>(
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
