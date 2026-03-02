#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
require('dotenv').config();

const vercelPath = path.join(__dirname, '../vercel.json');
const envVars = [
  'DATABASE_URL',
  'DATABASE_URL_UNPOOLED',
  'NEXTAUTH_SECRET',
  'BETTER_AUTH_SECRET',
  'BETTER_AUTH_URL',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET'
];

// Read vercel.json
let vercelConfig = JSON.parse(fs.readFileSync(vercelPath, 'utf8'));

// Add env vars from process.env
envVars.forEach(envVar => {
  if (process.env[envVar]) {
    if (!vercelConfig.env) {
      vercelConfig.env = {};
    }
    vercelConfig.env[envVar] = process.env[envVar];
    console.log(`✓ Added ${envVar}`);
  } else {
    console.log(`⚠ Skipped ${envVar} (not found in environment)`);
  }
});

// Write updated vercel.json
fs.writeFileSync(vercelPath, JSON.stringify(vercelConfig, null, 2));
console.log('\n✓ vercel.json updated successfully!');
