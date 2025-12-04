import axios from 'axios';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for auth token
api.interceptors.request.use(
  async (config) => {
    // Get token from AsyncStorage and add to headers
    // const token = await AsyncStorage.getItem('authToken');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - redirect to login
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const authService = {
  login: (email: string, password: string) => 
    api.post('/auth/login', { email, password }),
  
  register: (data: { email: string; password: string; name: string }) => 
    api.post('/auth/register', data),
  
  logout: () => api.post('/auth/logout'),
  
  getProfile: () => api.get('/auth/profile'),
};

// Sitter endpoints
export const sitterService = {
  search: (params: {
    location?: string;
    service?: string;
    petType?: string;
    startDate?: string;
    endDate?: string;
  }) => api.get('/sitters/search', { params }),
  
  getById: (id: string) => api.get(`/sitters/${id}`),
  
  getReviews: (id: string) => api.get(`/sitters/${id}/reviews`),
};

// Booking endpoints
export const bookingService = {
  create: (data: {
    sitterId: string;
    service: string;
    startDate: string;
    endDate: string;
    pets: string[];
    message?: string;
  }) => api.post('/bookings', data),
  
  getMyBookings: () => api.get('/bookings/my'),
  
  getById: (id: string) => api.get(`/bookings/${id}`),
  
  cancel: (id: string) => api.put(`/bookings/${id}/cancel`),
};

// Pet endpoints
export const petService = {
  getMyPets: () => api.get('/pets/my'),
  
  create: (data: {
    name: string;
    type: string;
    breed?: string;
    age?: number;
    weight?: number;
    notes?: string;
  }) => api.post('/pets', data),
  
  update: (id: string, data: any) => api.put(`/pets/${id}`, data),
  
  delete: (id: string) => api.delete(`/pets/${id}`),
};

export default api;

