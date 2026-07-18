// API Client Service connecting React Frontend to Laravel 12 Backend API Server

const API_BASE_URL = 'http://localhost:8000/api';

export const apiClient = {
  // Health check
  async checkHealth() {
    try {
      const res = await fetch(`${API_BASE_URL}/health`);
      return await res.json();
    } catch (e) {
      return { status: 'offline', message: 'Backend server offline (Fallback to Local Engine)' };
    }
  },

  // Auth API
  async register(email: string, name?: string, password?: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, password }),
      });
      return await res.json();
    } catch (e) {
      console.warn('Backend API offline');
      return null;
    }
  },

  async login(email: string, password?: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      return await res.json();
    } catch (e) {
      console.warn('Backend API offline, using local client login logic');
      return null;
    }
  },

  // Admin User CRUD API
  async getUsers() {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/users`);
      return await res.json();
    } catch (e) {
      return null;
    }
  },

  async createUser(userData: any) {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      return await res.json();
    } catch (e) {
      return null;
    }
  },

  async updateUser(id: string, userData: any) {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      return await res.json();
    } catch (e) {
      return null;
    }
  },

  async deleteUser(id: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/users/${id}`, {
        method: 'DELETE',
      });
      return await res.json();
    } catch (e) {
      return null;
    }
  },

  async broadcastAnnouncement(content: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/broadcast`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      return await res.json();
    } catch (e) {
      return null;
    }
  },
};
