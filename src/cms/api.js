// Client for the Node API in server/. Editors sign in with an HttpOnly cookie session;
// pages live in PostgreSQL.

const BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

/** Uploaded files come back as "/uploads/x.jpg"; prefix the API origin when it differs from the site. */
export const mediaUrl = (src) => (src && src.startsWith('/uploads') ? BASE + src : src);

async function request(path, { method = 'GET', body } = {}) {
  const isForm = body instanceof FormData;
  const res = await fetch(`${BASE}/api${path}`, {
    method,
    credentials: 'include',
    headers: body && !isForm ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? (isForm ? body : JSON.stringify(body)) : undefined,
  });
  const json = await res.json().catch(() => null);
  if (!res.ok) {
    const err = new Error(json?.error || `Request failed (${res.status})`);
    err.status = res.status;
    throw err;
  }
  return json;
}

export const getSession = () => request('/session').then((r) => r.user);
export const login = (email, password) => request('/session', { method: 'POST', body: { email, password } }).then((r) => r.user);
export const logout = () => request('/session', { method: 'DELETE' });

/** → { [slug]: { title, published, draft } }. `draft` is only filled for signed-in editors. */
export const fetchPages = (slugs) => request(`/pages?slugs=${slugs.map(encodeURIComponent).join(',')}`).then((r) => r.pages);
export const listPages = () => request('/pages/all').then((r) => r.pages);
export const saveDraft = (slug, doc) => request(`/pages/${slug}/draft`, { method: 'PUT', body: { doc } });
export const discardDraft = (slug) => request(`/pages/${slug}/draft`, { method: 'DELETE' });
export const publishPage = (slug, doc) => request(`/pages/${slug}/publish`, { method: 'POST', body: { doc } });
export const deletePage = (slug) => request(`/pages/${slug}`, { method: 'DELETE' });

export const listMedia = () => request('/media').then((r) => r.media);
export const deleteMedia = (id) => request(`/media/${id}`, { method: 'DELETE' });
export function uploadMedia(file, alt = '') {
  const form = new FormData();
  form.append('alt', alt);
  form.append('file', file);
  return request('/media', { method: 'POST', body: form }).then((r) => r.media);
}

export const submitEnquiry = (data) => request('/enquiries', { method: 'POST', body: data });

// ---- Admin ("Studio CMS") ----
export const updatePageMeta = (slug, values) => request(`/pages/${slug}`, { method: 'PATCH', body: values });
export const adminStats = () => request('/admin/stats');
export const listLeads = () => request('/admin/leads').then((r) => r.leads);
export const markLead = (id, read) => request(`/admin/leads/${id}`, { method: 'PATCH', body: { read } });
export const deleteLead = (id) => request(`/admin/leads/${id}`, { method: 'DELETE' });
export const listUsers = () => request('/admin/users').then((r) => r.users);
export const createUser = (values) => request('/admin/users', { method: 'POST', body: values });
export const updateUser = (id, values) => request(`/admin/users/${id}`, { method: 'PATCH', body: values });
export const deleteUser = (id) => request(`/admin/users/${id}`, { method: 'DELETE' });
export const updateMedia = (id, alt) => request(`/media/${id}`, { method: 'PATCH', body: { alt } });
export const apiUrl = (path) => BASE + path;
export const rebuildSite = () => request('/seo/rebuild', { method: 'POST' });
