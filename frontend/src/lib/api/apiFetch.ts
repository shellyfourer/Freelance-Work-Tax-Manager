// Methods that change server state - these need a CSRF token attached
const MUTATING_METHODS = new Set(["POST", "PUT", "DELETE", "PATCH"]);

// Read at call time (not module load time) so vi.stubEnv works in tests
export const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export function apiUrl(path: string): string {
  const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
  return `${base}/api${path}`;
}

// Turns a raw Response into typed data, or throws a meaningful error message
export async function handleResponse<T>(res: Response, fallback: string): Promise<T> {
  if (res.ok) {
    // 204 No Content and empty bodies have nothing to parse
    if (res.status === 204 || res.headers.get("content-length") === "0") {
      return undefined as T;
    }
    return res.json() as Promise<T>;
  }

  // Request failed - try to extract the error message the backend sent
  const text = await res.text().catch(() => "");
  let message = fallback;
  if (text) {
    try {
      // Spring Boot usually returns { message: "..." } or { error: "..." }
      const parsed = JSON.parse(text) as { message?: string; error?: string };
      message = parsed.message ?? parsed.error ?? fallback;
    } catch {
      // Body wasn't JSON — use it as plain text
      message = text || fallback;
    }
  }
  throw new Error(message);
}

// CSRF: a malicious site tricks your browser into making a request to our backend using your existing
// login cookie. The backend can't tell the difference
// the cookie is sent automatically by the browser. The fix: the backend also
// sets a separate XSRF-TOKEN cookie that only JavaScript on OUR page can read (not
// cross-origin scripts). We send it back as a header, and the backend checks both match.
// A foreign site can't forge that header because it can't read our cookie.
function getCsrfToken(): string {
  if (typeof document === "undefined") return ""; // guard for server-side rendering
  const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : "";
}

// Wrapper around fetch that handles CSRF and sends cookies with every request
export async function apiFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const method = (options.method ?? "GET").toUpperCase();
  const headers = new Headers(options.headers);

  // Attach the CSRF token only when the request could modify data
  if (MUTATING_METHODS.has(method)) {
    const token = getCsrfToken();
    if (token) headers.set("X-XSRF-TOKEN", token);
  }

  // credentials: "include" sends the session cookie so the backend knows who you are
  return fetch(url, { ...options, headers, credentials: "include" });
}
