import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

// Create axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Types
export interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  billingAddress?: string;
  taxId?: string;
  notes?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  name: string;
  code: string;
  description?: string;
  status: 'PLANNED' | 'ACTIVE' | 'ON_HOLD' | 'COMPLETED' | 'CANCELLED';
  budgetHours?: number;
  budgetAmount?: number;
  hourlyRate?: number;
  startDate?: string;
  endDate?: string;
  color?: string;
  client?: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  tags: string[];
  dueDate?: string;
  estimatedHours?: number;
  orderIndex: number;
  project: {
    id: string;
    name: string;
    code: string;
  };
  assignees: Array<{
    id: string;
    name: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface TimesheetEntry {
  id: string;
  date: string;
  minutes: number;
  billable: boolean;
  hourlyRate?: number;
  notes?: string;
  project: {
    id: string;
    name: string;
    code: string;
  };
  task?: {
    id: string;
    title: string;
  };
  user: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

// Auth API
export const authAPI = {
  login: (credentials: { email: string; password: string }) =>
    api.post('/auth/login', credentials),
  
  register: (data: {
    organizationName: string;
    adminName: string;
    email: string;
    password: string;
  }) => api.post('/auth/register', data),
};

// Organizations API
export const organizationsAPI = {
  getCurrent: () => api.get('/org'),
};

// Users API
export const usersAPI = {
  getAll: () => api.get('/users'),
  getById: (id: string) => api.get(`/users/${id}`),
};

// Clients API
export const clientsAPI = {
  getAll: (params?: {
    page?: number;
    limit?: number;
    search?: string;
  }) => api.get('/clients', { params }),
  
  getById: (id: string) => api.get(`/clients/${id}`),
  
  create: (data: Partial<Client>) => api.post('/clients', data),
  
  update: (id: string, data: Partial<Client>) => 
    api.patch(`/clients/${id}`, data),
  
  delete: (id: string) => api.delete(`/clients/${id}`),
};

// Projects API
export const projectsAPI = {
  getAll: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    clientId?: string;
  }) => api.get('/projects', { params }),
  
  getById: (id: string) => api.get(`/projects/${id}`),
  
  getSummary: (id: string) => api.get(`/projects/${id}/summary`),
  
  create: (data: Partial<Project>) => api.post('/projects', data),
  
  update: (id: string, data: Partial<Project>) => 
    api.patch(`/projects/${id}`, data),
  
  delete: (id: string) => api.delete(`/projects/${id}`),
};

// Tasks API
export const tasksAPI = {
  getAll: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    projectId?: string;
    status?: string;
    assigneeId?: string;
  }) => api.get('/tasks', { params }),
  
  getKanban: (projectId: string) => api.get(`/tasks/kanban/${projectId}`),
  
  getById: (id: string) => api.get(`/tasks/${id}`),
  
  create: (data: Partial<Task>) => api.post('/tasks', data),
  
  update: (id: string, data: Partial<Task>) => 
    api.patch(`/tasks/${id}`, data),
  
  updateOrder: (tasks: Array<{ id: string; orderIndex: number }>) =>
    api.patch('/tasks/order', { tasks }),
  
  delete: (id: string) => api.delete(`/tasks/${id}`),
};

// Timesheets API
export const timesheetsAPI = {
  getAll: (params?: {
    page?: number;
    limit?: number;
    userId?: string;
    projectId?: string;
    from?: string;
    to?: string;
  }) => api.get('/timesheets', { params }),
  
  getWeekly: (params?: {
    userId?: string;
    weekStart?: string;
  }) => api.get('/timesheets/weekly', { params }),
  
  getById: (id: string) => api.get(`/timesheets/${id}`),
  
  create: (data: Partial<TimesheetEntry>) => api.post('/timesheets', data),
  
  update: (id: string, data: Partial<TimesheetEntry>) => 
    api.patch(`/timesheets/${id}`, data),
  
  delete: (id: string) => api.delete(`/timesheets/${id}`),
};