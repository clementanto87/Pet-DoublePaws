import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001/api',
});

// Always attach the latest token from storage if available
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token && !config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle expired or invalid session errors automatically
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status;
        const message = error.response?.data?.message;

        if (status === 401 || (status === 403 && (message === 'Invalid token' || message === 'Access token required' || message === 'Token expired'))) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            delete api.defaults.headers.common['Authorization'];

            if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('auth:expired'));
            }
        }
        return Promise.reject(error);
    }
);

export default api;
