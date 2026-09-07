const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api").replace(/\/$/, "");

interface ApiOptions extends RequestInit {
  body?: BodyInit | null;
}

export async function apiFetch<T = any>(
  endpoint: string,
  options: ApiOptions = {}
): Promise<T> {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("token")
      : null;

  const isFormData = options.body instanceof FormData;
  const formattedEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;

  const headers: HeadersInit = {
    ...(isFormData
      ? {}
      : {
          "Content-Type": "application/json",
        }),

    ...(token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : {}),

    ...(options.headers || {}),
  };

  const response = await fetch(`${API_BASE}${formattedEndpoint}`, {
    ...options,
    headers,
  });

  let data: any = {};

  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (!response.ok) {
    throw new Error(
      data.message || "Terjadi kesalahan pada server"
    );
  }

  if (data && typeof data === "object" && data.success === true && data.data !== undefined) {
    return data.data as T;
  }

  return data as T;
}