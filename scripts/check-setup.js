#!/usr/bin/env node

/**
 * Pre-deployment sanity check
 * Verifies all environment variables and configuration
 */

const fs = require('fs');
const path = require('path');

console.log('\n🔍 Gmail AI Assistant - Setup Check\n');

const checks = [];
let hasErrors = false;

// Check 1: .env.local exists
try {
  const envPath = path.join(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    checks.push({ name: '.env.local file exists', status: '✅' });
  } else {
    checks.push({ name: '.env.local file exists', status: '❌', error: 'File not found' });
    hasErrors = true;
  }
} catch (error) {
  checks.push({ name: '.env.local file exists', status: '❌', error: error.message });
  hasErrors = true;
}

// Check 2: Required environment variables
const requiredEnvVars = [
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL',
  'OPENAI_API_KEY',
  'DATABASE_URL',
  'TOKEN_ENCRYPTION_KEY',
];

requiredEnvVars.forEach((varName) => {
  if (process.env[varName]) {
    const value = process.env[varName];
    const masked = value.length > 10 ? value.substring(0, 10) + '...' : '***';
    checks.push({ name: `${varName}`, status: '✅', value: masked });
  } else {
    checks.push({ name: `${varName}`, status: '❌', error: 'Not set' });
    hasErrors = true;
  }
});

// Check 3: Prisma schema exists
try {
  const schemaPath = path.join(process.cwd(), 'prisma', 'schema.prisma');
  if (fs.existsSync(schemaPath)) {
    checks.push({ name: 'Prisma schema exists', status: '✅' });
  } else {
    checks.push({ name: 'Prisma schema exists', status: '❌', error: 'File not found' });
    hasErrors = true;
  }
} catch (error) {
  checks.push({ name: 'Prisma schema exists', status: '❌', error: error.message });
  hasErrors = true;
}

// Check 4: node_modules exists
try {
  const nodeModulesPath = path.join(process.cwd(), 'node_modules');
  if (fs.existsSync(nodeModulesPath)) {
    checks.push({ name: 'Dependencies installed', status: '✅' });
  } else {
    checks.push({ name: 'Dependencies installed', status: '❌', error: 'Run npm install' });
    hasErrors = true;
  }
} catch (error) {
  checks.push({ name: 'Dependencies installed', status: '❌', error: error.message });
  hasErrors = true;
}

// Check 5: Prisma client generated
try {
  const prismaClientPath = path.join(process.cwd(), 'node_modules', '.prisma', 'client');
  if (fs.existsSync(prismaClientPath)) {
    checks.push({ name: 'Prisma client generated', status: '✅' });
  } else {
    checks.push({ name: 'Prisma client generated', status: '⚠️', error: 'Run npx prisma generate' });
  }
} catch (error) {
  checks.push({ name: 'Prisma client generated', status: '⚠️', error: error.message });
}

// Check 6: Key strength
if (process.env.TOKEN_ENCRYPTION_KEY) {
  const key = process.env.TOKEN_ENCRYPTION_KEY;
  try {
    const keyBuffer = Buffer.from(key, 'base64');
    if (keyBuffer.length === 32) {
      checks.push({ name: 'Encryption key strength', status: '✅', value: '32 bytes (AES-256)' });
    } else {
      checks.push({
        name: 'Encryption key strength',
        status: '⚠️',
        error: `${keyBuffer.length} bytes (expected 32)`,
      });
    }
  } catch (error) {
    checks.push({ name: 'Encryption key strength', status: '❌', error: 'Invalid base64' });
    hasErrors = true;
  }
}

if (process.env.NEXTAUTH_SECRET) {
  const secret = process.env.NEXTAUTH_SECRET;
  if (secret.length >= 32) {
    checks.push({ name: 'NextAuth secret strength', status: '✅', value: `${secret.length} chars` });
  } else {
    checks.push({
      name: 'NextAuth secret strength',
      status: '⚠️',
      error: `${secret.length} chars (recommended: 32+)`,
    });
  }
}

// Check 7: Database URL format
if (process.env.DATABASE_URL) {
  const dbUrl = process.env.DATABASE_URL;
  if (dbUrl.startsWith('postgresql://') || dbUrl.startsWith('postgres://')) {
    checks.push({ name: 'Database URL format', status: '✅', value: 'PostgreSQL' });
  } else {
    checks.push({ name: 'Database URL format', status: '⚠️', error: 'Expected PostgreSQL URL' });
  }
}

// Check 8: NEXTAUTH_URL format
if (process.env.NEXTAUTH_URL) {
  const url = process.env.NEXTAUTH_URL;
  if (url.startsWith('http://') || url.startsWith('https://')) {
    checks.push({ name: 'NEXTAUTH_URL format', status: '✅', value: url });
  } else {
    checks.push({ name: 'NEXTAUTH_URL format', status: '❌', error: 'Must start with http:// or https://' });
    hasErrors = true;
  }
}

// Print results
console.log('Configuration Checks:');
console.log('─'.repeat(60));

checks.forEach((check) => {
  const name = check.name.padEnd(35);
  if (check.error) {
    console.log(`${check.status} ${name} - ${check.error}`);
  } else if (check.value) {
    console.log(`${check.status} ${name} - ${check.value}`);
  } else {
    console.log(`${check.status} ${name}`);
  }
});

console.log('─'.repeat(60));

if (hasErrors) {
  console.log('\n❌ Setup incomplete. Fix errors above before proceeding.\n');
  process.exit(1);
} else {
  console.log('\n✅ All checks passed! Ready to run:\n');
  console.log('   Development: npm run dev');
  console.log('   Production:  npm run build && npm start');
  console.log('   Deploy:      git push (if connected to Vercel)\n');
  process.exit(0);
}
