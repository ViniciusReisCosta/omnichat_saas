function headers(): HeadersInit {
  return { 'Content-Type': 'application/json' };
}

function apiPath(path: string) {
  if (path.startsWith('/api/')) return path;
  if (path === '/api') return path;
  return `/api${path.startsWith('/') ? path : `/${path}`}`;
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const data = await res.json().catch(() => ({ error: `Request failed: ${res.status}` }));
    throw new Error(data.error || `Request failed: ${res.status}`);
  }
  return res.json();
}

export async function apiGet<T = unknown>(path: string): Promise<T> {
  const res = await fetch(apiPath(path), { headers: headers(), credentials: 'same-origin', cache: 'no-store' });
  return handleResponse<T>(res);
}

export async function apiPost<T = unknown>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(apiPath(path), {
    method: 'POST',
    headers: headers(),
    credentials: 'same-origin',
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  return handleResponse<T>(res);
}

export async function apiPut<T = unknown>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(apiPath(path), {
    method: 'PUT',
    headers: headers(),
    credentials: 'same-origin',
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  return handleResponse<T>(res);
}

export async function apiDelete<T = unknown>(path: string): Promise<T> {
  const res = await fetch(apiPath(path), { method: 'DELETE', headers: headers(), credentials: 'same-origin' });
  return handleResponse<T>(res);
}
