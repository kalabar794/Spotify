const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const User = require('../models/User');

// Token blacklist using Set for O(1) lookups
const tokenBlacklist = new Set();

// Rate limiter for authentication attempts
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 failed attempts per windowMs
  message: 'Too many failed login attempts, please try again after 15 minutes'
});

// Cache for user data to reduce DB load
const userCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const auth = async (req, res, next) => {
  try {
    // Get token from header or cookie
    const token = req.header('x-auth-token') || req.cookies.token;

    if (!token) {
      return res.status(401).json({ 
        error: 'No authentication token, access denied' 
      });
    }

    // Check if token is blacklisted
    if (tokenBlacklist.has(token)) {
      return res.status(401).json({ 
        error: 'Token has been invalidated, please login again' 
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if token is expired
    if (Date.now() >= decoded.exp * 1000) {
      return res.status(401).json({ 
        error: 'Token has expired, please login again' 
      });
    }

    // Check cache first
    const cachedUser = userCache.get(decoded.id);
    if (cachedUser && cachedUser.timestamp > Date.now() - CACHE_TTL) {
      req.user = cachedUser.data;
      return next();
    }

    // Find user in database
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ 
        error: 'User not found' 
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(403).json({ 
        error: 'Account is inactive' 
      });
    }

    // Check if password was changed after token was issued
    if (user.passwordChangedAt && decoded.iat * 1000 < user.passwordChangedAt.getTime()) {
      return res.status(401).json({ 
        error: 'Password was changed, please login again' 
      });
    }

    // Update cache
    userCache.set(decoded.id, {
      data: user,
      timestamp: Date.now()
    });

    // Add user to request
    req.user = user;
    next();
  } catch (error) {
    // Clear detailed error in production
    const message = process.env.NODE_ENV === 'production' 
      ? 'Authentication failed' 
      : error.message;

    res.status(401).json({ error: message });
  }
};

const invalidateToken = (token) => {
  tokenBlacklist.add(token);
  // Optional: Set a timeout to remove the token from blacklist after it expires
  const decoded = jwt.decode(token);
  if (decoded && decoded.exp) {
    const timeUntilExpiry = decoded.exp * 1000 - Date.now();
    setTimeout(() => tokenBlacklist.delete(token), timeUntilExpiry);
  }
};

// Clean up expired tokens from blacklist periodically
setInterval(() => {
  for (const token of tokenBlacklist) {
    const decoded = jwt.decode(token);
    if (decoded && decoded.exp && Date.now() >= decoded.exp * 1000) {
      tokenBlacklist.delete(token);
    }
  }
}, 60 * 60 * 1000); // Run every hour

module.exports = { auth, invalidateToken, authLimiter }; 