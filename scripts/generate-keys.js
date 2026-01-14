#!/usr/bin/env node

/**
 * Generate secure random keys for environment variables
 * Run with: node scripts/generate-keys.js
 */

const crypto = require('crypto');

console.log('\n=== Gmail AI Assistant - Key Generation ===\n');

// Generate NEXTAUTH_SECRET (32 bytes, base64)
const nextauthSecret = crypto.randomBytes(32).toString('base64');
console.log('NEXTAUTH_SECRET:');
console.log(nextauthSecret);
console.log('');

// Generate TOKEN_ENCRYPTION_KEY (32 bytes for AES-256, base64)
const encryptionKey = crypto.randomBytes(32).toString('base64');
console.log('TOKEN_ENCRYPTION_KEY:');
console.log(encryptionKey);
console.log('');

console.log('Copy these values to your .env.local file');
console.log('NEVER commit these keys to version control!');
console.log('');
