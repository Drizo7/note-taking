const jwt = require('jsonwebtoken');
const User = require('../models/user');

const authMiddleware = async (req, res, next) => {
  // Log all headers to see what's being sent
  console.log('Request Headers:', req.headers);

  // Extract token from the Authorization header
  const authHeader = req.headers.authorization;
  console.log('Authorization Header:', authHeader);

  if (!authHeader) {
    console.error('No Authorization header found');
    return res.status(401).json({ message: 'No Authorization header, authorization denied' });
  }

  // Split and handle potential formatting issues
  const headerParts = authHeader.split(' ');
  if (headerParts.length !== 2 || headerParts[0] !== 'Bearer') {
    console.error('Invalid Authorization header format');
    return res.status(401).json({ 
      message: 'Invalid Authorization header format. Use "Bearer <token>"' 
    });
  }

  const token = headerParts[1];

  if (!token) {
    console.error('No token provided');
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    // Verify token
    console.log("Attempting to verify token:", token);
    console.log("Using JWT Secret:", process.env.JWT_SECRET ? 'Secret is set' : 'Secret is UNDEFINED');

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (verifyError) {
      console.error('JWT Verification Error:', verifyError.name);
      console.error('Error details:', verifyError.message);

      // Specific error handling
      if (verifyError.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token has expired' });
      }
      if (verifyError.name === 'JsonWebTokenError') {
        return res.status(401).json({ message: 'Invalid token' });
      }

      throw verifyError; // Re-throw other errors
    }

    console.log("Decoded token payload:", decoded);

    // Verify user exists
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      console.error('User not found for ID:', decoded.id);
      return res.status(401).json({ message: 'User not found, authorization denied' });
    }

    // Attach user to request object
    req.user = user;

    // Proceed to next middleware or route
    next();

  } catch (error) {
    console.error('Authentication Middleware Error:', error);
    res.status(401).json({ 
      message: 'Authentication failed',
      error: error.message 
    });
  }
};

module.exports = authMiddleware;