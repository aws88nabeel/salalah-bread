import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export interface User {
  id: string;
  phone: string;
  name: string;
  role: string;
}

export interface MenuCategory {
  id: string;
  nameAr: string;
  nameEn: string;
  items: MenuItem[];
}

export interface MenuItem {
  id: string;
  categoryId: string;
  nameAr: string;
  nameEn: string;
  description: string | null;
  price: string;
  imageUrl: string | null;
  maxPerOrder: number;
  isActive: boolean;
}

export interface TimeSlot {
  id: string;
  labelAr: string;
  labelEn: string;
  slotStart: string;
  slotEnd: string;
  maxOrders: number;
  isActive: boolean;
  remainingCapacity: number;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  deliveryLat: string;
  deliveryLng: string;
  deliveryAddress: string;
  slotId: string;
  deliveryDate: string;
  status: string;
  notes: string | null;
  totalAmount: string;
  createdAt: string;
  items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  orderId: string;
  menuItemId: string;
  quantity: number;
  unitPrice: string;
  subtotal: string;
}

export const authApi = {
  register: (data: { phone: string; name: string; password: string }) =>
    api.post('/auth/register', data),
  login: (data: { phone: string; password: string }) =>
    api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
};

export const menuApi = {
  getAll: () => api.get<MenuCategory[]>('/menu'),
};

export const locationApi = {
  validate: (lat: number, lng: number) =>
    api.post<{ isDeliverable: boolean }>('/location/validate', { lat, lng }),
  getZone: () => api.get('/location/zone'),
};

export const slotsApi = {
  getAvailable: (date: string) =>
    api.get<TimeSlot[]>(`/slots?date=${date}`),
};

export const ordersApi = {
  create: (data: any) => api.post<Order>('/orders', data),
  getMyOrders: () => api.get<Order[]>('/orders'),
  getById: (id: string) => api.get<Order>(`/orders/${id}`),
};

export const adminApi = {
  getOrders: (status?: string) =>
    api.get<Order[]>(`/admin/orders${status ? `?status=${status}` : ''}`),
  getOrderById: (id: string) => api.get(`/admin/orders/${id}`),
  updateStatus: (id: string, status: string) =>
    api.patch(`/admin/orders/${id}/status`, { status }),
  getStats: () => api.get('/admin/stats'),
};
