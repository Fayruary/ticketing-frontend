import { apiFetch } from "../lib/api";
import type { User } from "../lib/auth";

export interface PetugasUser {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: "petugas";
  created_at?: string;
  total_assigned_events?: number;
  active_assigned_events?: number;
}

export interface StaffAssignment {
  id: number;
  event_staff_id?: number;
  event_id: string;
  user_id: string;
  is_active: boolean;
  created_at?: string;
  event_name?: string;
  staff_name?: string;
  staff_email?: string;
  permissions: string[];
}

export interface AssignedEvent {
  id: string;
  name: string;
  event_id?: string;
  event_name?: string;
  poster?: string | null;
  city?: string;
  venue?: string;
  event_date: string;
  event_time?: string;
  status?: string;
  is_active: boolean;
  assignment_id: number;
  event_staff_id?: number;
  permissions: string[];
}

export interface CreateStaffAccountData {
  name: string;
  email: string;
  phone: string;
  password: string;
}

export interface AssignStaffData {
  event_id: string;
  user_id: string;
  permissions: string[];
}

// 1. Buat akun petugas baru
export async function createStaffAccount(data: CreateStaffAccountData) {
  return apiFetch<PetugasUser>("/staff/users", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// 2. Ambil semua akun user dengan role 'petugas'
export async function getAllPetugasUsers() {
  return apiFetch<PetugasUser[]>("/staff/users");
}

// 3. Ambil daftar event aktif yang ditugaskan kepada petugas yang login
export async function getMyAssignedEvents(): Promise<AssignedEvent[]> {
  const res = await apiFetch<any[]>("/staff/my-events");
  const rawList = Array.isArray(res) ? res : (res as any)?.data || [];
  return rawList.map((item: any) => {
    const eventId = String(item.event_id || item.id || "");
    const eventName = String(item.event_name || item.name || "Event Konser");
    const assignmentId = Number(item.event_staff_id || item.assignment_id || item.id || 0);
    return {
      ...item,
      id: eventId,
      name: eventName,
      event_id: eventId,
      event_name: eventName,
      assignment_id: assignmentId,
      event_staff_id: assignmentId,
      permissions: Array.isArray(item.permissions) ? item.permissions : [],
    };
  });
}

// 4. Ambil seluruh penugasan staff lintas event (untuk Admin)
export async function getAllStaffAssignments(): Promise<StaffAssignment[]> {
  const res = await apiFetch<any[]>("/staff/assignments");
  const rawList = Array.isArray(res) ? res : (res as any)?.data || [];
  return rawList.map((item: any) => {
    const rawId = item.event_staff_id ?? item.id;
    const parsedId = Number(rawId);
    const validId = !isNaN(parsedId) && parsedId > 0 ? parsedId : rawId;
    return {
      ...item,
      id: validId,
      event_staff_id: validId,
    };
  });
}

// 5. Tugaskan staff ke event beserta daftar permissions
export async function assignStaff(data: AssignStaffData): Promise<StaffAssignment> {
  const res = await apiFetch<any>("/staff", {
    method: "POST",
    body: JSON.stringify(data),
  });
  const rawId = res?.event_staff_id ?? res?.id;
  const parsedId = Number(rawId);
  const validId = !isNaN(parsedId) && parsedId > 0 ? parsedId : rawId;
  return {
    ...res,
    id: validId,
    event_staff_id: validId,
  };
}

// 6. Perbarui permissions penugasan staff (menggunakan ID event_staff)
export async function updateStaffPermissions(assignmentId: number, permissions: string[]) {
  return apiFetch<StaffAssignment>(`/staff/${assignmentId}/permissions`, {
    method: "PUT",
    body: JSON.stringify({ permissions }),
  });
}

// 7. Toggle status aktif/nonaktif penugasan staff (menggunakan ID event_staff)
export async function toggleStaffStatus(assignmentId: number, is_active: boolean) {
  return apiFetch<StaffAssignment>(`/staff/${assignmentId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ is_active }),
  });
}

// 8. Hapus penugasan staff berdasarkan ID event_staff
export async function removeStaff(assignmentId: number) {
  return apiFetch(`/staff/${assignmentId}`, {
    method: "DELETE",
  });
}

// 9. Ambil penugasan staff untuk event tertentu
export async function getEventStaff(eventId: string): Promise<StaffAssignment[]> {
  const res = await apiFetch<any[]>(`/staff/event/${eventId}`);
  const rawList = Array.isArray(res) ? res : (res as any)?.data || [];
  return rawList.map((item: any) => {
    const rawId = item.event_staff_id ?? item.id;
    const parsedId = Number(rawId);
    const validId = !isNaN(parsedId) && parsedId > 0 ? parsedId : rawId;
    return {
      ...item,
      id: validId,
      event_staff_id: validId,
    };
  });
}

// 10. Kompatibilitas pemanggilan lama
export async function getStaff() {
  return getAllPetugasUsers();
}
