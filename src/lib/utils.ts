export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: "admin" | "user" | "petugas";
}

export function saveAuth(
  token: string,
  user: User
): void {
  localStorage.setItem("token", token);
  localStorage.setItem(
    "user",
    JSON.stringify(user)
  );
}

export function getToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem("token");
}

export function getUser(): User | null {
  if (typeof window === "undefined") {
    return null;
  }

  const user = localStorage.getItem("user");

  if (!user) {
    return null;
  }

  try {
    return JSON.parse(user) as User;
  } catch {
    return null;
  }
}

export function logout(): void {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

export function isLoggedIn(): boolean {
  return !!getToken();
}

export function getRole(): User["role"] | null {
  const user = getUser();

  return user?.role || null;
}

export function formatRupiah(
  value: number | string | null | undefined
): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(Number(value) || 0);
}

export function formatDate(
  date: string | Date | null | undefined
): string {
  if (!date) return "-";

  return new Date(date).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export function formatTime(
  time: string | null | undefined
): string {
  if (!time) return "-";

  return time.slice(0, 5);
}

export function getStatusLabel(
  status: string
): string {
  const statusMap: Record<string, string> = {
    draft: "Draft",
    published: "Dipublikasikan",
    finished: "Selesai",
    cancelled: "Dibatalkan",

    pending: "Menunggu",
    paid: "Lunas",
    failed: "Gagal",

    active: "Aktif",
    used: "Sudah Digunakan",

    success: "Berhasil",
  };

  return statusMap[status] || status;
}