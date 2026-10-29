const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
   connectionString: process.env.DATABASE_URL,
  // host: process.env.DB_HOST || 'localhost',
  // port: parseInt(process.env.DB_PORT, 10) || 5432,
  // user: process.env.DB_USER || 'postgres',
  // password: process.env.DB_PASSWORD || 'postgres',
  // database: process.env.DB_NAME || 'stock_management',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client:', err);
  process.exit(-1);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};
