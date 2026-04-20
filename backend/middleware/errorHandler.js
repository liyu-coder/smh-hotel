const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  // Default error
  let error = {
    success: false,
    message: err.message || 'Internal Server Error',
    status: err.status || 500
  };

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error.message = 'Invalid token';
    error.status = 401;
  } else if (err.name === 'TokenExpiredError') {
    error.message = 'Token expired';
    error.status = 401;
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    error.message = err.message;
    error.status = 400;
  }

  // Database errors
  if (err.code === '23505') { // Unique violation
    error.message = 'Resource already exists';
    error.status = 409;
  } else if (err.code === '23503') { // Foreign key violation
    error.message = 'Referenced resource does not exist';
    error.status = 400;
  }

  res.status(error.status).json(error);
};

module.exports = errorHandler;
