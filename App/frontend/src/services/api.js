// Ref: RNF-008, B-001, B-011
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function getAuthHeaders() {
  const token = localStorage.getItem('nexora_token');
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function request(endpoint, options = {}) {
  const url = `${API_URL}${endpoint}`;
  const config = {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...(options.headers || {})
    }
  };

  const response = await fetch(url, config);

  if (response.status === 204) {
    return null;
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data.detail || 'Ocurrió un error en la solicitud.';
    throw new Error(errorMsg);
  }

  return data;
}

export const api = {
  login: (email, password) =>
    request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    }),

  register: (name, email, password, career) =>
    request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, career })
    }),

  getMe: () => request('/api/auth/me'),

  getProfile: () => request('/api/users/me'),

  updateProfile: (profileData) =>
    request('/api/users/me', {
      method: 'PUT',
      body: JSON.stringify(profileData)
    }),

  getPosts: () => request('/api/posts'),

  createPost: (content, image_url) =>
    request('/api/posts', {
      method: 'POST',
      body: JSON.stringify({ content, image_url: image_url || null })
    }),

  deletePost: (postId) =>
    request(`/api/posts/${postId}`, {
      method: 'DELETE'
    }),

  toggleLike: (postId) =>
    request(`/api/posts/${postId}/like`, {
      method: 'POST'
    }),

  addComment: (postId, content) =>
    request(`/api/posts/${postId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content })
    }),

  getDashboardStats: () => request('/api/dashboard/stats')
};
