const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const db = require('./config/db');
const authRoutes = require('./routes/auth');
const paymentRoutes = require('./routes/payment');
const roomRoutes = require('./routes/rooms');
const roomRateRoutes = require('./routes/roomRates');
const bookingRoutes = require('./routes/bookings');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// CORS
app.use(cors());

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/room-rates', roomRateRoutes);
app.use('/api/bookings', bookingRoutes);

app.get('/api', (req, res) => {
  res.json({ message: 'Welcome to the API' });
});

app.get('/api/test-db', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT 1 + 1 AS result');
    res.json({ success: true, message: 'Database connected', result: rows[0].result });
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({ success: false, message: 'Database connection failed', error: error.message });
  }
});

// Global error handler (must be after all routes)
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
});
