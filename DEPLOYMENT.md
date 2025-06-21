# 🚀 Vercel Deployment Guide

## Prerequisites

1. **Database Setup** (Choose one):
   - [Neon](https://neon.tech) (Recommended)
   - [Supabase](https://supabase.com)
   - [PlanetScale](https://planetscale.com)
   - Any PostgreSQL provider

2. **GitHub Repository**
   - Push your code to GitHub
   - Make sure all changes are committed

## Step-by-Step Deployment

### 1. Database Setup (Neon Example)

1. Go to [Neon Console](https://console.neon.tech)
2. Create a new project
3. Copy the connection string
4. It should look like: `postgresql://username:password@host/database?sslmode=require`

### 2. Vercel Deployment

1. **Import Project**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your GitHub repository

2. **Configure Environment Variables**
   Add these in Vercel's Environment Variables section:

   ```
   DATABASE_URL=your_neon_database_url_here
   JWT_SECRET=your_secure_random_string_here
   NEXTAUTH_SECRET=your_secure_nextauth_string_here
   NEXTAUTH_URL=https://your-app-name.vercel.app
   NODE_ENV=production
   SKIP_ENV_VALIDATION=true
   ```

3. **Deploy**
   - Click "Deploy"
   - Vercel will automatically build and deploy your app

### 3. Post-Deployment Setup

1. **Database Migration**
   - After first deployment, run database migration
   - Go to your Vercel project dashboard
   - In Functions tab, you can run: `npx prisma db push`

2. **Seed Database** (Optional)
   - Run the seed script to create initial data
   - Use Vercel CLI or database client

## Environment Variables Explained

- `DATABASE_URL`: Your PostgreSQL connection string
- `JWT_SECRET`: Secret key for JWT tokens (generate a random 32+ character string)
- `NEXTAUTH_SECRET`: Secret for NextAuth.js (generate a random 32+ character string)
- `NEXTAUTH_URL`: Your deployed app URL
- `NODE_ENV`: Set to "production"
- `SKIP_ENV_VALIDATION`: Helps with Vercel build process

## Troubleshooting

### Common Issues:

1. **Build Fails**
   - Check environment variables are set correctly
   - Ensure DATABASE_URL is accessible from Vercel
   - Verify all required environment variables are set

2. **Database Connection Issues**
   - Verify DATABASE_URL format
   - Check if database allows external connections
   - Ensure SSL is enabled if required

3. **Prisma Issues**
   - Make sure `npx prisma generate` runs during build
   - Check binary targets in schema.prisma
   - Ensure DATABASE_URL is properly formatted

4. **ESLint/TypeScript Errors**
   - The project is configured to treat warnings as non-blocking
   - Critical errors will still fail the build

### Build Commands

The project is configured with these build commands:
- Install: `npm ci`
- Build: `npx prisma generate && npx next build`

### Quick Fix for Common Deployment Errors

If you get build errors, try these steps:

1. **Clear Vercel Cache**
   - Go to your Vercel project settings
   - Clear build cache and redeploy

2. **Check Environment Variables**
   - Ensure all required variables are set
   - DATABASE_URL should be accessible from Vercel
   - JWT_SECRET and NEXTAUTH_SECRET should be strong random strings

3. **Database Setup**
   - Make sure your database is accessible from external connections
   - Run `npx prisma db push` after first deployment to set up tables

## Security Notes

- Never commit `.env` files to Git
- Use strong, unique secrets for JWT_SECRET and NEXTAUTH_SECRET
- Enable database SSL in production
- Regularly rotate secrets

## Support

If you encounter issues:
1. Check Vercel build logs
2. Verify all environment variables
3. Test database connection
4. Check this deployment guide

---

✅ **Your app should now be live on Vercel!**
