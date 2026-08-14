// Ref: RNF-008, B-001, B-011, B2-001..B2-011, ADR2-003
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function getAuthHeaders(isFormData = false) {
  const token = localStorage.getItem('nexora_token');
  const headers = {};
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function request(endpoint, options = {}, timeoutMs = 10000) {
  const url = `${API_URL}${endpoint}`;
  const isFormData = options.body instanceof FormData;
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  const config = {
    ...options,
    signal: controller.signal,
    headers: {
      ...getAuthHeaders(isFormData),
      ...(options.headers || {})
    }
  };

  try {
    const response = await fetch(url, config);
    clearTimeout(timeoutId);

    if (response.status === 204) {
      return null;
    }

    if (response.status === 401 && endpoint !== '/api/auth/login' && endpoint !== '/api/auth/me') {
      // Clear expired token if 401 occurs on protected routes
      localStorage.removeItem('nexora_token');
    }

    let data;
    try {
      data = await response.json();
    } catch {
      data = {};
    }

    if (!response.ok) {
      const errorMsg = data.detail || `Error en el servidor Nexora (HTTP ${response.status}).`;
      const error = new Error(errorMsg);
      error.status = response.status;
      error.detail = data.detail;
      throw error;
    }

    return data;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('La solicitud excedió el tiempo de espera (timeout). Por favor reintenta.');
    }
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      throw new Error('Fallo de conexión con el servidor Nexora. Revisa tu red.');
    }
    throw error;
  }
}

export const api = {
  // Auth
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

  // Password Reset (Task 35, 36)
  requestPasswordReset: (email_or_phone) =>
    request('/api/auth/password-reset/request', {
      method: 'POST',
      body: JSON.stringify({ email_or_phone })
    }),

  verifyPasswordReset: (email_or_phone, otp_code) =>
    request('/api/auth/password-reset/verify', {
      method: 'POST',
      body: JSON.stringify({ email_or_phone, otp_code })
    }),

  confirmPasswordReset: (email_or_phone, reset_token, new_password) =>
    request('/api/auth/password-reset/confirm', {
      method: 'POST',
      body: JSON.stringify({ email_or_phone, reset_token, new_password })
    }),

  // Users & Profiles (Task 25, 26)
  getProfile: () => request('/api/users/me'),

  updateProfile: (profileData) =>
    request('/api/users/me', {
      method: 'PUT',
      body: JSON.stringify(profileData)
    }),

  searchUsers: (query) =>
    request(`/api/users/search?q=${encodeURIComponent(query)}`),

  getPublicProfile: (userId) =>
    request(`/api/users/${userId}`),

  getUserPosts: (userId) =>
    request(`/api/users/${userId}/posts`),

  getUserFollowers: (userId) =>
    request(`/api/users/${userId}/followers`),

  getUserFollowing: (userId) =>
    request(`/api/users/${userId}/following`),

  followUser: (userId) =>
    request(`/api/users/${userId}/follow`, { method: 'POST' }),

  unfollowUser: (userId) =>
    request(`/api/users/${userId}/follow`, { method: 'DELETE' }),

  // Posts & Feed (Task 28, 29, 30)
  getPosts: (scope = 'all') =>
    request(`/api/posts?scope=${scope}`),

  createPost: (content, image_url, image_public_id = null) =>
    request('/api/posts', {
      method: 'POST',
      body: JSON.stringify({ content, image_url: image_url || null, image_public_id: image_public_id || null })
    }),

  createPostWithImage: (content, file) => {
    const formData = new FormData();
    formData.append('content', content);
    if (file) {
      formData.append('file', file);
    }
    return request('/api/posts/with-image', {
      method: 'POST',
      body: formData
    });
  },

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

  // Uploads
  uploadAvatar: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return request('/api/uploads/avatar', {
      method: 'POST',
      body: formData
    });
  },

  uploadPostImage: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return request('/api/uploads/post-image', {
      method: 'POST',
      body: formData
    });
  },

  // Conversations & Direct Messages (Task 18, 19)
  getConversations: () =>
    request('/api/conversations'),

  getOrCreateConversation: (otherUserId) =>
    request(`/api/conversations/${otherUserId}`, { method: 'POST' }),

  getMessages: (conversationId) =>
    request(`/api/conversations/${conversationId}/messages`),

  sendMessage: (conversationId, content) =>
    request(`/api/conversations/${conversationId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content })
    }),

  markConversationRead: (conversationId) =>
    request(`/api/conversations/${conversationId}/read`, { method: 'POST' }),

  // Notifications (Task 23)
  getNotifications: () =>
    request('/api/notifications'),

  getUnreadNotificationCount: () =>
    request('/api/notifications/unread-count'),

  getUnreadNotificationsCount: () =>
    request('/api/notifications/unread-count'),

  markNotificationRead: (id) =>
    request(`/api/notifications/${id}/read`, { method: 'POST' }),

  markAllNotificationsRead: () =>
    request('/api/notifications/read-all', { method: 'POST' }),

  // WebSockets Ticket Auth
  createWsTicket: () =>
    request('/api/ws/ticket', { method: 'POST' }),

  // Dashboard
  getDashboardStats: () => request('/api/dashboard/stats')
};
