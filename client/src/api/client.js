async function apiFetch(path, options = {}) {
  const { body, ...rest } = options;
  const res = await fetch(path, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    ...rest,
  });

  const data = await res.json();

  if (!res.ok) {
    // Redirect to login on 401 for any route except /auth/me
    // (/auth/me returning 401 is the normal unauthenticated state, handled by AuthContext)
    if (res.status === 401 && path !== '/auth/me') {
      window.location.href = '/login';
      return;
    }
    const errors = data.errors ?? [{ msg: data.error ?? 'Something went wrong' }];
    throw Object.assign(new Error(errors[0].msg), { errors, status: res.status });
  }

  return data;
}

export const api = {
  get:    (path)       => apiFetch(path, { method: 'GET' }),
  post:   (path, body) => apiFetch(path, { method: 'POST', body }),
  put:    (path, body) => apiFetch(path, { method: 'PUT', body }),
  delete: (path)       => apiFetch(path, { method: 'DELETE' }),
};
