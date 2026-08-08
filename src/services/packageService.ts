import { apiFetch } from "../lib/api";

export interface CooperationPackage {
  id: number;
  name: string;
  duration: string;
  price: number;
  description?: string;
}

export async function getPackages() {
  return apiFetch<CooperationPackage[]>(
    "/packages"
  );
}

export async function getPackageById(
  id: number
) {
  return apiFetch<CooperationPackage>(
    `/packages/${id}`
  );
}

export async function createPackage(
  data: Partial<CooperationPackage>
) {
  return apiFetch<CooperationPackage>(
    "/packages",
    {
      method: "POST",
      body: JSON.stringify(data),
    }
  );
}

export async function updatePackage(
  id: number,
  data: Partial<CooperationPackage>
) {
  return apiFetch<CooperationPackage>(
    `/packages/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(data),
    }
  );
}

export async function deletePackage(
  id: number
) {
  return apiFetch(`/packages/${id}`, {
    method: "DELETE",
  });
}