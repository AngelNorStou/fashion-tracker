const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export async function apiFetch(
  endpoint: string,
  options: RequestInit = {}
) {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("accessToken")
      : null;

  const headers = new Headers(options.headers);

  if (
    !headers.has("Content-Type") &&
    options.body &&
    !(options.body instanceof FormData)
  ) {
    headers.set("Content-Type", "application/json");
  }

    // Endpoints that don't need (and shouldn't send) an existing session
    // token: all of /api/auth/* is unauthenticated by nature, and the
    // email-change confirmation link may be clicked from a context where
    // a stale/expired token is sitting in localStorage.
    const isAuthEndpoint =
      endpoint.startsWith("/api/auth/") ||
      endpoint.startsWith("/api/users/confirm-email-change");

    if (token && !isAuthEndpoint) {
      headers.set("Authorization", `Bearer ${token}`);
    }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let message = "Something went wrong.";

    try {
      const data = await response.json();
      message = data.message ?? data.error ?? message;
    } catch {
      // Response wasn't JSON.
    }

    throw new Error(message);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}