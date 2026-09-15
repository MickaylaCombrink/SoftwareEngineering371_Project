const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const {
  queryRepository,
} = require('../repositories');
const emailService = require('../services/emailService');

// Only these fields may be set by a client; anything else in the body is dropped
// Visitors may only submit the message itself - status is set by admins triaging it
const SUBMIT_FIELDS = ['name', 'email', 'subject', 'message'];
const TRIAGE_FIELDS = ['name', 'email', 'subject', 'message', 'status'];

const pickWritable = (body = {}, fields) =>
  fields.reduce((out, key) => {
    if (body[key] !== undefined) out[key] = body[key];
    return out;
  }, {});

// POST /api/queries - any visitor may submit a contact query
exports.createQuery = catchAsync(async (req, res, next) => {
  const query = await queryRepository.create(pickWritable(req.body, SUBMIT_FIELDS));

  // Notify the boutique by email, fire-and-forget: it never blocks or fails
  // the response, and the query is already saved regardless of SMTP.
  void emailService.sendQueryNotification(query);

  res.status(201).json({ status: 'success', data: { query } });
});

// GET /api/queries (admin) - newest first
exports.getAllQueries = catchAsync(async (req, res, next) => {
  const queries = await queryRepository.findAllNewestFirst();

  res.status(200).json({
    status: 'success',
    results: queries.length,
    data: { queries },
  });
});

// GET /api/queries/:id (admin)
exports.getQuery = catchAsync(async (req, res, next) => {
  const query = await queryRepository.findById(req.params.id);

  if (!query) {
    return next(AppError.notFound('No query found with that ID.'));
  }

  res.status(200).json({ status: 'success', data: { query } });
});

// PUT /api/queries/:id (admin) - triage progress, e.g. status
exports.updateQuery = catchAsync(async (req, res, next) => {
  const updates = pickWritable(req.body, TRIAGE_FIELDS);

  if (Object.keys(updates).length === 0) {
    return next(AppError.badRequest('No updatable fields were provided.'));
  }

  const query = await queryRepository.updateById(req.params.id, updates);

  if (!query) {
    return next(AppError.notFound('No query found with that ID.'));
  }

  res.status(200).json({ status: 'success', data: { query } });
});

// DELETE /api/queries/:id (admin)
exports.deleteQuery = catchAsync(async (req, res, next) => {
  const query = await queryRepository.deleteById(req.params.id);

  if (!query) {
    return next(AppError.notFound('No query found with that ID.'));
  }

  res.status(204).send();
});