import { Pool } from 'pg';

// Note: Vercel automatically loads environment variables, no need for dotenv in production

// Database configuration optimized for Vercel
const isProduction = process.env.NODE_ENV === 'production';
const connectionString = process.env.DATABASE_URL;

let pool: Pool;

if (connectionString) {
  // Use DATABASE_URL (recommended for Vercel)
  pool = new Pool({
    connectionString,
    ssl: isProduction ? { rejectUnauthorized: false } : false,
    // Vercel serverless function optimizations
    max: 1, // Limit connections for serverless
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });
} else {
  // Fallback to individual environment variables
  pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'authflow_db',
    user: process.env.DB_USER || 'username',
    password: process.env.DB_PASSWORD || 'password',
    ssl: isProduction ? { rejectUnauthorized: false } : false,
    max: 1,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });
}

// Test database connection
export const testConnection = async () => {
  try {
    const client = await pool.connect();
    console.log('✅ Database connected successfully');
    client.release();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
};

// Execute query function
import type { QueryResult } from 'pg';
export const query = async (text: string, params?: unknown[]): Promise<QueryResult> => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('Query error:', error);
    throw error;
  }
};

// Get client from pool
export const getClient = async () => pool.connect();

export default pool;
