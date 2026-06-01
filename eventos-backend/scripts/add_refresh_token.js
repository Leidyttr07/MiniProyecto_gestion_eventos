const { Client } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

async function main() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  await client.connect();
  try {
    console.log('Applying ALTER TABLE to add refresh_token column...');
    await client.query(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "refresh_token" VARCHAR;`);
    console.log('Column added (or already existed).');
  } catch (err) {
    console.error('Error applying migration:', err.message || err);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
}

main();
