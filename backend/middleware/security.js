const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const csrf = require('csurf');
const helmet = require('helmet');

// Rate limiting configuration
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later'
});

// CSRF protection
const csrfProtection = csrf({ cookie: true });

// Password validation rules
const passwordValidationRules = [
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/[a-z]/)
    .withMessage('Password must contain at least one lowercase letter')
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least one uppercase letter')
    .matches(/[0-9]/)
    .withMessage('Password must contain at least one number')
    .matches(/[!@#$%^&*]/)
    .withMessage('Password must contain at least one special character')
];

// Request validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Security headers middleware using helmet
const securityHeaders = helmet();

// Custom rate limiter for specific routes
const createRateLimiter = (windowMs, max) => {
  return rateLimit({
    windowMs,
    max,
    message: 'Too many requests, please try again later'
  });
};

module.exports = {
  limiter,
  csrfProtection,
  passwordValidationRules,
  validate,
  securityHeaders,
  createRateLimiter
}; 