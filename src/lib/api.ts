function jsonHeaders(): HeadersInit {
  return { 'Content-Type': 'application/json' };
}

export function apiPath(path: string) {
  return path.startsWith('/api/')
    ? path
    : path === '/api'
      ? path
      : `/api${path.startsWith('/') ? path : `/${path}`}`;
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const data = await res.json().catch(() => ({ error: `Request failed: ${res.status}` }));
    throw new Error(data.error || `Request failed: ${res.status}`);
  }
  return res.json();
}

export async function apiGet<T = unknown>(path: string): Promise<T> {
  const res = await fetch(apiPath(path), { credentials: 'include', cache: 'no-store' });
  return handleResponse<T>(res);
}

export async function apiPost<T = unknown>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(apiPath(path), {
    method: 'POST',
    headers: jsonHeaders(),
    credentials: 'include',
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  return handleResponse<T>(res);
}

export async function apiPut<T = unknown>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(apiPath(path), {
    method: 'PUT',
    headers: jsonHeaders(),
    credentials: 'include',
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  return handleResponse<T>(res);
}

export async function apiDelete<T = unknown>(path: string): Promise<T> {
  const res = await fetch(apiPath(path), { method: 'DELETE', credentials: 'include' });
  return handleResponse<T>(res);
}
