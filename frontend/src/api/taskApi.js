import { apiClient } from './apiClient';

export const taskApi = {
  getTasks: async ({ page = 0, size = 50, search = '', status = 'All' } = {}) => {
    const params = new URLSearchParams({ page, size });
    if (search) params.append('search', search);
    if (status && status !== 'All') params.append('status', status);
    const res = await apiClient(`/tasks?${params.toString()}`);
    return res;
  },

  getTaskById: async (id) => {
    const res = await apiClient(`/tasks/${id}`);
    return res.data;
  },

  createTask: async (taskData) => {
    const res = await apiClient('/tasks', {
      method: 'POST',
      body: taskData
    });
    return res.data;
  },

  updateTask: async (id, taskData) => {
    const res = await apiClient(`/tasks/${id}`, {
      method: 'PUT',
      body: taskData
    });
    return res.data;
  },

  toggleTaskStatus: async (id) => {
    const res = await apiClient(`/tasks/${id}/toggle`, {
      method: 'PATCH'
    });
    return res.data;
  },

  deleteTask: async (id) => {
    const res = await apiClient(`/tasks/${id}`, {
      method: 'DELETE'
    });
    return res.data;
  }
};
