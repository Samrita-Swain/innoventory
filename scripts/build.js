#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting build process...');

// Check if we're in Vercel environment
const isVercel = process.env.VERCEL === '1';
const hasDatabase = !!process.env.DATABASE_URL;

console.log(`Environment: ${isVercel ? 'Vercel' : 'Local'}`);
console.log(`Database URL: ${hasDatabase ? 'Available' : 'Not available'}`);

try {
  // Step 1: Generate Prisma client
  console.log('📦 Generating Prisma client...');
  
  if (hasDatabase || isVercel) {
    // Generate Prisma client with proper binary targets
    execSync('npx prisma generate', { 
      stdio: 'inherit',
      env: {
        ...process.env,
        PRISMA_CLI_BINARY_TARGETS: 'native,rhel-openssl-1.0.x,linux-musl,debian-openssl-1.1.x'
      }
    });
    console.log('✅ Prisma client generated successfully');
  } else {
    console.log('⚠️ Skipping Prisma generation - no DATABASE_URL');
  }

  // Step 2: Build Next.js application
  console.log('🏗️ Building Next.js application...');
  execSync('npx next build', { 
    stdio: 'inherit',
    env: {
      ...process.env,
      SKIP_ENV_VALIDATION: 'true',
      NEXT_TELEMETRY_DISABLED: '1'
    }
  });
  console.log('✅ Next.js build completed successfully');

  console.log('🎉 Build process completed successfully!');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  
  // If Prisma generation fails, try to continue with Next.js build
  if (error.message.includes('prisma')) {
    console.log('⚠️ Prisma generation failed, attempting to build without it...');
    try {
      execSync('npx next build', { 
        stdio: 'inherit',
        env: {
          ...process.env,
          SKIP_ENV_VALIDATION: 'true',
          NEXT_TELEMETRY_DISABLED: '1'
        }
      });
      console.log('✅ Next.js build completed without Prisma');
    } catch (nextError) {
      console.error('❌ Next.js build also failed:', nextError.message);
      process.exit(1);
    }
  } else {
    process.exit(1);
  }
}
