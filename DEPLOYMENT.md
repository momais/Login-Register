# Deployment Guide: Neon DB + Vercel

This guide will help you deploy your authentication app using Neon DB and Vercel.

## Prerequisites

- A [Neon](https://neon.tech) account
- A [Vercel](https://vercel.com) account
- Your code pushed to a Git repository (GitHub, GitLab, or Bitbucket)

## Step 1: Set up Neon Database

1. **Create a Neon Project**
   - Go to [Neon Console](https://console.neon.tech)
   - Click "Create Project"
   - Choose a name for your project
   - Select a region close to your users

2. **Get Your Connection String**
   - In your Neon dashboard, go to "Connection Details"
   - Copy the connection string (it looks like this):
   ```
   postgresql://username:password@ep-example-123456.us-east-1.aws.neon.tech/neondb?sslmode=require
   ```

3. **Initialize Your Database**
   - Run the database initialization script locally first:
   ```bash
   # Set your DATABASE_URL locally
   export DATABASE_URL="your_neon_connection_string"
   npm run init-db
   ```

## Step 2: Deploy to Vercel

1. **Connect Your Repository**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your Git repository

2. **Configure Environment Variables**
   - In your Vercel project settings, go to "Environment Variables"
   - Add the following variables:

   ```
   DATABASE_URL=postgresql://username:password@ep-example-123456.us-east-1.aws.neon.tech/neondb?sslmode=require
   JWT_SECRET=your_super_secure_random_string_here
   NODE_ENV=production
   ```

   **Important**: 
   - Replace `DATABASE_URL` with your actual Neon connection string
   - Generate a secure random string for `JWT_SECRET` (at least 32 characters)

3. **Deploy**
   - Click "Deploy"
   - Vercel will automatically build and deploy your app

## Step 3: Verify Deployment

1. **Test Your Deployed App**
   - Visit your Vercel app URL
   - Try registering a new user
   - Try logging in with the registered user

2. **Check Logs**
   - In Vercel dashboard, go to "Functions" tab
   - Check the logs for any errors

## Troubleshooting

### Common Issues and Solutions

#### 1. Database Connection Errors

**Error**: `Connection terminated unexpectedly`

**Solution**: 
- Verify your `DATABASE_URL` is correct
- Ensure your Neon database is active (not in sleep mode)
- Check that SSL is properly configured

#### 2. JWT Secret Missing

**Error**: `JWT secret not configured`

**Solution**:
- Add `JWT_SECRET` environment variable in Vercel
- Redeploy your application

#### 3. CORS Issues

**Error**: `CORS policy: No 'Access-Control-Allow-Origin' header`

**Solution**:
- The app includes CORS middleware
- If issues persist, check the `src/middleware.ts` file
- Ensure your domain is properly configured

#### 4. Function Timeout

**Error**: `Function execution timed out`

**Solution**:
- The `vercel.json` is configured with 30-second timeout
- Check your database queries for performance issues
- Consider optimizing slow queries

### Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | Neon database connection string | `postgresql://user:pass@host/db?sslmode=require` |
| `JWT_SECRET` | Secret key for JWT token signing | `your-super-secure-random-string` |
| `NODE_ENV` | Environment mode | `production` |

### Performance Tips

1. **Database Connection Pooling**
   - The app is optimized for serverless with single connections
   - Connections are automatically released after queries

2. **Neon Database Optimization**
   - Use connection pooling in Neon console for better performance
   - Enable "Auto-suspend" to save costs during low usage

3. **Vercel Function Optimization**
   - Functions are configured with 30-second timeout
   - Cold starts are minimized with proper connection handling

## Security Considerations

1. **Environment Variables**
   - Never commit `.env` files to your repository
   - Use strong, unique JWT secrets
   - Rotate secrets regularly

2. **Database Security**
   - Neon provides built-in SSL encryption
   - Use strong database passwords
   - Regularly update dependencies

3. **CORS Configuration**
   - The app allows all origins in development
   - Consider restricting origins in production

## Monitoring and Maintenance

1. **Vercel Analytics**
   - Enable Vercel Analytics for performance monitoring
   - Monitor function execution times

2. **Neon Monitoring**
   - Check Neon dashboard for database performance
   - Monitor connection usage and query performance

3. **Error Tracking**
   - Consider integrating error tracking (Sentry, LogRocket)
   - Monitor application logs regularly

## Support

If you encounter issues:

1. Check Vercel function logs
2. Verify Neon database connectivity
3. Ensure all environment variables are set correctly
4. Review the troubleshooting section above

For additional help:
- [Neon Documentation](https://neon.tech/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
