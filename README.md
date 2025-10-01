# AuthFlow - PostgreSQL Authentication App

A modern, secure authentication platform built with Next.js, TypeScript, Tailwind CSS, and PostgreSQL.

## 🚀 Features

- **Modern UI/UX**: Professional design with Tailwind CSS
- **Secure Authentication**: Password hashing with bcryptjs
- **PostgreSQL Database**: Robust data persistence
- **TypeScript**: Type-safe development
- **Responsive Design**: Works on all devices
- **Real-time Validation**: Form validation with instant feedback

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **PostgreSQL** (v12 or higher)
- **npm** or **yarn**

## 🛠️ Installation & Setup

### 1. Clone and Install Dependencies

```bash
cd nextapp
npm install
```

### 2. PostgreSQL Setup

#### Option A: Using Docker (Recommended)
```bash
# Run PostgreSQL in Docker
docker run --name authflow-postgres \
  -e POSTGRES_DB=authflow_db \
  -e POSTGRES_USER=username \
  -e POSTGRES_PASSWORD=password \
  -p 5432:5432 \
  -d postgres:15
```

#### Option B: Local PostgreSQL Installation
1. Install PostgreSQL on your system
2. Create a database named `authflow_db`
3. Create a user with appropriate permissions

### 3. Environment Configuration

Create a `.env.local` file in the root directory:

```env
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/authflow_db
DB_HOST=localhost
DB_PORT=5432
DB_NAME=authflow_db
DB_USER=username
DB_PASSWORD=password

# Next.js Configuration
NEXTAUTH_SECRET=your-secret-key-here-change-this-in-production
NEXTAUTH_URL=http://localhost:3000
```

### 4. Initialize Database

```bash
npm run init-db
```

This will:
- Create the database if it doesn't exist
- Create the users table with proper schema
- Set up indexes and triggers
- Verify the connection

### 5. Start Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see your application.

## 🗄️ Database Schema

### Users Table

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

## 🔧 API Endpoints

### Authentication

- **POST** `/api/auth/register` - Register a new user
- **POST** `/api/auth/login` - Login user

### Request/Response Examples

#### Register User
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

#### Login User
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

## 🏗️ Project Structure

```
nextapp/
├── src/
│   ├── app/
│   │   ├── api/auth/          # Authentication API routes
│   │   ├── login/             # Login page
│   │   ├── register/          # Register page
│   │   └── globals.css        # Global styles
│   ├── contexts/
│   │   └── AuthContext.tsx    # Authentication context
│   ├── lib/
│   │   └── database.ts        # Database connection
│   └── services/
│       └── userService.ts     # User operations
├── database/
│   └── schema.sql             # Database schema
├── scripts/
│   └── init-db.ts             # Database initialization
└── package.json
```

## 🔒 Security Features

- **Password Hashing**: Uses bcryptjs with salt rounds
- **Input Validation**: Server-side validation for all inputs
- **SQL Injection Protection**: Parameterized queries
- **Environment Variables**: Sensitive data in environment files
- **HTTPS Ready**: SSL configuration for production

## 🚀 Deployment

### Production Environment Variables

```env
DATABASE_URL=postgresql://username:password@your-db-host:5432/authflow_db
NEXTAUTH_SECRET=your-production-secret-key
NEXTAUTH_URL=https://your-domain.com
NODE_ENV=production
```

### Build for Production

```bash
npm run build
npm start
```

## 🐛 Troubleshooting

### Database Connection Issues

1. **Check PostgreSQL is running**:
   ```bash
   # For Docker
   docker ps | grep postgres
   
   # For local installation
   sudo systemctl status postgresql
   ```

2. **Verify connection details**:
   - Check host, port, database name, username, and password
   - Ensure PostgreSQL is accepting connections

3. **Test connection manually**:
   ```bash
   psql -h localhost -p 5432 -U username -d authflow_db
   ```

### Common Issues

- **"Database does not exist"**: Run `npm run init-db`
- **"Connection refused"**: Check if PostgreSQL is running
- **"Authentication failed"**: Verify username/password in `.env.local`

## 📝 Development

### Adding New Features

1. Create database migrations in `database/` folder
2. Update `userService.ts` for new operations
3. Add API routes in `src/app/api/`
4. Update frontend components as needed

### Database Migrations

For schema changes, create new SQL files and update the initialization script.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

If you encounter any issues:

1. Check the troubleshooting section
2. Review the console logs
3. Verify your environment configuration
4. Create an issue with detailed information

---

**Happy coding! 🎉**