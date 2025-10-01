import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables from .env.local explicitly (Windows-friendly)
const envLoaded = dotenv.config({ path: path.join(process.cwd(), '.env.local') });
if (envLoaded.error) {
  // Fallback to .env if .env.local not present
  dotenv.config();
}

// Database configuration
const dbConfig = {
  connectionString: process.env.DATABASE_URL,
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'authflow_db',
  user: process.env.DB_USER || 'username',
  password: process.env.DB_PASSWORD || 'password',
  ssl: false,
} as const;

function getAdminConfig() {
  if (dbConfig.connectionString) {
    try {
      const url = new URL(dbConfig.connectionString);
      return {
        host: url.hostname,
        port: parseInt(url.port || '5432'),
        user: decodeURIComponent(url.username),
        password: decodeURIComponent(url.password),
        database: 'postgres',
        ssl: false,
      };
    } catch {
      // fall back to simple connection string usage
      return { connectionString: dbConfig.connectionString, ssl: false } as any;
    }
  }
  return {
    host: dbConfig.host,
    port: dbConfig.port,
    user: dbConfig.user,
    password: dbConfig.password,
    database: 'postgres',
    ssl: false,
  };
}

function getTargetDbConfig() {
  if (dbConfig.connectionString) {
    try {
      const url = new URL(dbConfig.connectionString);
      return {
        host: url.hostname,
        port: parseInt(url.port || '5432'),
        user: decodeURIComponent(url.username),
        password: decodeURIComponent(url.password),
        database: (url.pathname || '/').replace(/^\//, '') || dbConfig.database,
        ssl: false,
      };
    } catch {
      return { connectionString: dbConfig.connectionString, ssl: false } as any;
    }
  }
  return {
    host: dbConfig.host,
    port: dbConfig.port,
    database: dbConfig.database,
    user: dbConfig.user,
    password: dbConfig.password,
    ssl: false,
  };
}

async function initializeDatabase() {
  console.log('🚀 Starting database initialization...');
  const adminCfg = getAdminConfig() as any;
  const targetCfg = getTargetDbConfig() as any;
  console.log(`🔧 Using admin connection to ${adminCfg.host}:${adminCfg.port} as ${adminCfg.user}`);
  console.log(`📚 Target database: ${targetCfg.database}`);
  
  try {
    // Connect to PostgreSQL server (admin connection, defaulting to postgres DB)
    const adminPool = new Pool(adminCfg);

    // Check if database exists
    const dbExists = await adminPool.query(
      'SELECT 1 FROM pg_database WHERE datname = $1',
      [dbConfig.database]
    );

    if (dbExists.rows.length === 0) {
      console.log(`📦 Creating database: ${dbConfig.database}`);
      await adminPool.query(`CREATE DATABASE ${dbConfig.database}`);
      console.log('✅ Database created successfully');
    } else {
      console.log('✅ Database already exists');
    }

    await adminPool.end();

    // Now connect to the specific database
    const pool = new Pool(targetCfg);
    
    // Read and execute schema
    const schemaPath = path.join(process.cwd(), 'database', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('📋 Executing schema...');
    await pool.query(schema);
    console.log('✅ Schema executed successfully');

    // Test the connection
    const result = await pool.query('SELECT COUNT(*) FROM users');
    console.log(`📊 Users table ready with ${result.rows[0].count} records`);

    await pool.end();
    console.log('🎉 Database initialization completed successfully!');
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
}

// Run initialization if this file is executed directly
if (require.main === module) {
  initializeDatabase();
}

export default initializeDatabase;
