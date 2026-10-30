import { authClient } from "@/lib/auth-client";

const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");

export async function apiFetch(
  path: string,
  options: RequestInit = {},
): Promise<Response> {
  if (!API_URL) {
    throw new Error("API URL is not configured.");
  }

  const tokenResult = await authClient.token();
  const token = tokenResult.data?.token;

  if (tokenResult.error || !token) {
    console.error("[API] JWT token unavailable:", tokenResult.error);
    throw new Error("Please log in to continue.");
  }

  const headers = new Headers(options.headers);

  headers.set("Accept", "application/json");
  headers.set("Authorization", `Bearer ${token}`);

  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  console.log("[API DEBUG]", {
    path,
    tokenReceived: Boolean(token),
    authorizationAttached: headers.has("Authorization"),
  });

  return fetch(`${API_URL}${path}`, {
    ...options,
    headers,
    credentials: "include",
    cache: "no-store",
  });
}
