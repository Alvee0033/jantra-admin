import axios from 'axios';

const getBaseUrl = () => {
    let url = process.env.NEXT_PUBLIC_API_URL;

    if (!url) {
        // Fallback for build time / server side
        if (typeof window === 'undefined') {
            url = 'https://jontro-backend.onrender.com';
        } else if (window.location.hostname !== 'localhost') {
            url = 'https://jontro-backend.onrender.com';
        } else {
            url = 'http://127.0.0.1:4005';
        }
    }

    // Ensure /api suffix
    return url.endsWith('/api') ? url : `${url}/api`;
};

const API_BASE_URL = getBaseUrl();

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 15000,
});

// Request interceptor to add JWT token
api.interceptors.request.use((config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('jantra_admin_token') : null;
    if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Force session reset on unauthorized responses so admin UI does not fail silently.
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error?.response?.status;
        if (typeof window !== 'undefined' && (status === 401 || status === 403)) {
            const pathname = window.location.pathname || '';
            const inAdmin = pathname.startsWith('/admin');
            const inEmployeeReport = pathname.startsWith('/report');

            if (inAdmin) {
                localStorage.removeItem('jantra_admin_token');
                localStorage.removeItem('jantra_admin_user');
                if (pathname !== '/admin/login') {
                    window.location.href = '/admin/login';
                }
            } else if (inEmployeeReport) {
                localStorage.removeItem('jantra_employee_token');
                localStorage.removeItem('jantra_employee_user');
            }
        }
        return Promise.reject(error);
    }
);

export default api;
