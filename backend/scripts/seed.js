const fs = require('fs');
const path = require('path');
const db = require('../config/db');

async function runSeed() {
  console.log('🔄 Initializing database schema and seed data...');
  try {
    const schemaPath = path.join(__dirname, '../../database/schema.sql');
    const seedPath = path.join(__dirname, '../../database/seed.sql');

    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    const seedSql = fs.readFileSync(seedPath, 'utf8');

    console.log('📦 Executing schema.sql...');
    await db.query(schemaSql);
    console.log('✅ Schema created successfully.');

    console.log('🌱 Executing seed.sql...');
    await db.query(seedSql);
    console.log('✅ Seed data inserted successfully!');

    console.log('\nDefault credentials:');
    console.log('👉 Admin: admin@stock.com / admin123');
    console.log('👉 Staff: staff@stock.com / staff123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Database initialization error:', error);
    process.exit(1);
  }
}

runSeed();
