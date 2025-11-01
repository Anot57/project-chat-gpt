const userModel = require('../models/user.model');
const jwt = require('jsonwebtoken');

async function authUser(req, res, next) {
  try {
    const token = req.cookies?.token; // ✅ safer cookie access

    if (!token) {
      return res.status(401).json({ message: 'Unauthorized: No token found' });
    }

    // ✅ verify token using your JWT secret
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ find user in DB
    const user = await userModel.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized: Invalid user' });
    }

    // ✅ attach user to request
    req.user = user;

    next();
  } catch (err) {
    console.error('Auth error:', err.message);
    return res.status(401).json({ message: 'Unauthorized: Invalid token' });
  }
}

module.exports = { authUser };

