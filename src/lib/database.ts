import { Pool, PoolClient } from 'pg';

// Database configuration optimized for Neon DB and Vercel
const isProduction = process.env.NODE_ENV === 'production';
const connectionString = process.env.DATABASE_URL;

let pool!: Pool; // Definite assignment assertion - will be initialized in initializePool
let isPoolInitialized = false;

// Initialize pool with optimized settings for Neon DB
function initializePool() {
  if (isPoolInitialized) return;
  
  if (connectionString) {
    // Use DATABASE_URL (recommended for Neon DB and Vercel)
    pool = new Pool({
      connectionString,
      ssl: {
        rejectUnauthorized: false, // Required for Neon DB
      },
      // Serverless function optimizations for Neon DB
      max: 1, // Single connection for serverless
      min: 0, // No minimum connections
      idleTimeoutMillis: 0, // Disable idle timeout for Neon
      connectionTimeoutMillis: 10000, // Increased timeout for Neon
      allowExitOnIdle: true, // Allow process to exit when idle
      // Neon-specific optimizations
      statement_timeout: 30000, // 30 second statement timeout
      query_timeout: 30000, // 30 second query timeout
    });
  } else {
    // Fallback to individual environment variables (for local development)
    pool = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME || 'authflow_db',
      user: process.env.DB_USER || 'username',
      password: process.env.DB_PASSWORD || 'password',
      ssl: isProduction ? { rejectUnauthorized: false } : false,
      max: 1,
      min: 0,
      idleTimeoutMillis: 0,
      connectionTimeoutMillis: 10000,
      allowExitOnIdle: true,
      statement_timeout: 30000,
      query_timeout: 30000,
    });
  }
  
  // Handle pool errors
  pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
  });
  
  isPoolInitialized = true;
}

// Initialize pool on first import
initializePool();

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

// Execute query function optimized for Neon DB with retry logic
import type { QueryResult } from 'pg';

export const query = async (text: string, params?: unknown[], retries = 2): Promise<QueryResult> => {
  const start = Date.now();
  let client: PoolClient | undefined;
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      // Ensure pool is initialized
      if (!isPoolInitialized) {
        initializePool();
      }
      
      // Get a client from the pool
      client = await pool.connect();
      const res = await client.query(text, params);
      const duration = Date.now() - start;
      
      if (process.env.NODE_ENV !== 'production') {
        console.log('Executed query', { 
          text: text.substring(0, 100), 
          duration, 
          rows: res.rowCount,
          attempt: attempt + 1
        });
      }
      
      return res;
    } catch (error: unknown) {
      console.error(`Query error (attempt ${attempt + 1}):`, error);
      
      // Release client if we have one
      if (client) {
        client.release();
        client = undefined;
      }
      
      // Check if we should retry
      const errorCode = (error as { code?: string })?.code;
      const errorMessage = (error as { message?: string })?.message;
      
      const shouldRetry = attempt < retries && (
        errorCode === 'ECONNRESET' ||
        errorCode === 'ENOTFOUND' ||
        errorCode === 'ETIMEDOUT' ||
        errorMessage?.includes('Connection terminated') ||
        errorMessage?.includes('connect ECONNREFUSED')
      );
      
      if (shouldRetry) {
        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        continue;
      }
      
      throw error;
    } finally {
      // Always release the client back to the pool
      if (client) {
        client.release();
      }
    }
  }
  
  throw new Error('Query failed after all retry attempts');
};

// Get client from pool
export const getClient = async () => {
  if (!isPoolInitialized) {
    initializePool();
  }
  return pool.connect();
};

// Ensure pool is initialized before exporting
if (!isPoolInitialized) {
  initializePool();
}

export default pool;
