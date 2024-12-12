const jwt = require('jsonwebtoken');

// Load environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key'; // Fallback for development
const JWT_EXPIRATION = process.env.JWT_EXPIRATION || '1d'; // Default expiration time

// Generate a JWT token
// In utils/auth.js
const generateToken = (payload) => {
  return jwt.sign(
    { id: payload.id || payload._id }, 
    JWT_SECRET, 
    {
      expiresIn: JWT_EXPIRATION,
    }
  );
};

// Verify JWT token
const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid or expired token'); // Provide meaningful error message
  }
};

module.exports = {
  generateToken,
  verifyToken,
};
