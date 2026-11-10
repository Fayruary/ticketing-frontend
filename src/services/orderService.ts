import { apiFetch } from "../lib/api";

export interface Order {
  id: string;
  user_id?: string;
  event_id?: string;
  invoice_code: string;
  buyer_name?: string;
  buyer_email?: string;
  buyer_phone?: string;
  subtotal?: number;
  admin_fee?: number;
  total: number;
  status: "pending" | "paid" | "failed" | string;
  payment_status?: string;
  snap_token?: string;
  midtrans_transaction_id?: string;
  created_at?: string;
  event_name?: string;
  event_poster?: string;
}

export interface OrderItem {
  ticket_category_id: string;
  quantity: number;
  price?: number;
  category_name?: string;
}

export interface TicketHolder {
  ticket_category_id: string;
  ticket_index: number;
  category_name?: string;
  name: string;
  email?: string;
  phone?: string;
}

export interface CheckoutOrderData {
  event_id: string;
  buyer_name: string;
  buyer_email: string;
  buyer_phone: string;
  items: {
    ticket_category_id: string;
    quantity: number;
  }[];
  ticket_holders?: TicketHolder[];
}

export interface CheckoutResponse {
  success: boolean;
  message?: string;
  data: {
    order: Order;
    snap_token: string;
    redirect_url?: string;
    client_key?: string;
  };
}

export interface IssuedTicket {
  id: string;
  order_id: string;
  order_detail_id: string;
  ticket_code: string;
  qr_code: string;
  owner_name: string;
  owner_email?: string;
  owner_phone?: string;
  status: string;
  created_at?: string;
  ticket_category?: string;
  category_name?: string;
}

export interface ETicketsResponse {
  success: boolean;
  data: {
    order: Order;
    event: {
      id: string;
      name: string;
      poster?: string;
      city?: string;
      venue?: string;
      event_date?: string;
      event_time?: string;
      description?: string;
    };
    details: any[];
    tickets: IssuedTicket[];
  };
}

// 1. Checkout Multi-step
export async function createCheckoutOrder(data: CheckoutOrderData): Promise<any> {
  return apiFetch("/orders/checkout", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// 2. Cek status order & pembayaran (polling)
export async function getOrderStatus(id: string): Promise<any> {
  return apiFetch(`/orders/${id}/status`);
}

// 3. Simulasi pembayaran Midtrans Sandbox (Demo)
export async function simulatePayment(id: string): Promise<any> {
  return apiFetch(`/orders/${id}/simulate-payment`, {
    method: "POST",
  });
}

// 4. Ambil E-Ticket transaksi yang sudah lunas (Step 4)
export async function getOrderETickets(id: string): Promise<any> {
  return apiFetch(`/orders/${id}/e-tickets`);
}

// Backward compatibility functions
export interface CreateOrderData {
  items: OrderItem[];
}

export async function createOrder(data: CreateOrderData) {
  return apiFetch<Order>("/orders", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getMyOrders() {
  return apiFetch<Order[]>("/orders/my");
}

export async function getOrderById(id: string) {
  return apiFetch<Order>(`/orders/${id}`);
}

export async function getAllOrders() {
  return apiFetch<Order[]>("/orders");
}
