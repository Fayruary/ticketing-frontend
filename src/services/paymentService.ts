import { apiFetch } from "../lib/api";

export interface Payment {
  id: string;
  order_id: string;
  payment_method?: string;
  transaction_id?: string;
  status:
    | "pending"
    | "success"
    | "failed";
  paid_at?: string;
}

export async function createPayment(
  data: {
    order_id: string;
    payment_method: string;
  }
) {
  return apiFetch<Payment>("/payments", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getPaymentByOrder(
  orderId: string
) {
  return apiFetch<Payment>(
    `/payments/order/${orderId}`
  );
}

export async function updatePaymentStatus(
  id: string,
  status: Payment["status"]
) {
  return apiFetch<Payment>(
    `/payments/${id}/status`,
    {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }
  );
}