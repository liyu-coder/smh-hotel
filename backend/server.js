const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const hotelRoutes = require('./routes/hotels');
const bookingRoutes = require('./routes/bookings');
const walletRoutes = require('./routes/wallet');
const transactionRoutes = require('./routes/transactions');
const teamRoutes = require('./routes/team');
const supportRoutes = require('./routes/support');
const countryRoutes = require('./routes/countries');
const adminRoutes = require('./routes/admin');
const reservationRoutes = require('./routes/reservation');
const depositRoutes = require('./routes/deposits');
const adminDepositRoutes = require('./routes/admin-deposits');
const bookingSessionsRoutes = require('./routes/booking-sessions');

// Import middleware
const errorHandler = require('./middleware/errorHandler');

// Initialize express app
const app = express();

// Security middleware
app.use(helmet());
app.use(compression());

// CORS configuration - allow multiple common dev ports (must be before rate limiter)
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
  process.env.CORS_ORIGIN
].filter(Boolean);

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      console.warn('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting (skip OPTIONS requests to avoid blocking CORS preflight)
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  },
  skip: (req) => req.method === 'OPTIONS',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many requests from this IP, please try again later.'
    });
  }
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined'));
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'SMH Hotel Reservation API is running',
    timestamp: new Date().toISOString()
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/hotels', hotelRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/countries', countryRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/reservation', reservationRoutes);
app.use('/api/deposits', depositRoutes);
app.use('/api/admin-deposits', adminDepositRoutes);
app.use('/api/booking-sessions', bookingSessionsRoutes);

// Serve static frontend files in production
if (process.env.NODE_ENV === 'production') {
  const path = require('path');
  
  // Serve static files from public_html (parent of backend)
  app.use(express.static(path.join(__dirname, '..', 'public_html')));
  
  // Serve index.html for all non-API routes (SPA support)
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public_html', 'index.html'));
  });
}

// 404 handler for API routes
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Route not found' 
  });
});

// Error handling middleware
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});

module.exports = app;
