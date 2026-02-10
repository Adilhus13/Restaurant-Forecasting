const { PrismaClient } = require('@prisma/client');

process.env.DATABASE_URL = 'postgresql://postgres:xQMn6JtEDiV9BPseWiGw@restaurantforecasting.c56ioqk6mvew.eu-north-1.rds.amazonaws.com:5432/restaurant_forecasting';

const prisma = new PrismaClient();

async function testConnection() {
  try {
    const result = await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Database connection successful!');
    console.log('Result:', result);
    process.exit(0);
  } catch (err) {
    console.log('❌ Connection failed:', err.message);
    process.exit(1);
  }
}

testConnection();
