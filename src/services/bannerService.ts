import { apiFetch } from "../lib/api";

export interface Banner {
  id: number | string;
  title: string;
  description?: string;
  image?: string;
  image_url?: string;
  link_url?: string;
  is_active: boolean;
  created_at?: string;
}

/**
 * Resolves an image URL:
 * - If full URL (http, https, data:), returns as is.
 * - If relative path (/uploads/...), prepends backend origin.
 */
export function resolveBannerImageUrl(url?: string): string {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:")) {
    return url;
  }
  const apiBase = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api").replace(
    /\/api\/?$/,
    ""
  );
  return `${apiBase}${url.startsWith("/") ? "" : "/"}${url}`;
}

export async function getActiveBanners(): Promise<Banner[]> {
  const res = await apiFetch<Banner[]>("/banners/active");
  return Array.isArray(res) ? res : (res as any)?.data || [];
}

export async function getBanners(): Promise<Banner[]> {
  const res = await apiFetch<Banner[]>("/banners");
  return Array.isArray(res) ? res : (res as any)?.data || [];
}

export async function createBanner(data: Partial<Banner> | FormData) {
  const isFormData = data instanceof FormData;
  return apiFetch<Banner>("/banners", {
    method: "POST",
    body: isFormData ? data : JSON.stringify(data),
  });
}

export async function updateBanner(
  id: number | string,
  data: Partial<Banner> | FormData
) {
  const isFormData = data instanceof FormData;
  return apiFetch<Banner>(`/banners/${id}`, {
    method: "PUT",
    body: isFormData ? data : JSON.stringify(data),
  });
}

export async function toggleBanner(id: number | string) {
  return apiFetch<Banner>(`/banners/${id}/toggle`, {
    method: "PATCH",
  });
}

export async function uploadBannerImage(file: File) {
  const formData = new FormData();
  formData.append("image", file);
  return apiFetch<{ success: boolean; url: string }>("/banners/upload", {
    method: "POST",
    body: formData,
  });
}

export async function deleteBanner(id: number | string) {
  return apiFetch(`/banners/${id}`, {
    method: "DELETE",
  });
}
