const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const { productRepository } = require('../repositories');

// Only these fields may be set by a client; anything else in the body is dropped
const WRITABLE = ['productName', 'description', 'price', 'stock', 'category', 'image'];

const pickWritable = (body = {}) =>
  WRITABLE.reduce((out, key) => {
    if (body[key] !== undefined) out[key] = body[key];
    return out;
  }, {});

const SORTS = {
  newest: { createdAt: -1 },
  oldest: { createdAt: 1 },
  'price-asc': { price: 1 },
  'price-desc': { price: -1 },
  name: { productName: 1 },
};

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 100;

// Rejects nonsense query strings up front instead of passing NaN to Mongo
function parseListQuery(query) {
  const { minPrice, maxPrice, sort, page, limit } = query;

  for (const key of ['minPrice', 'maxPrice']) {
    const value = query[key];
    if (value !== undefined && value !== '' && Number.isNaN(Number(value))) {
      throw AppError.badRequest(`${key} must be a number.`);
    }
  }

  if (minPrice && maxPrice && Number(minPrice) > Number(maxPrice)) {
    throw AppError.badRequest('minPrice cannot be greater than maxPrice.');
  }

  if (sort !== undefined && !SORTS[sort]) {
    throw AppError.badRequest(`sort must be one of: ${Object.keys(SORTS).join(', ')}.`);
  }

  for (const key of ['page', 'limit']) {
    const value = query[key];
    if (value !== undefined && (!/^\d+$/.test(value) || Number(value) < 1)) {
      throw AppError.badRequest(`${key} must be a positive integer.`);
    }
  }

  return {
    pageNum: Number(page) || 1,
    perPage: Math.min(Number(limit) || DEFAULT_LIMIT, MAX_LIMIT),
    sortSpec: sort ? SORTS[sort] : { createdAt: -1 },
  };
}

// GET /api/products
exports.getAllProducts = catchAsync(async (req, res, next) => {
  const { pageNum, perPage, sortSpec } = parseListQuery(req.query);

  const [products, total] = await Promise.all([
    productRepository.search(
      { ...req.query, sort: sortSpec },
      { skip: (pageNum - 1) * perPage, limit: perPage, populate: 'category' }
    ),
    productRepository.countMatching(req.query),
  ]);

  res.status(200).json({
    status: 'success',
    results: products.length,
    total,
    page: pageNum,
    pages: Math.ceil(total / perPage) || 1,
    data: { products },
  });
});

// GET /api/products/:id
exports.getProduct = catchAsync(async (req, res, next) => {
  // An invalid ObjectId throws a CastError, handled centrally as a 400
  const product = await productRepository.findById(req.params.id, {
    populate: 'category',
  });

  if (!product) {
    return next(AppError.notFound('No product found with that ID.'));
  }

  res.status(200).json({ status: 'success', data: { product } });
});

// POST /api/products (admin)
exports.createProduct = catchAsync(async (req, res, next) => {
  // Schema validation errors are handled centrally as a 400
  const product = await productRepository.create(pickWritable(req.body));

  res.status(201).json({ status: 'success', data: { product } });
});

// PUT /api/products/:id (admin)
exports.updateProduct = catchAsync(async (req, res, next) => {
  const updates = pickWritable(req.body);

  if (Object.keys(updates).length === 0) {
    return next(AppError.badRequest('No updatable fields were provided.'));
  }

  const product = await productRepository.updateById(req.params.id, updates);

  if (!product) {
    return next(AppError.notFound('No product found with that ID.'));
  }

  res.status(200).json({ status: 'success', data: { product } });
});

// DELETE /api/products/:id (admin)
exports.deleteProduct = catchAsync(async (req, res, next) => {
  const product = await productRepository.deleteById(req.params.id);

  if (!product) {
    return next(AppError.notFound('No product found with that ID.'));
  }

  res.status(204).send();
});
