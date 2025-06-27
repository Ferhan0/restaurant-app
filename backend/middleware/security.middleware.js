// backend/middleware/security.middleware.js
const rateLimit = require('express-rate-limit');

// Security Headers Middleware
const securityHeaders = (req, res, next) => {
  // Additional security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-Powered-By', 'Restaurant API'); // Custom header
  next();
};

// Rate Limiting Example - Account Creation
const createAccountLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Limit each IP to 5 requests per windowMs
  message: {
    success: false,
    message: 'Too many accounts created from this IP, please try again after an hour.',
    retryAfter: 60 * 60 // seconds
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many registration attempts from this IP address. Please try again after an hour.',
      retryAfter: 3600,
      timestamp: new Date().toISOString()
    });
  }
});

// Rate Limiting - Login Attempts
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per windowMs
  message: {
    success: false,
    message: 'Too many login attempts from this IP, please try again after 15 minutes.',
    retryAfter: 15 * 60 // seconds
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many login attempts from this IP address. Please try again after 15 minutes.',
      retryAfter: 900,
      timestamp: new Date().toISOString()
    });
  }
});

// Rate Limiting - General API
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
    retryAfter: 15 * 60
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Rate Limiting - Password Reset
const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Limit each IP to 3 password reset requests per hour
  message: {
    success: false,
    message: 'Too many password reset attempts. Please try again after an hour.',
    retryAfter: 60 * 60
  },
  standardHeaders: true,
  legacyHeaders: false
});

// IP Whitelist Middleware (for admin operations)
const ipWhitelist = (allowedIPs = []) => {
  return (req, res, next) => {
    const clientIP = req.ip || 
                     req.connection.remoteAddress || 
                     req.socket.remoteAddress ||
                     (req.connection.socket ? req.connection.socket.remoteAddress : null);
    
    if (allowedIPs.length > 0 && !allowedIPs.includes(clientIP)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied from this IP address',
        timestamp: new Date().toISOString()
      });
    }
    
    next();
  };
};

// Request Size Limiter
const requestSizeLimiter = (maxSize = '10mb') => {
  return (req, res, next) => {
    req.on('data', (chunk) => {
      if (req.get('content-length') > maxSize) {
        return res.status(413).json({
          success: false,
          message: 'Request entity too large',
          maxSize: maxSize
        });
      }
    });
    next();
  };
};

// CORS Security Enhancement
const corsSecurityHeaders = (req, res, next) => {
  // Strict CORS headers for production
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL || 'https://restaurant-app-ten-navy.vercel.app');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Origin,X-Requested-With,Content-Type,Accept,Authorization');
  }
  next();
};

module.exports = {
  securityHeaders,
  createAccountLimiter,
  loginLimiter,
  generalLimiter,
  passwordResetLimiter,
  ipWhitelist,
  requestSizeLimiter,
  corsSecurityHeaders
};