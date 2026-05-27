const jwt = require('jsonwebtoken');
const User = require('../models/User');

function signToken(userId) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not configured');
  }
  return jwt.sign({ sub: userId }, secret, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

async function register({ name, email, password }) {
  const existing = await User.findOne({ email });
  if (existing) {
    const err = new Error('Email already in use');
    err.statusCode = 400;
    err.errors = [{ field: 'email', message: 'Email already in use' }];
    throw err;
  }

  const user = await User.create({ name, email, password });
  const token = signToken(user._id.toString());
  return { token, user: user.toSafeObject() };
}

async function login({ email, password }) {
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    const err = new Error('Invalid email or password');
    err.statusCode = 401;
    err.errors = [];
    throw err;
  }

  const ok = await user.comparePassword(password);
  if (!ok) {
    const err = new Error('Invalid email or password');
    err.statusCode = 401;
    err.errors = [];
    throw err;
  }

  const token = signToken(user._id.toString());
  return { token, user: user.toSafeObject() };
}

async function getMe(userId) {
  const user = await User.findById(userId);
  if (!user) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }
  return user.toSafeObject();
}

module.exports = { register, login, getMe, signToken };
