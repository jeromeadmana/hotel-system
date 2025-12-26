const express = require('express');
const cors = require('cors');
require('dotenv').config();
const db = require('./config/db');
const paymentRoutes = require('./routes/payment');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/payment', paymentRoutes);

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

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
