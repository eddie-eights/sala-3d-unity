
const { Client } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from apps/web/.env
dotenv.config({ path: path.resolve(__dirname, '../apps/web/.env') });

async function checkSchema() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log('Connected to database.');

    const res = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'passkey';
    `);

    if (res.rows.length === 0) {
      console.log('Table "passkey" does not exist!');
    } else {
      console.log('Table "passkey" columns:');
      console.table(res.rows);
    }
    
    // Check if table exists in verify path
    const resVerify = await client.query(`SELECT count(*) FROM passkey`);
    console.log(`Current passkey count: ${resVerify.rows[0].count}`);

  } catch (err) {
    console.error('Error querying database:', err);
  } finally {
    await client.end();
  }
}

checkSchema();
