import { apiFetch } from "../lib/api";

export interface Banner {
  id: number;
  title: string;
  image?: string;
  is_active: boolean;
}

export async function getActiveBanners() {
  return apiFetch<Banner[]>(
    "/banners/active"
  );
}

export async function getBanners() {
  return apiFetch<Banner[]>("/banners");
}

export async function createBanner(
  data: Partial<Banner>
) {
  return apiFetch<Banner>("/banners", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateBanner(
  id: number,
  data: Partial<Banner>
) {
  return apiFetch<Banner>(
    `/banners/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(data),
    }
  );
}

export async function deleteBanner(
  id: number
) {
  return apiFetch(`/banners/${id}`, {
    method: "DELETE",
  });
}