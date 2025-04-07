const { validationResult, body } = require('express-validator');
const xss = require('xss');

// Sanitize request body recursively
const sanitizeInput = (data) => {
  if (typeof data !== 'object' || data === null) {
    return typeof data === 'string' ? xss(data) : data;
  }

  return Object.keys(data).reduce((acc, key) => {
    acc[key] = typeof data[key] === 'object' 
      ? sanitizeInput(data[key])
      : typeof data[key] === 'string' 
        ? xss(data[key]) 
        : data[key];
    return acc;
  }, Array.isArray(data) ? [] : {});
};

// Middleware to check for validation errors
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      error: 'Validation failed', 
      details: errors.array() 
    });
  }

  // Sanitize request body
  req.body = sanitizeInput(req.body);
  next();
};

// Common validation rules
const rules = {
  username: body('username')
    .trim()
    .isLength({ min: 3, max: 30 })
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('Username must be between 3-30 characters and can only contain letters, numbers, underscores, and dashes'),

  email: body('email')
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage('Must be a valid email address'),

  password: body('password')
    .isLength({ min: 8 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must be at least 8 characters and contain at least one uppercase letter, one lowercase letter, one number, and one special character'),

  moodText: body('text')
    .trim()
    .notEmpty()
    .isLength({ min: 1, max: 500 })
    .withMessage('Mood text must be between 1 and 500 characters'),

  playlistName: body('name')
    .trim()
    .notEmpty()
    .isLength({ min: 1, max: 100 })
    .withMessage('Playlist name must be between 1 and 100 characters'),

  spotifyId: body('spotifyId')
    .trim()
    .matches(/^[0-9A-Za-z]{22}$/)
    .withMessage('Invalid Spotify track ID format')
};

// Validation chains for different routes
const validate = {
  register: [
    rules.username,
    rules.email,
    rules.password,
    validateRequest
  ],

  login: [
    body('email').exists().withMessage('Email is required'),
    body('password').exists().withMessage('Password is required'),
    validateRequest
  ],

  analyzeMood: [
    rules.moodText,
    validateRequest
  ],

  createPlaylist: [
    rules.playlistName,
    validateRequest
  ],

  addTrack: [
    rules.spotifyId,
    validateRequest
  ],

  updateProfile: [
    body('username').optional().custom((value) => {
      if (value) {
        return rules.username.run(value);
      }
      return true;
    }),
    body('email').optional().custom((value) => {
      if (value) {
        return rules.email.run(value);
      }
      return true;
    }),
    body('password').optional().custom((value) => {
      if (value) {
        return rules.password.run(value);
      }
      return true;
    }),
    validateRequest
  ]
};

module.exports = {
  validate,
  validateRequest,
  sanitizeInput
}; 