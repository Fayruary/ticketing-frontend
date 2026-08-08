import { apiFetch } from "../lib/api";

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export async function getNotifications() {
  return apiFetch<Notification[]>(
    "/notifications"
  );
}

export async function markAsRead(
  id: string
) {
  return apiFetch(
    `/notifications/${id}/read`,
    {
      method: "PATCH",
    }
  );
}

export async function markAllAsRead() {
  return apiFetch(
    "/notifications/read-all",
    {
      method: "PATCH",
    }
  );
}