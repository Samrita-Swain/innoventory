#!/usr/bin/env node

/**
 * Script to help set up Vercel environment variables
 * Run this script to get the exact values to copy-paste into Vercel dashboard
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Vercel Environment Variables Setup Helper\n');

// Read the local .env file
const envPath = path.join(process.cwd(), '.env');
let envVars = {};

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const lines = envContent.split('\n');
  
  lines.forEach(line => {
    if (line.trim() && !line.startsWith('#')) {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=').replace(/^["']|["']$/g, '');
        envVars[key.trim()] = value.trim();
      }
    }
  });
}

console.log('📋 Copy these values to your Vercel Environment Variables:\n');
console.log('=' .repeat(80));

// Environment variables needed for Vercel
const requiredVars = [
  {
    name: 'DATABASE_URL',
    value: envVars.DATABASE_URL || 'postgresql://neondb_owner:npg_CY4yrMOGW1Rm@ep-bitter-butterfly-a8uj5irl-pooler.eastus2.azure.neon.tech/neondb?sslmode=require',
    description: 'PostgreSQL database connection string'
  },
  {
    name: 'JWT_SECRET',
    value: envVars.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production-2024',
    description: 'Secret key for JWT token signing'
  },
  {
    name: 'NEXTAUTH_URL',
    value: 'https://innoventory-lemon.vercel.app',
    description: 'Your Vercel app URL'
  },
  {
    name: 'NEXTAUTH_SECRET',
    value: envVars.NEXTAUTH_SECRET || 'your-nextauth-secret-key-change-this-in-production-2024',
    description: 'Secret key for NextAuth.js'
  }
];

requiredVars.forEach((envVar, index) => {
  console.log(`${index + 1}. Variable Name: ${envVar.name}`);
  console.log(`   Description: ${envVar.description}`);
  console.log(`   Value: ${envVar.value}`);
  console.log(`   Environments: Production, Preview, Development (select all)`);
  console.log('-'.repeat(80));
});

console.log('\n📝 Steps to add these to Vercel:');
console.log('1. Go to https://vercel.com and open your innoventory project');
console.log('2. Click Settings → Environment Variables');
console.log('3. For each variable above, click "Add New" and copy the values');
console.log('4. Make sure to select all environments (Production, Preview, Development)');
console.log('5. After adding all variables, go to Deployments and click "Redeploy"');

console.log('\n🔍 After deployment, test these URLs:');
console.log('• Health check: https://innoventory-lemon.vercel.app/api/health');
console.log('• Login page: https://innoventory-lemon.vercel.app/auth/login');
console.log('• Customers: https://innoventory-lemon.vercel.app/dashboard/customers');
console.log('• Vendors: https://innoventory-lemon.vercel.app/dashboard/vendors');

console.log('\n✅ Once configured, your database data will display properly!');
