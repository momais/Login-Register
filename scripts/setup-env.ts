#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

const envTemplate = `# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/authflow_db
DB_HOST=localhost
DB_PORT=5432
DB_NAME=authflow_db
DB_USER=username
DB_PASSWORD=password

# Next.js Configuration
NEXTAUTH_SECRET=your-secret-key-here-change-this-in-production
NEXTAUTH_URL=http://localhost:3000`;

const envPath = path.join(process.cwd(), '.env.local');

if (!fs.existsSync(envPath)) {
  fs.writeFileSync(envPath, envTemplate);
  console.log('✅ Created .env.local file');
  console.log('📝 Please update the database credentials in .env.local');
} else {
  console.log('⚠️  .env.local already exists');
}

console.log('\n🚀 Next steps:');
console.log('1. Update database credentials in .env.local');
console.log('2. Make sure PostgreSQL is running');
console.log('3. Run: npm run init-db');
console.log('4. Run: npm run dev');
