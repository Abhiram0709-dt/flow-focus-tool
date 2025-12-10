#!/usr/bin/env node

/**
 * Generate secure random secrets for production use
 * Run with: node generate-secrets.js
 */

import crypto from 'crypto';

function generateSecret(length = 64) {
  return crypto.randomBytes(length).toString('hex');
}

console.log('\n🔐 Generated Secure Secrets for Production\n');
console.log('Copy these to your environment variables:\n');
console.log('═'.repeat(70));
console.log('\nJWT_SECRET=' + generateSecret(64));
console.log('\nSESSION_SECRET=' + generateSecret(64));
console.log('\n═'.repeat(70));
console.log('\n⚠️  Important: Keep these secrets secure and never commit them to git!\n');
console.log('💡 Tip: Generate new secrets for each environment (dev, staging, prod)\n');
