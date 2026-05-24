import api from './api';

// Projects
export const projectService = {
  getAll: () => api.get('/projects'),
  getOne: (id) => api.get(`/projects/${id}`),
  create: (data) => api.post('/projects', data),
  update: (id, data) => api.put(`/projects/${id}`, data),
  delete: (id) => api.delete(`/projects/${id}`),
  addMember: (id, email) => api.post(`/projects/${id}/members`, { email }),
  removeMember: (id, userId) => api.delete(`/projects/${id}/members/${userId}`),
};

// Tasks
export const taskService = {
  getAll: (params) => api.get('/tasks', { params }),
  getOne: (id) => api.get(`/tasks/${id}`),
  create: (data) => api.post('/tasks', data),
  update: (id, data) => api.put(`/tasks/${id}`, data),
  delete: (id) => api.delete(`/tasks/${id}`),
  addComment: (id, text) => api.post(`/tasks/${id}/comments`, { text }),
  getStats: () => api.get('/tasks/stats'),
};

// Users
export const userService = {
  getAll: () => api.get('/users'),
  getOne: (id) => api.get(`/users/${id}`),
  updateRole: (id, role) => api.put(`/users/${id}/role`, { role }),
  delete: (id) => api.delete(`/users/${id}`),
};

// Activity
export const activityService = {
  getAll: (params) => api.get('/activity', { params }),
};
