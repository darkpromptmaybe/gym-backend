import { neon, NeonQueryFunction } from '@neondatabase/serverless';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

// Create base SQL connection
export const sql = neon(process.env.DATABASE_URL);

// Create authenticated SQL connection with JWT for Neon Authorize
// Neon Authorize uses the JWT in the Authorization header when making queries
export function getAuthenticatedSql(authToken?: string): NeonQueryFunction<false, false> {
  if (!authToken) {
    return sql;
  }
  
  // For Neon Authorize, configure the connection with JWT
  // The token will be passed via the neonConfig.fetchOptions
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
