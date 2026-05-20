const BASE = '/api'

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })

  if (!res.ok) {
    let errors: string[]
    try {
      const body = await res.json()
      errors = Array.isArray(body) ? body : [body?.message ?? res.statusText]
    } catch {
      errors = [res.statusText]
    }
    throw errors
  }

  if (res.status === 204) return null as T
  try {
    return (await res.json()) as T
  } catch {
    return null as T
  }
}

export const get = <T>(path: string) => request<T>(path)
export const post = <T>(path: string, body?: unknown) =>
  request<T>(path, { method: 'POST', body: body != null ? JSON.stringify(body) : undefined })
export const put = <T>(path: string, body?: unknown) =>
  request<T>(path, { method: 'PUT', body: body != null ? JSON.stringify(body) : undefined })
export const patch = <T>(path: string, body?: unknown) =>
  request<T>(path, { method: 'PATCH', body: body != null ? JSON.stringify(body) : undefined })
export const del = <T>(path: string, body?: unknown) =>
  request<T>(path, { method: 'DELETE', body: body != null ? JSON.stringify(body) : undefined })
