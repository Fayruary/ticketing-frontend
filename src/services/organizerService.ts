import { apiFetch } from "../lib/api";

export interface Organizer {
  id: string;
  name: string;
  company_name?: string;
  email?: string;
  phone?: string;
  address?: string;
  created_at?: string;
  updated_at?: string;
}

export async function getOrganizers() {
  return apiFetch<Organizer[]>(
    "/organizers"
  );
}

export async function getOrganizerById(
  id: string
) {
  return apiFetch<Organizer>(
    `/organizers/${id}`
  );
}

export async function createOrganizer(
  data: Partial<Organizer>
) {
  return apiFetch<Organizer>("/organizers", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateOrganizer(
  id: string,
  data: Partial<Organizer>
) {
  return apiFetch<Organizer>(
    `/organizers/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(data),
    }
  );
}

export async function deleteOrganizer(
  id: string
) {
  return apiFetch(`/organizers/${id}`, {
    method: "DELETE",
  });
}