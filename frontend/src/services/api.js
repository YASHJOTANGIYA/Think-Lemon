import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.MODE === 'production' ? '/api' : 'http://localhost:5000/api');

const api = axios.create({
    baseURL: API_URL,
    headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) config.headers.Authorization = `Bearer ${token}`;
        return config;
    },
    (error) => Promise.reject(error)
);

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

export const authAPI = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    googleLogin: (data) => api.post('/auth/google', data),
};

export const productsAPI = {
    getAll: (params) => api.get('/products', { params }),
    getBySlug: (slug) => api.get(`/products/${slug}`),
    create: (data) => api.post('/products', data),
    update: (id, data) => api.put(`/products/${id}`, data),
    delete: (id) => api.delete(`/products/${id}`),
};

export const categoriesAPI = {
    getAll: () => api.get('/categories'),
    getBySlug: (slug) => api.get(`/categories/${slug}`),
    create: (data) => api.post('/categories', data),
    update: (id, data) => api.put(`/categories/${id}`, data),
    delete: (id) => api.delete(`/categories/${id}`),
};

export const cartAPI = {
    get: () => api.get('/cart'),
    add: (data) => api.post('/cart/add', data),
    update: (itemId, data) => api.put(`/cart/update/${itemId}`, data),
    remove: (itemId) => api.delete(`/cart/remove/${itemId}`),
    clear: () => api.delete('/cart/clear'),
};

export const ordersAPI = {
    create: (data) => api.post('/orders', data),
    getAll: () => api.get('/orders'),
    getMyOrders: () => api.get('/orders'),
    getById: (id) => api.get(`/orders/${id}`),
    track: (orderNumber) => api.get(`/orders/track/${orderNumber}`),
    updateStatus: (id, data) => api.put(`/orders/${id}/status`, data),
    getAllAdmin: (params) => api.get('/orders/admin/all', { params }),
    payBalance: (id, paymentInfo) => api.put(`/orders/${id}/pay-balance`, { paymentInfo }),
    ship: (id, data) => api.post(`/orders/${id}/ship`, data),
};

export const usersAPI = {
    getProfile: () => api.get('/users/profile'),
    updateProfile: (data) => api.put('/users/profile', data),
    getAllAdmin: () => api.get('/users/admin/all'),
};

export const reviewsAPI = {
    getByProduct: (productId) => api.get(`/reviews/${productId}`),
    create: (data) => api.post('/reviews', data),
};

export const inquiriesAPI = {
    create: (data) => api.post('/inquiries', data),
    getAll: () => api.get('/inquiries'),
    updateStatus: (id, status) => api.put(`/inquiries/${id}`, { status }),
};

export const pincodesAPI = {
    check: (pincode) => api.get(`/pincodes/${pincode}`),
};

export const wishlistAPI = {
    get: () => api.get('/wishlist'),
    add: (productId) => api.post(`/wishlist/add/${productId}`),
    remove: (productId) => api.delete(`/wishlist/remove/${productId}`),
    check: (productId) => api.get(`/wishlist/check/${productId}`),
};

export const paymentAPI = {
    createOrder: (data) => api.post('/payment/create-order', data),
    verify: (data) => api.post('/payment/verify', data),
};

export const uploadAPI = {
    upload: (formData) => api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
};

export default api;
