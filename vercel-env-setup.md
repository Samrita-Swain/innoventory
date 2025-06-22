# Vercel Environment Variables Setup Guide

## Step-by-Step Instructions

### 1. Access Vercel Dashboard
1. Go to [https://vercel.com](https://vercel.com)
2. Log in to your account
3. Find and click on your `innoventory` project

### 2. Navigate to Environment Variables
1. Click on the **Settings** tab
2. In the left sidebar, click **Environment Variables**

### 3. Add Each Environment Variable

Click **Add New** for each variable below:

#### Variable 1: DATABASE_URL
- **Name:** `DATABASE_URL`
- **Value:** `postgresql://neondb_owner:npg_CY4yrMOGW1Rm@ep-bitter-butterfly-a8uj5irl-pooler.eastus2.azure.neon.tech/neondb?sslmode=require`
- **Environments:** Check all boxes (Production, Preview, Development)
- Click **Save**

#### Variable 2: JWT_SECRET
- **Name:** `JWT_SECRET`
- **Value:** `your-super-secret-jwt-key-change-this-in-production-2024`
- **Environments:** Check all boxes (Production, Preview, Development)
- Click **Save**

#### Variable 3: NEXTAUTH_URL
- **Name:** `NEXTAUTH_URL`
- **Value:** `https://innoventory-lemon.vercel.app`
- **Environments:** Check all boxes (Production, Preview, Development)
- Click **Save**

#### Variable 4: NEXTAUTH_SECRET
- **Name:** `NEXTAUTH_SECRET`
- **Value:** `your-nextauth-secret-key-change-this-in-production-2024`
- **Environments:** Check all boxes (Production, Preview, Development)
- Click **Save**

### 4. Redeploy Your Application
1. Go to the **Deployments** tab
2. Find your latest deployment
3. Click the **3 dots menu** (⋯) next to it
4. Select **Redeploy**
5. Wait for deployment to complete (usually 1-2 minutes)

### 5. Verify the Setup
After redeployment, test these URLs:

1. **Health Check:** https://innoventory-lemon.vercel.app/api/health
   - Should show "database": "connected"

2. **Login:** https://innoventory-lemon.vercel.app/auth/login
   - Use: admin@innoventory.com / admin123

3. **Customers:** https://innoventory-lemon.vercel.app/dashboard/customers
   - Should display your database data

4. **Vendors:** https://innoventory-lemon.vercel.app/dashboard/vendors
   - Should display your database data

## Troubleshooting

If data still doesn't appear:
1. Check that all 4 environment variables are added
2. Ensure you selected all environments (Production, Preview, Development)
3. Make sure you redeployed after adding variables
4. Check the health endpoint for connection status

## Alternative: Using Vercel CLI

If you prefer command line:

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Add environment variables
vercel env add DATABASE_URL
vercel env add JWT_SECRET
vercel env add NEXTAUTH_URL
vercel env add NEXTAUTH_SECRET

# Redeploy
vercel --prod
```
