const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');
const { readData } = require('../utils/localDB');

// @desc   Protect routes — verifies JWT and attaches req.user
exports.protect = async (req, res, next) => {
  let token;

  // 1. Extract token from Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
  }

  try {
    // 2. Verify token
    if (!process.env.JWT_SECRET) {
      console.error('CRITICAL: JWT_SECRET fits is NOT defined in .env! Secutity compromised.');
      return res.status(500).json({ success: false, message: 'Server configuration error' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Try MongoDB first, fall back to localDB
    if (mongoose.connection.readyState === 1) {
      req.user = await User.findById(decoded.id);
    } else {
      // Offline fallback: look up user in local JSON store
      const users = await readData('users');
      req.user = users.find(u => u._id === decoded.id) || null;
    }

    if (!req.user) {
      return res.status(401).json({ success: false, message: 'User not found — token invalid' });
    }

    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
  }
};
