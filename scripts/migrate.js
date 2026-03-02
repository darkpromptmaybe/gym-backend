#!/usr/bin/env node

const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

async function runMigration() {
  const sql = neon(process.env.DATABASE_URL);
  
  console.log('Running database migration...\n');
  
  try {
    // Create users table
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255),
        name VARCHAR(255),
        photo_url TEXT,
        google_id VARCHAR(255) UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('✓ Users table created');
    
    // Create indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`;
    console.log('✓ Email index created');
    
    await sql`CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id)`;
    console.log('✓ Google ID index created');
    
    // Create trigger function
    await sql`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ language 'plpgsql'
    `;
    console.log('✓ Trigger function created');
    
    // Create trigger
    await sql`
      DROP TRIGGER IF EXISTS update_users_updated_at ON users
    `;
    await sql`
      CREATE TRIGGER update_users_updated_at 
      BEFORE UPDATE ON users
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
    `;
    console.log('✓ Trigger created');
    
    console.log('\n✓ Database schema created successfully!');
  } catch (error) {
    console.error('✗ Migration failed:', error.message);
    process.exit(1);
  }
}

runMigration();
