import { apiFetch } from "../lib/api";
import type { User } from "../lib/auth";

export async function getProfile() {
  return apiFetch<User>("/users/profile");
}

export async function updateProfile(
  data: Partial<User>
) {
  return apiFetch("/users/profile", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function getUsers() {
  return apiFetch<User[]>("/users");
}

export async function deleteUser(
  id: string
) {
  return apiFetch(`/users/${id}`, {
    method: "DELETE",
  });
}