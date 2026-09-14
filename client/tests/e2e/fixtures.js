// Shared API doubles for the end-to-end specs. The browser and the real
// application bundle are exercised; only the network is stubbed, so these run
// without a database or a running backend.

export const ADMIN = {
  _id: 'u1',
  firstName: 'Site',
  lastName: 'Administrator',
  email: 'admin@ecommerce.local',
  role: 'admin',
};

export const CUSTOMER = {
  _id: 'u2',
  firstName: 'Hanré',
  lastName: 'Koen',
  email: 'hanre@example.co.za',
  role: 'customer',
};

export const CATEGORIES = [
  { _id: 'c1', category: 'Oud', description: 'Dark, resinous and regal.' },
  { _id: 'c2', category: 'Floral', description: 'Rose, jasmine and lily.' },
];

export const PRODUCTS = [
  { _id: 'p1', productName: 'Lattafa Queen of Arabia', description: 'Regal oriental opulence.', price: 829, stock: 8, image: [], category: CATEGORIES[0] },
  { _id: 'p2', productName: 'Ard Al Zaafaran Yara', description: 'Sweet tuberose and orchids.', price: 439, stock: 19, image: [], category: CATEGORIES[1] },
  { _id: 'p3', productName: 'Velvet Oud', description: 'Oud, black vanilla and incense.', price: 1199, stock: 0, image: [], category: CATEGORIES[0] },
];

export const ORDER = {
  _id: '65f0a1b2c3d4e5f607182930',
  userId: CUSTOMER,
  items: [{ productId: 'p1', name: 'Lattafa Queen of Arabia', unitPrice: 829, quantity: 2 }],
  totalPrice: 1658,
  paymentStatus: 'Pending',
  orderStatus: 'Pending',
  createdAt: '2026-09-12T09:00:00.000Z',
};

const ok = (data, extra = {}) => ({
  status: 200,
  contentType: 'application/json',
  body: JSON.stringify({ status: 'success', data, ...extra }),
});

/**
 * Routes every /api call to a canned response and records what was requested,
 * so a spec can assert that an order was — or was not — actually created.
 */
export async function mockApi(context, { user = CUSTOMER, cart = { items: [] }, subtotal = 0 } = {}) {
  const calls = [];

  await context.route('**/api/**', async (route) => {
    const request = route.request();
    const path = new URL(request.url()).pathname;
    const method = request.method();
    calls.push(`${method} ${path}`);

    if (path.endsWith('/api/auth/me')) {
      return user ? route.fulfill(ok({ user })) : route.fulfill({ status: 401, body: '{}' });
    }
    if (path.endsWith('/api/categories')) return route.fulfill(ok({ categories: CATEGORIES }));
    if (path.endsWith('/api/cart')) {
      return route.fulfill(ok({ cart }, { itemCount: cart.items.length, subtotal }));
    }
    if (path.endsWith('/api/orders/all')) {
      return route.fulfill(ok({ orders: [ORDER] }, { results: 1 }));
    }
    if (/\/api\/orders\/[^/]+\/(status|payment)$/.test(path)) {
      return route.fulfill(ok({ order: { ...ORDER, ...JSON.parse(request.postData() || '{}') } }));
    }
    if (/\/api\/orders\/[^/]+$/.test(path)) return route.fulfill(ok({ order: ORDER }));
    if (path.endsWith('/api/orders')) {
      return method === 'POST'
        ? route.fulfill({ ...ok({ order: ORDER }), status: 201 })
        : route.fulfill(ok({ orders: [ORDER] }, { results: 1 }));
    }
    if (/\/api\/products\/[^/]+$/.test(path)) {
      const id = path.split('/').pop();
      return route.fulfill(ok({ product: PRODUCTS.find((p) => p._id === id) || PRODUCTS[0] }));
    }
    if (path.endsWith('/api/products')) {
      return route.fulfill(ok({ products: PRODUCTS }, { results: 3, total: 3, page: 1, pages: 1 }));
    }
    return route.fulfill(ok({}));
  });

  return calls;
}

export async function signIn(context) {
  await context.addInitScript(() => {
    localStorage.setItem('access_token', 'test.access.token');
    localStorage.setItem('refresh_token', 'test.refresh.token');
  });
}

export const FULL_CART = {
  items: [{ productId: 'p1', name: 'Lattafa Queen of Arabia', unitPrice: 829, quantity: 2 }],
};
