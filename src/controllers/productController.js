const Product = require('../models/Product');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

// GET /api/products
exports.getAllProducts = catchAsync(async (req, res, next) => {
  const { category, minPrice, maxPrice, inStock } = req.query;
  const filter = {};

  if (category) filter.category = category;
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }
  if (inStock === 'true') filter.stock = { $gt: 0 };

  const products = await Product.find(filter);
  res.status(200).json({
    status: 'success',
    results: products.length,
    data: { products },
  });
});

// GET /api/products/:id
exports.getProduct = catchAsync(async (req, res, next) => {
  // An invalid Mongo ObjectId here throws a CastError, which
  // errorHandler.js converts into a clean 400 automatically.
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new AppError('No product found with that ID.', 404));
  }

  res.status(200).json({ status: 'success', data: { product } });
});

// POST /api/products (Admin)
exports.createProduct = catchAsync(async (req, res, next) => {
  // Mongoose schema validation errors (missing/invalid fields) are
  // thrown here and caught centrally as 400s via handleValidationErrorDB.
  const product = await Product.create(req.body);
  res.status(201).json({ status: 'success', data: { product } });
});

// PUT /api/products/:id (Admin)
exports.updateProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!product) {
    return next(new AppError('No product found with that ID.', 404));
  }

  res.status(200).json({ status: 'success', data: { product } });
});

// DELETE /api/products/:id (Admin)
exports.deleteProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findByIdAndDelete(req.params.id);

  if (!product) {
    return next(new AppError('No product found with that ID.', 404));
  }

  res.status(204).json({ status: 'success', data: null });
});
