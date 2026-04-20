const jwt = require('jsonwebtoken');
require('dotenv').config();

// Authentication middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'Access denied. No token provided.' 
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('🔍 Auth middleware - Decoded token:', decoded);
    req.user = decoded;
    next();
  } catch (error) {
    console.error('❌ Auth middleware - Token verification error:', error);
    return res.status(403).json({ 
      success: false, 
      message: 'Invalid or expired token.' 
    });
  }
};

// Authorization middleware to check user role
const authorize = (...roles) => {
  return async (req, res, next) => {
    console.log('🔍 Authorize middleware - User role:', req.user.role);
    console.log('🔍 Authorize middleware - Required roles:', roles);
    
    // Flatten roles array in case it's nested
    const flatRoles = roles.flat();
    console.log('🔍 Authorize middleware - Flattened roles:', flatRoles);
    
    // Check if role in token matches required roles
    if (flatRoles.includes(req.user.role)) {
      console.log('✅ Authorize middleware - Access granted (from token)');
      return next();
    }
    
    // Fallback: Check role from database
    try {
      const { query } = require('../config/database');
      const result = await query(
        'SELECT role FROM users WHERE id = $1',
        [req.user.userId]
      );
      
      if (result.rows.length > 0) {
        const dbRole = result.rows[0].role;
        console.log('🔍 Authorize middleware - DB role:', dbRole);
        
        if (flatRoles.includes(dbRole)) {
          // Update req.user with correct role from database
          req.user.role = dbRole;
          console.log('✅ Authorize middleware - Access granted (from database)');
          return next();
        }
      }
    } catch (error) {
      console.error('❌ Authorize middleware - Database check error:', error);
    }
    
    console.log('⚠️ Authorize middleware - Access denied');
    return res.status(403).json({ 
      success: false, 
      message: 'Access denied. Insufficient permissions.' 
    });
  };
};

// Optional authentication - doesn't fail if no token
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
    } catch (error) {
      // Token is invalid, but we continue without user
      req.user = null;
    }
  } else {
    req.user = null;
  }
  next();
};

module.exports = {
  authenticateToken,
  authorize,
  optionalAuth
};
