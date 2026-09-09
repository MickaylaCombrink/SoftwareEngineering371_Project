const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const { categoryRepository } = require('../repositories');

// Only these fields may be set by a client; anything else in the body is dropped
const WRITABLE = ['category', 'description'];

const pickWritable = (body = {}) =>
  WRITABLE.reduce((out, key) => {
    if (body[key] !== undefined) out[key] = body[key];
    return out;
  }, {});

// GET /api/categories
exports.getAllCategories = catchAsync(async (req, res, next) => {
  const categories = await categoryRepository.findAllSorted();

  res.status(200).json({
    status: 'success',
    results: categories.length,
    data: { categories },
  });
});

// GET /api/categories/:id
exports.getCategory = catchAsync(async (req, res, next) => {
  // An invalid ObjectId throws a CastError, handled centrally as a 400
  const category = await categoryRepository.findById(req.params.id);

  if (!category) {
    return next(AppError.notFound('No category found with that ID.'));
  }

  res.status(200).json({ status: 'success', data: { category } });
});

// POST /api/categories (admin)
// A duplicate name hits the unique index and becomes a 409 centrally
exports.createCategory = catchAsync(async (req, res, next) => {
  const category = await categoryRepository.create(pickWritable(req.body));

  res.status(201).json({ status: 'success', data: { category } });
});

// PUT /api/categories/:id (admin)
exports.updateCategory = catchAsync(async (req, res, next) => {
  const updates = pickWritable(req.body);

  if (Object.keys(updates).length === 0) {
    return next(AppError.badRequest('No updatable fields were provided.'));
  }

  const category = await categoryRepository.updateById(req.params.id, updates);

  if (!category) {
    return next(AppError.notFound('No category found with that ID.'));
  }

  res.status(200).json({ status: 'success', data: { category } });
});

// DELETE /api/categories/:id (admin)
exports.deleteCategory = catchAsync(async (req, res, next) => {
  const category = await categoryRepository.deleteById(req.params.id);

  if (!category) {
    return next(AppError.notFound('No category found with that ID.'));
  }

  res.status(204).send();
});
