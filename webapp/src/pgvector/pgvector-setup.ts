import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function setupPgVector() {
  const client = await pool.connect();
  try {
    const sqlScript = fs.readFileSync(path.join(__dirname, 'pgvector-tables-setup.sql'), 'utf8');
    await client.query(sqlScript);
    console.log('PGVector tables and index created successfully');
  } catch (error) {
    console.error('Error setting up PGVector:', error);
  } finally {
    client.release();
  }
}

setupPgVector();