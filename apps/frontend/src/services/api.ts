const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3100/api';

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body?: any;
  headers?: Record<string, string>;
  retry?: boolean;
};

async function refreshAccessToken() {
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) throw new Error('Refresh token ausente');

  const response = await fetch(`${API_URL}/auth/refresh`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refreshToken }),
  });

  if (!response.ok) {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    throw new Error('Sessão expirada');
  }

  const data = await response.json();
  localStorage.setItem('accessToken', data.accessToken);
  return data.accessToken;
}

async function request(path: string, options: RequestOptions = {}) {
  const token =
    typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

  const response = await fetch(`${API_URL}${path}`, {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (response.status === 401 && options.retry !== false) {
    const newToken = await refreshAccessToken();

    const retryResponse = await fetch(`${API_URL}${path}`, {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${newToken}`,
        ...(options.headers || {}),
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    if (!retryResponse.ok) {
      const errorData = await retryResponse.json().catch(() => null);
      throw new Error(errorData?.message || 'Erro na requisição');
    }

    if (retryResponse.status === 204) return null;
    return retryResponse.json();
  }

  if (!response.ok) {
    let message = 'Erro na requisição';

    try {
      const errorData = await response.json();
      message = Array.isArray(errorData?.message)
        ? errorData.message.join(', ')
        : errorData?.message || message;
    } catch {
      message = response.statusText || message;
    }

    throw new Error(message);
  }

  if (response.status === 204) return null;
  return response.json();
}

export const api = {
  get: (path: string) => request(path),
  post: (path: string, body?: any) => request(path, { method: 'POST', body }),
  patch: (path: string, body?: any) => request(path, { method: 'PATCH', body }),
  put: (path: string, body?: any) => request(path, { method: 'PUT', body }),
  delete: (path: string) => request(path, { method: 'DELETE' }),
};
