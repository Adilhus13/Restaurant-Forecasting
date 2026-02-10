const { PrismaClient } = require('@prisma/client');
const path = require('path');

console.log('Script started');

async function main() {
  try {
    console.log('CWD:', process.cwd());
    const dbPath = path.resolve(process.cwd(), 'dev.db');
    console.log('Testing connection to:', dbPath);
    
    const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');
    
    const adapter = new PrismaBetterSqlite3({ url: dbPath });
    
    const prisma = new PrismaClient({ adapter });

    console.log('Attempting to connect...');
    const groupCount = await prisma.restaurantGroup.count();
    console.log('Successfully connected! Restaurant groups count:', groupCount);
    await prisma.$disconnect();
  } catch (e) {
    console.error('CRITICAL ERROR:', e.message);
    console.error(e.stack);
    process.exit(1);
  }
}

main().then(() => console.log('Script finished')).catch(e => console.error('Unhandled promise rejection:', e));
