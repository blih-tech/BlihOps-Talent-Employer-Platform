#!/usr/bin/env node

/**
 * Environment Variable Validation Script
 * 
 * Validates that all required environment variables are set.
 * Run this script before starting the application to catch missing variables early.
 */

const fs = require('fs');
const path = require('path');

// Required environment variables by package
const REQUIRED_VARS = {
  root: [
    'POSTGRES_USER',
    'POSTGRES_PASSWORD',
    'POSTGRES_DB',
    'DATABASE_URL',
    'REDIS_URL',
    'JWT_SECRET',
    'TELEGRAM_BOT_TOKEN',
  ],
  'api-backend': [
    'DATABASE_URL',
    'REDIS_URL',
    'JWT_SECRET',
    'PORT',
  ],
  'telegram-bot': [
    'TELEGRAM_BOT_TOKEN',
    'API_URL',
    'REDIS_URL',
  ],
  'admin-web': [
    'NEXT_PUBLIC_API_URL',
    'NEXTAUTH_URL',
    'NEXTAUTH_SECRET',
    'DATABASE_URL',
  ],
};

// Optional but recommended variables
const RECOMMENDED_VARS = {
  root: [
    'SENTRY_DSN',
    'LOG_LEVEL',
  ],
};

function validateEnv(packageName = 'root') {
  const vars = REQUIRED_VARS[packageName] || [];
  const recommended = RECOMMENDED_VARS[packageName] || [];
  const missing = [];
  const missingRecommended = [];

  console.log(`\n🔍 Validating environment variables for: ${packageName === 'root' ? 'root' : `packages/${packageName}`}\n`);

  // Check required variables
  vars.forEach((varName) => {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  });

  // Check recommended variables
  recommended.forEach((varName) => {
    if (!process.env[varName]) {
      missingRecommended.push(varName);
    }
  });

  // Report results
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    missing.forEach((varName) => {
      console.error(`   - ${varName}`);
    });
    console.error('\n💡 Create a .env file based on .env.example\n');
    return false;
  }

  if (missingRecommended.length > 0) {
    console.warn('⚠️  Missing recommended environment variables:');
    missingRecommended.forEach((varName) => {
      console.warn(`   - ${varName}`);
    });
    console.warn('\n💡 These are optional but recommended for production\n');
  }

  if (missing.length === 0) {
    console.log('✅ All required environment variables are set\n');
  }

  return missing.length === 0;
}

// Validate specific package or all
const packageName = process.argv[2] || 'root';

if (packageName === 'all') {
  let allValid = true;
  Object.keys(REQUIRED_VARS).forEach((pkg) => {
    if (!validateEnv(pkg)) {
      allValid = false;
    }
  });
  process.exit(allValid ? 0 : 1);
} else {
  const isValid = validateEnv(packageName);
  process.exit(isValid ? 0 : 1);
}




