// Checkout saga with every repository mocked: no database, and the rollback
// path can be forced directly rather than raced through HTTP.
const AppError = require('../src/utils/AppError');

const mockCartRepository = {
  findOrCreateByUser: jest.fn(),
  clear: jest.fn(),
};
const mockProductRepository = {
  findById: jest.fn(),
  decrementStock: jest.fn(),
  incrementStock: jest.fn(),
};
const mockOrderRepository = {
  create: jest.fn(),
  findByUser: jest.fn(),
  findAllOrders: jest.fn(),
  findByIdForUser: jest.fn(),
  updateStatus: jest.fn(),
  updatePaymentStatus: jest.fn(),
};

jest.mock('../src/repositories', () => ({
  cartRepository: mockCartRepository,
  productRepository: mockProductRepository,
  orderRepository: mockOrderRepository,
}));

const orderService = require('../src/services/orderService');

const USER_ID = 'user-1';

function cartWith(items) {
  return { items, _id: 'cart-1' };
}

function line(overrides = {}) {
  return {
    productId: 'p1',
    name: 'Velvet Oud',
    unitPrice: 100,
    quantity: 2,
    ...overrides,
  };
}

beforeEach(() => {
  jest.clearAllMocks();
  mockOrderRepository.create.mockResolvedValue({ _id: 'order-1' });
  mockCartRepository.clear.mockResolvedValue(true);
  // The rollback calls .catch() on this, so it has to be thenable
  mockProductRepository.incrementStock.mockResolvedValue(true);
});

describe('checkout', () => {
  test('an empty cart is rejected before anything is written', async () => {
    mockCartRepository.findOrCreateByUser.mockResolvedValue(cartWith([]));

    await expect(orderService.checkout(USER_ID)).rejects.toThrow(/cart is empty/i);
    expect(mockProductRepository.decrementStock).not.toHaveBeenCalled();
    expect(mockOrderRepository.create).not.toHaveBeenCalled();
  });

  test('a product that vanished between adding and checkout is rejected', async () => {
    mockCartRepository.findOrCreateByUser.mockResolvedValue(cartWith([line()]));
    mockProductRepository.findById.mockResolvedValue(null);

    await expect(orderService.checkout(USER_ID)).rejects.toThrow(/no longer available/i);
    expect(mockOrderRepository.create).not.toHaveBeenCalled();
  });

  test('stock is verified up front, so a shortage writes nothing', async () => {
    mockCartRepository.findOrCreateByUser.mockResolvedValue(cartWith([line({ quantity: 5 })]));
    mockProductRepository.findById.mockResolvedValue({ stock: 2, productName: 'Velvet Oud' });

    await expect(orderService.checkout(USER_ID)).rejects.toThrow(/Only 2 unit/i);
    expect(mockProductRepository.decrementStock).not.toHaveBeenCalled();
  });

  test('the order total is computed from the cart, not taken from it', async () => {
    mockCartRepository.findOrCreateByUser.mockResolvedValue(
      cartWith([line({ unitPrice: 100, quantity: 2 }), line({ productId: 'p2', unitPrice: 50, quantity: 3 })])
    );
    mockProductRepository.findById.mockResolvedValue({ stock: 99, productName: 'x' });
    mockProductRepository.decrementStock.mockResolvedValue({ ok: true });

    await orderService.checkout(USER_ID);

    expect(mockOrderRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ totalPrice: 350, userId: USER_ID })
    );
  });

  test('a successful checkout decrements every line and empties the cart', async () => {
    mockCartRepository.findOrCreateByUser.mockResolvedValue(
      cartWith([line({ productId: 'p1' }), line({ productId: 'p2' })])
    );
    mockProductRepository.findById.mockResolvedValue({ stock: 99, productName: 'x' });
    mockProductRepository.decrementStock.mockResolvedValue({ ok: true });

    await orderService.checkout(USER_ID);

    expect(mockProductRepository.decrementStock).toHaveBeenCalledTimes(2);
    expect(mockCartRepository.clear).toHaveBeenCalledWith(USER_ID);
  });

  test('a decrement that loses the race rolls back the ones already applied', async () => {
    mockCartRepository.findOrCreateByUser.mockResolvedValue(
      cartWith([line({ productId: 'p1' }), line({ productId: 'p2' })])
    );
    mockProductRepository.findById.mockResolvedValue({ stock: 99, productName: 'x' });

    // First line succeeds, second finds the shelf empty
    mockProductRepository.decrementStock
      .mockResolvedValueOnce({ ok: true })
      .mockResolvedValueOnce(null);

    await expect(orderService.checkout(USER_ID)).rejects.toThrow(/Insufficient stock/i);

    // Only the line that actually decremented is restored
    expect(mockProductRepository.incrementStock).toHaveBeenCalledTimes(1);
    expect(mockProductRepository.incrementStock).toHaveBeenCalledWith('p1', 2);
    expect(mockOrderRepository.create).not.toHaveBeenCalled();
    expect(mockCartRepository.clear).not.toHaveBeenCalled();
  });

  test('a failure before any decrement restores nothing', async () => {
    mockCartRepository.findOrCreateByUser.mockResolvedValue(cartWith([line()]));
    mockProductRepository.findById.mockResolvedValue({ stock: 99, productName: 'x' });
    mockProductRepository.decrementStock.mockResolvedValueOnce(null);

    await expect(orderService.checkout(USER_ID)).rejects.toThrow();

    expect(mockProductRepository.incrementStock).not.toHaveBeenCalled();
  });
});

describe('authorisation guards', () => {
  test('only an admin can list every order', async () => {
    await expect(orderService.getAllOrders({ isAdmin: false })).rejects.toThrow(AppError);
    expect(mockOrderRepository.findAllOrders).not.toHaveBeenCalled();

    mockOrderRepository.findAllOrders.mockResolvedValue([]);
    await orderService.getAllOrders({ isAdmin: true });
    expect(mockOrderRepository.findAllOrders).toHaveBeenCalled();
  });

  test('only an admin can change order status', async () => {
    await expect(orderService.updateStatus('o1', 'Shipping', { isAdmin: false })).rejects.toThrow(
      /administrators/i
    );
    expect(mockOrderRepository.updateStatus).not.toHaveBeenCalled();
  });

  test('only an admin can change payment status', async () => {
    await expect(
      orderService.updatePaymentStatus('o1', 'Paid', { isAdmin: false })
    ).rejects.toThrow(/administrators/i);
    expect(mockOrderRepository.updatePaymentStatus).not.toHaveBeenCalled();
  });

  test('an unknown order id is a 404 rather than a silent no-op', async () => {
    mockOrderRepository.updateStatus.mockResolvedValue(null);

    await expect(orderService.updateStatus('missing', 'Shipping', { isAdmin: true })).rejects.toThrow(
      /No order found/i
    );
  });

  test('a non-owner is refused without revealing whether the order exists', async () => {
    mockOrderRepository.findByIdForUser.mockResolvedValue(null);

    await expect(orderService.getOrder('o1', USER_ID, { isAdmin: false })).rejects.toThrow(
      /do not have permission/i
    );
  });

  test('for an admin the same miss is reported as not found', async () => {
    mockOrderRepository.findByIdForUser.mockResolvedValue(null);

    await expect(orderService.getOrder('o1', USER_ID, { isAdmin: true })).rejects.toThrow(
      /No order found/i
    );
  });
});
