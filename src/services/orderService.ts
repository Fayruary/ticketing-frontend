import { apiFetch } from "../lib/api";

export interface Order {
  id: string;
  user_id: string;
  invoice_code: string;
  total: number;
  status:
    | "pending"
    | "paid"
    | "failed";
  created_at?: string;

  event_name?: string;
}

export interface OrderItem {
  ticket_category_id: string;
  quantity: number;
}

export interface CreateOrderData {
  items: OrderItem[];
}

export async function createOrder(
  data: CreateOrderData
) {
  return apiFetch<Order>("/orders", {
    method: "POST",
    body: JSON.stringify(data),
  });
}


export async function getMyOrders() {
  return apiFetch<Order[]>("/orders/my");
}

export async function getOrderById(
  id: string
) {
  return apiFetch<Order>(
    `/orders/${id}`
  );
}

export async function getAllOrders() {
  return apiFetch<Order[]>("/orders");
}

export async function updateOrderStatus(
  id: string,
  status: Order["status"]
) {
  return apiFetch<Order>(
    `/orders/${id}/status`,
    {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }
  );
}