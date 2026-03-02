import { neon, NeonQueryFunction, neonConfig } from '@neondatabase/serverless';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

// Configure Neon to use fetch for connection pooling (shared client mode)
neonConfig.fetchConnectionCache = true;

// Create shared base SQL connection (reused across requests)
export const sql = neon(process.env.DATABASE_URL);

// Create authenticated SQL connection with JWT for Neon Authorize
// This uses a shared client with per-request JWT tokens
export function getAuthenticatedSql(authToken?: string): NeonQueryFunction<false, false> {
  if (!authToken) {
    return sql;
  }
  
  // For Neon Authorize with shared client: configure with JWT in Authorization header
  // The shared client will reuse connections while injecting the JWT per request
  const authenticatedSql = neon(process.env.DATABASE_URL!, {
    fetchOptions: {
      headers: {
        'Authorization': `Bearer ${authToken}`,
      },
    },
  });
  
  return authenticatedSql;
}

export async function testConnection() {
  try {
    const result = await sql`SELECT NOW()`;
    console.log('✅ Database connected:', result[0]);
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
}
