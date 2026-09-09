import { api } from './client';
import { tokenStorage } from './tokenStorage';

// Paths may be written with or without the /api prefix; the client normalises
// them. They are spelled with it here to match the backend's route table.

export const AuthAPI = {
  register: async (payload) => {
    const body = await api.authPost('/api/auth/register', payload);
    tokenStorage.setTokens(body.token, body.refreshToken);
    return body.data.user;
  },

  login: async (email, password) => {
    const body = await api.authPost('/api/auth/login', { email, password });
    tokenStorage.setTokens(body.token, body.refreshToken);
    return body.data.user;
  },

  // Revokes the refresh token server-side, then clears local state whatever
  // the response was: a failed logout must not leave the user seemingly signed in
  logout: async () => {
    const refreshToken = tokenStorage.getRefresh();
    try {
      if (refreshToken) await api.post('/api/auth/logout', { refreshToken });
    } finally {
      tokenStorage.clear();
    }
  },

  getMe: () => api.get('/api/auth/me').then((data) => data.user),
};

// Turns { category, minPrice, maxPrice, inStock, q, sort, page, limit } into a
// query string, dropping anything empty
function queryString(params = {}) {
  const search = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      search.append(key, value);
    }
  });

  const qs = search.toString();
  return qs ? `?${qs}` : '';
}

export const ProductsAPI = {
  // Resolves to { products, results, total, page, pages } - the pagination
  // fields live outside `data`, so this one reads the full envelope
  list: async (params) => {
    const body = await api.rawGet(`/api/products${queryString(params)}`);
    return {
      products: body.data.products,
      results: body.results,
      total: body.total,
      page: body.page,
      pages: body.pages,
    };
  },

  get: (id) => api.get(`/api/products/${id}`).then((data) => data.product),

  // Admin only
  create: (payload) => api.post('/api/products', payload).then((data) => data.product),
  update: (id, payload) => api.put(`/api/products/${id}`, payload).then((data) => data.product),
  remove: (id) => api.delete(`/api/products/${id}`),
};

export const CategoriesAPI = {
  list: () => api.get('/api/categories').then((data) => data.categories),
  get: (id) => api.get(`/api/categories/${id}`).then((data) => data.category),

  // Admin only
  create: (payload) => api.post('/api/categories', payload).then((data) => data.category),
  update: (id, payload) => api.put(`/api/categories/${id}`, payload).then((data) => data.category),
  remove: (id) => api.delete(`/api/categories/${id}`),
};

export const CartAPI = {
  // Resolves to { cart, itemCount, subtotal } - totals sit outside `data`
  get: async () => {
    const body = await api.rawGet('/api/cart');
    return { cart: body.data.cart, itemCount: body.itemCount, subtotal: body.subtotal };
  },

  addItem: async (productId, quantity = 1) => {
    const body = await api.rawPost('/api/cart/items', { productId, quantity });
    return { cart: body.data.cart, itemCount: body.itemCount, subtotal: body.subtotal };
  },

  setQuantity: async (productId, quantity) => {
    const body = await api.rawPut(`/api/cart/items/${productId}`, { quantity });
    return { cart: body.data.cart, itemCount: body.itemCount, subtotal: body.subtotal };
  },

  removeItem: async (productId) => {
    const body = await api.rawDelete('/api/cart/items', { productId });
    return { cart: body.data.cart, itemCount: body.itemCount, subtotal: body.subtotal };
  },
};

export const OrdersAPI = {
  checkout: () => api.post('/api/orders').then((data) => data.order),
  list: () => api.get('/api/orders').then((data) => data.orders),
  get: (id) => api.get(`/api/orders/${id}`).then((data) => data.order),

  // Admin only
  setStatus: (id, orderStatus) =>
    api.put(`/api/orders/${id}/status`, { orderStatus }).then((data) => data.order),
};
