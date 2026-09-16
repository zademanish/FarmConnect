import api from "./api";

export const authApi = {
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
  me: () => api.get("/auth/me"),
};

export const userApi = {
  updateProfile: (formData) =>
    api.put("/users/profile", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  changePassword: (data) => api.put("/users/change-password", data),
  farmerPublic: (id) => api.get(`/users/farmers/${id}`),
  farmerDashboard: () => api.get("/users/farmer/dashboard"),
  buyerDashboard: () => api.get("/users/buyer/dashboard"),
};

export const categoryApi = {
  list: () => api.get("/categories"),
  create: (formData) => api.post("/categories", formData),
  update: (id, formData) => api.put(`/categories/${id}`, formData),
  remove: (id) => api.delete(`/categories/${id}`),
};

export const productApi = {
  list: (params) => api.get("/products", { params }),
  detail: (id) => api.get(`/products/${id}`),
  home: () => api.get("/products/home/featured"),
  mine: (params) => api.get("/products/farmer/my-products", { params }),
  create: (formData) =>
    api.post("/products", formData, { headers: { "Content-Type": "multipart/form-data" } }),
  update: (id, formData) =>
    api.put(`/products/${id}`, formData, { headers: { "Content-Type": "multipart/form-data" } }),
  remove: (id) => api.delete(`/products/${id}`),
};

export const requestApi = {
  create: (data) => api.post("/purchase-requests", data),
  list: (params) => api.get("/purchase-requests", { params }),
  detail: (id) => api.get(`/purchase-requests/${id}`),
  updateStatus: (id, status) => api.put(`/purchase-requests/${id}`, { status }),
};

export const orderApi = {
  list: (params) => api.get("/orders", { params }),
  detail: (id) => api.get(`/orders/${id}`),
  updateStatus: (id, data) => api.put(`/orders/${id}/status`, data),
  assignWorker: (id, deliveryWorkerId) =>
    api.put(`/orders/${id}/assign-worker`, { deliveryWorkerId }),
};

export const workerApi = {
  list: (params) => api.get("/delivery-workers", { params }),
  detail: (id) => api.get(`/delivery-workers/${id}`),
  create: (data) => api.post("/delivery-workers", data),
  update: (id, data) => api.put(`/delivery-workers/${id}`, data),
  remove: (id) => api.delete(`/delivery-workers/${id}`),
};

export const reviewApi = {
  create: (data) => api.post("/reviews", data),
  list: () => api.get("/reviews"),
  byProduct: (productId) => api.get(`/reviews/product/${productId}`),
  update: (id, data) => api.put(`/reviews/${id}`, data),
  remove: (id) => api.delete(`/reviews/${id}`),
};

export const complaintApi = {
  create: (data) => api.post("/complaints", data),
  list: (params) => api.get("/complaints", { params }),
  detail: (id) => api.get(`/complaints/${id}`),
  update: (id, data) => api.put(`/complaints/${id}`, data),
};

export const adminApi = {
  stats: () => api.get("/admin/stats"),
  users: (params) => api.get("/admin/users", { params }),
  userDetails: (id) => api.get(`/admin/users/${id}`),
  toggleStatus: (id) => api.put(`/admin/users/${id}/status`),
  removeUser: (id) => api.delete(`/admin/users/${id}`),
  products: (params) => api.get("/admin/products", { params }),
  updateApproval: (id, data) => api.put(`/admin/products/${id}/approval`, data),
};
