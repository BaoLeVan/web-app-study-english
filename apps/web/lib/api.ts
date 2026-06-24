/** Tiny typed fetch wrapper used by web app. */

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';

interface FetchOpts {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE' | 'PUT';
  body?: unknown;
  token?: string | null;
  signal?: AbortSignal;
}

export async function api<T>(path: string, opts: FetchOpts = {}): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (opts.token) headers.Authorization = `Bearer ${opts.token}`;

  const res = await fetch(`${API_URL}${path}`, {
    method: opts.method ?? 'GET',
    headers,
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
    signal: opts.signal,
    credentials: 'include',
  });

  if (!res.ok) {
    const text = await res.text();
    let message = res.statusText;
    try {
      const parsed = JSON.parse(text) as { message?: string | string[] };
      message = Array.isArray(parsed.message) ? parsed.message.join(', ') : parsed.message ?? message;
    } catch {
      /* keep statusText */
    }
    throw new ApiError(res.status, message);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}
