const pg = require('pg');

const client = new pg.Client({
  host: 'restaurantforecasting.c56ioqk6mvew.eu-north-1.rds.amazonaws.com',
  port: 5432,
  database: 'restaurant_forecasting',
  user: 'postgres',
  password: 'xQMn6JtEDiV9BPseWiGw'
});

client.connect((err) => {
  if (err) {
    console.log('❌ Connection failed:', err.message);
    process.exit(1);
  }

  client.query('SELECT 1', (err, res) => {
    if (err) {
      console.log('❌ Query failed:', err.message);
      process.exit(1);
    }
    console.log('✅ Database connection successful!');
    console.log('Query result:', res.rows);
    client.end();
    process.exit(0);
  });
});
