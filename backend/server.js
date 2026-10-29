const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const db = require('./config/db');

// Import routes
const authRoutes = require('./routes/authRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const supplierRoutes = require('./routes/supplierRoutes');
const productRoutes = require('./routes/productRoutes');
const stockRoutes = require('./routes/stockRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    message: 'Stock Management API is running smoothly.',
  });
});

// Register routes
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/products', productRoutes);
app.use('/api/stock', stockRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Fallback 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Resource not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled Application Error:', err.stack || err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// Verify DB Connection and Start Server
const startServer = async () => {
  try {
    const res = await db.query('SELECT NOW()');
    console.log('✅ PostgreSQL connected successfully at:', res.rows[0].now);
  } catch (err) {
    console.error('❌ Failed to connect to PostgreSQL database:');
    console.error('   Error details:', err.message);
    console.error('   Please ensure:');
    console.error('   1. PostgreSQL is running (default port 5432).');
    console.error('   2. Database "stock_management" exists in pgAdmin.');
    console.error('   3. DB credentials in backend/.env match your pgAdmin setup.');
  }

  app.listen(PORT, () => {
    console.log(`🚀 Stock Management Server listening on http://localhost:${PORT}`);
  });
};

if (require.main === module) {
  startServer();
}

module.exports = app;
