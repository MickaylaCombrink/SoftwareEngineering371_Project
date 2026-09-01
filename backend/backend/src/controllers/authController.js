const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  });

// POST /api/auth/register
// Test case: "Register with an email already in use -> 409; no second
// user document created". The unique index on User.email combined with
// the pre-check below guarantees this without a partial write.
exports.register = catchAsync(async (req, res, next) => {
  const { firstName, lastName, email, password } = req.body;

  if (!firstName || !lastName || !email || !password) {
    return next(new AppError('All fields are required.', 400));
  }

  // Test case: "Register with a 6-character password -> 400; with
  // validation message". Checked explicitly here for a clear message,
  // and enforced again at the schema level as a second line of defence
  // (schema errors are caught by errorHandler's handleValidationErrorDB).
  if (password.length < 8) {
    return next(
      new AppError('Password must be at least 8 characters long.', 400)
    );
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new AppError('An account with that email already exists.', 409));
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const newUser = await User.create({
    firstName,
    lastName,
    email,
    password: hashedPassword,
    role: 'customer',
  });

  const token = signToken(newUser._id);
  res.status(201).json({
    status: 'success',
    token,
    data: {
      user: {
        id: newUser._id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        role: newUser.role,
      },
    },
  });
});

// POST /api/auth/login
// Test case: "Log in with an incorrect password -> 401; response does
// not reveal whether the email exists". We deliberately use the SAME
// generic message and status code whether the email is unknown or the
// password is wrong, to avoid user enumeration.
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('Please provide email and password.', 400));
  }

  const user = await User.findOne({ email }).select('+password');

  const credentialsInvalid =
    !user || !(await bcrypt.compare(password, user.password));

  if (credentialsInvalid) {
    return next(new AppError('Incorrect email or password.', 401));
  }

  const token = signToken(user._id);
  res.status(200).json({
    status: 'success',
    token,
    data: {
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      },
    },
  });
});

// GET /api/auth/me
exports.getMe = catchAsync(async (req, res, next) => {
  // req.user is populated by the `protect` middleware; if the token
  // were invalid this handler is never reached (401 thrown upstream).
  res.status(200).json({
    status: 'success',
    data: { user: req.user },
  });
});
