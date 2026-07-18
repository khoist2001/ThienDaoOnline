// API Client Service connecting React Frontend to Laravel 12 Backend API Server

const API_BASE_URL = 'http://localhost:8000/api';

let authToken = typeof window !== 'undefined' ? localStorage.getItem('thien_dao_token') || '' : '';

const setAuthToken = (token: string) => {
  authToken = token;
  if (typeof window !== 'undefined') {
    if (token) {
      localStorage.setItem('thien_dao_token', token);
    } else {
      localStorage.removeItem('thien_dao_token');
    }
  }
};

const request = async (path: string, options: RequestInit = {}) => {
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');
  if (authToken) headers.set('Authorization', `Bearer ${authToken}`);

  const res = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Yêu cầu API thất bại');
  return data;
};

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
      const data = await request('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, name, password }),
      });
      if (data.token) setAuthToken(data.token);
      return data;
    } catch (e) {
      console.warn('Backend API offline');
      return null;
    }
  },

  async login(email: string, password?: string) {
    try {
      const data = await request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      if (data.token) setAuthToken(data.token);
      return data;
    } catch (e) {
      console.warn('Backend API offline or login failed');
      return null;
    }
  },

  async saveGameState(gameState: unknown) {
    if (!authToken) return null;
    try {
      return await request('/game-state', {
        method: 'PUT',
        body: JSON.stringify({ gameState }),
      });
    } catch (e) {
      console.warn('Khong the dong bo tien trinh len may chu', e);
      return null;
    }
  },

  clearSession() {
    setAuthToken('');
  },

  async getAnnouncement() {
    try {
      return await request('/announcements/latest');
    } catch (e) {
      return null;
    }
  },

  // Admin User CRUD API
  async getUsers() {
    try {
      return await request('/admin/users');
    } catch (e) {
      return null;
    }
  },

  async createUser(userData: any) {
    try {
      return await request('/admin/users', {
        method: 'POST',
        body: JSON.stringify(userData),
      });
    } catch (e) {
      return null;
    }
  },

  async updateUser(id: string, userData: any) {
    try {
      return await request(`/admin/users/${id}`, {
        method: 'PUT',
        body: JSON.stringify(userData),
      });
    } catch (e) {
      return null;
    }
  },

  async deleteUser(id: string) {
    try {
      return await request(`/admin/users/${id}`, {
        method: 'DELETE',
      });
    } catch (e) {
      return null;
    }
  },

  async broadcastAnnouncement(content: string) {
    try {
      return await request('/admin/broadcast', {
        method: 'POST',
        body: JSON.stringify({ content }),
      });
    } catch (e) {
      return null;
    }
  },

  // ── Guild API ──
  async getGuilds() {
    try { return await request('/guilds'); } catch (e) { return null; }
  },

  async createGuild(name: string) {
    try {
      return await request('/guilds', { method: 'POST', body: JSON.stringify({ name }) });
    } catch (e: any) {
      return { status: 'error', message: e.message };
    }
  },

  async getGuildDetail(guildId: number) {
    try { return await request(`/guilds/${guildId}`); } catch (e) { return null; }
  },

  async requestJoinGuild(guildId: number) {
    try {
      return await request(`/guilds/${guildId}/join`, { method: 'POST' });
    } catch (e: any) {
      return { status: 'error', message: e.message };
    }
  },

  async handleGuildRequest(guildId: number, requestId: number, action: 'accept' | 'reject') {
    try {
      return await request(`/guilds/${guildId}/requests/${requestId}`, {
        method: 'PUT',
        body: JSON.stringify({ action }),
      });
    } catch (e: any) {
      return { status: 'error', message: e.message };
    }
  },

  async updateMemberRole(guildId: number, userId: number, role: string) {
    try {
      return await request(`/guilds/${guildId}/members/${userId}`, {
        method: 'PUT',
        body: JSON.stringify({ role }),
      });
    } catch (e: any) {
      return { status: 'error', message: e.message };
    }
  },
};
