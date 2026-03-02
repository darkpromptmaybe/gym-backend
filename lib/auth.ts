import { betterAuth } from "better-auth";
import { sql } from "./db";

export const auth = betterAuth({
  database: {
    provider: "postgresql",
    url: process.env.DATABASE_URL!,
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Set to true in production
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      enabled: !!process.env.GOOGLE_CLIENT_ID,
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
  secret: process.env.BETTER_AUTH_SECRET || process.env.NEXTAUTH_SECRET!,
});

// Custom user validation
export async function validateUser(email: string, password: string) {
  try {
    const users = await sql`
      SELECT id, email, name, photo_url, password_hash 
      FROM users 
      WHERE email = ${email}
    `;
    
    if (users.length === 0) {
      return null;
    }

    const user = users[0];
    const bcrypt = require('bcryptjs');
    const isValid = await bcrypt.compare(password, user.password_hash);
    
    if (!isValid) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      photoUrl: user.photo_url,
    };
  } catch (error) {
    console.error('User validation error:', error);
    return null;
  }
}

// Create user
export async function createUser(email: string, password: string, name?: string) {
  const bcrypt = require('bcryptjs');
  const hashedPassword = await bcrypt.hash(password, 10);
  
  try {
    const result = await sql`
      INSERT INTO users (email, password_hash, name, created_at, updated_at)
      VALUES (${email}, ${hashedPassword}, ${name || null}, NOW(), NOW())
      RETURNING id, email, name, photo_url
    `;
    
    return result[0];
  } catch (error: any) {
    if (error.code === '23505') { // Unique violation
      throw new Error('Email already exists');
    }
    throw error;
  }
}

// Create or update Google user
export async function upsertGoogleUser(googleId: string, email: string, name?: string, photoUrl?: string) {
  try {
    const existing = await sql`
      SELECT id, email, name, photo_url 
      FROM users 
      WHERE google_id = ${googleId}
    `;

    if (existing.length > 0) {
      // Update existing user
      const result = await sql`
        UPDATE users 
        SET name = ${name || existing[0].name}, 
            photo_url = ${photoUrl || existing[0].photo_url},
            updated_at = NOW()
        WHERE google_id = ${googleId}
        RETURNING id, email, name, photo_url
      `;
      return result[0];
    } else {
      // Create new user
      const result = await sql`
        INSERT INTO users (email, google_id, name, photo_url, created_at, updated_at)
        VALUES (${email}, ${googleId}, ${name}, ${photoUrl}, NOW(), NOW())
        RETURNING id, email, name, photo_url
      `;
      return result[0];
    }
  } catch (error) {
    console.error('Google user upsert error:', error);
    throw error;
  }
}

export type Session = Awaited<ReturnType<typeof auth.api.getSession>>;
