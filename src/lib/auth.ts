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