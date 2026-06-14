import axios from 'axios';

const API_BASE = '/api/v1';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && error.response?.data?.code === 'TOKEN_EXPIRED' && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) throw new Error('No refresh token');

        const { data } = await axios.post(`${API_BASE}/auth/refresh`, { refreshToken });
        localStorage.setItem('accessToken', data.data.accessToken);
        localStorage.setItem('refreshToken', data.data.refreshToken);
        originalRequest.headers.Authorization = `Bearer ${data.data.accessToken}`;
        return api(originalRequest);
      } catch {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);

export default api;

export const authAPI = {
  register: (data: any) => api.post('/auth/register', data),
  login: (data: any) => api.post('/auth/login', data),
  logout: (refreshToken: string) => api.post('/auth/logout', { refreshToken }),
  refreshToken: (refreshToken: string) => api.post('/auth/refresh', { refreshToken }),
  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token: string, password: string) => api.post('/auth/reset-password', { token, password }),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data: any) => api.put('/auth/profile', data),
  changePassword: (currentPassword: string, newPassword: string) => api.put('/auth/change-password', { currentPassword, newPassword }),
};

export const chatAPI = {
  getConversations: () => api.get('/chat/conversations'),
  getMessages: (conversationId: string, params?: any) => api.get(`/chat/conversations/${conversationId}/messages`, { params }),
  sendMessage: (conversationId: string, data: any) => api.post(`/chat/conversations/${conversationId}/messages`, data),
  createDirectConversation: (userId: string) => api.post('/chat/conversations/direct', { userId }),
  createGroupConversation: (data: any) => api.post('/chat/conversations/group', data),
  addReaction: (messageId: string, emoji: string) => api.post(`/chat/messages/${messageId}/reactions`, { emoji }),
  removeReaction: (messageId: string, emoji: string) => api.delete(`/chat/messages/${messageId}/reactions`, { data: { emoji } }),
  pinMessage: (messageId: string) => api.post(`/chat/messages/${messageId}/pin`),
  searchMessages: (conversationId: string, q: string) => api.get(`/chat/conversations/${conversationId}/search`, { params: { q } }),
};

export const fileAPI = {
  upload: (formData: FormData) => api.post('/files', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  uploadMultiple: (formData: FormData) => api.post('/files/multiple', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getFiles: (params?: any) => api.get('/files', { params }),
  getFile: (id: string) => api.get(`/files/${id}`),
  deleteFile: (id: string) => api.delete(`/files/${id}`),
  getCategories: () => api.get('/files/categories'),
  getTags: () => api.get('/files/tags'),
  searchFiles: (q: string) => api.get('/files/search', { params: { q } }),
};

export const teamAPI = {
  getTeams: () => api.get('/teams'),
  getTeam: (id: string) => api.get(`/teams/${id}`),
  createTeam: (data: any) => api.post('/teams', data),
  updateTeam: (id: string, data: any) => api.put(`/teams/${id}`, data),
  inviteMember: (teamId: string, email: string) => api.post(`/teams/${teamId}/invite`, { email }),
  acceptInvitation: (token: string) => api.get(`/teams/invitations/accept`, { params: { token } }),
  removeMember: (teamId: string, memberId: string) => api.delete(`/teams/${teamId}/members/${memberId}`),
  getAnalytics: (teamId: string) => api.get(`/teams/${teamId}/analytics`),
};

export const projectAPI = {
  getProjects: (params?: any) => api.get('/projects', { params }),
  getProject: (id: string) => api.get(`/projects/${id}`),
  createProject: (data: any) => api.post('/projects', data),
  updateProject: (id: string, data: any) => api.put(`/projects/${id}`, data),
  deleteProject: (id: string) => api.delete(`/projects/${id}`),
  getTasks: (projectId: string, params?: any) => api.get(`/projects/${projectId}/tasks`, { params }),
  createTask: (projectId: string, data: any) => api.post(`/projects/${projectId}/tasks`, data),
  updateTask: (taskId: string, data: any) => api.put(`/projects/tasks/${taskId}`, data),
  deleteTask: (taskId: string) => api.delete(`/projects/tasks/${taskId}`),
  addComment: (taskId: string, content: string) => api.post(`/projects/tasks/${taskId}/comments`, { content }),
  addMember: (projectId: string, userId: string, role?: string) => api.post(`/projects/${projectId}/members`, { userId, role }),
  getAnalytics: (projectId: string) => api.get(`/projects/${projectId}/analytics`),
};

export const notificationAPI = {
  getNotifications: (params?: any) => api.get('/notifications', { params }),
  markAsRead: (id: string) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
  getSettings: () => api.get('/notifications/settings'),
  updateSettings: (data: any) => api.put('/notifications/settings', data),
};

export const adminAPI = {
  getUsers: (params?: any) => api.get('/admin/users', { params }),
  updateUserRole: (userId: string, role: string) => api.put(`/admin/users/${userId}/role`, { role }),
  deleteUser: (userId: string) => api.delete(`/admin/users/${userId}`),
  getDashboard: () => api.get('/admin/dashboard'),
  getLogs: (params?: any) => api.get('/admin/logs', { params }),
  search: (q: string) => api.get('/admin/search', { params: { q } }),
};
