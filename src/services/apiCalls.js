import API from './api';

export const authAPI = {
  login: (email, password) => API.post('/auth/login', { email, password }),
  signup: (data) => API.post('/auth/signup', data),
  googleAuth: (idToken) => API.post('/auth/google', { idToken }),
};

export const medicineAPI = {
  getAllMedicines: (search, category) =>
    API.get('/medicines', { params: { search, category } }),
  getMedicineById: (id) => API.get(`/medicines/${id}`),
  addMedicine: (data) => API.post('/medicines', data),
  updateMedicine: (id, data) => API.put(`/medicines/${id}`, data),
  deleteMedicine: (id) => API.delete(`/medicines/${id}`),
};

export const orderAPI = {
  getAllOrders: (search, paymentMethod, sortBy) =>
    API.get('/orders', { params: { search, paymentMethod, sortBy } }),
  getOrderById: (id) => API.get(`/orders/${id}`),
  createOrder: (data) => API.post('/orders', data),
  updateOrder: (id, data) => API.put(`/orders/${id}`, data),
  deleteOrder: (id) => API.delete(`/orders/${id}`),
  getOrderStats: () => API.get('/orders/stats'),
};

export const cartAPI = {
  getCart: () => API.get('/cart'),
  saveCart: (data) => API.put('/cart', data),
  clearCart: () => API.delete('/cart'),
};

export const adminAPI = {
  getDashboardStats: () => API.get('/admin/dashboard/stats'),
};
