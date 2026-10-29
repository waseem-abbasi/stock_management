const { Pool } = require('pg');
require('dotenv').config();

const isProduction = process.env.NODE_ENV === 'production';
const isNeon = process.env.DATABASE_URL && process.env.DATABASE_URL.includes('neon.tech');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: (isNeon || isProduction || process.env.DB_SSL === 'true')
    ? { rejectUnauthorized: false }
    : undefined,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client:', err);
  process.exit(-1);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};
