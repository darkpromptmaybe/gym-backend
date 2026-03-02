import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'your-secret-key';

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
}

/**
 * Extract and verify JWT token from Authorization header
 */
export function extractAuthToken(request: NextRequest): string | null {
  const authHeader = request.headers.get('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  return authHeader.substring(7); // Remove 'Bearer ' prefix
}

/**
 * Verify JWT token and return user data
 */
export function verifyAuthToken(token: string): AuthUser | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return {
      id: decoded.id,
      email: decoded.email,
      name: decoded.name,
    };
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

/**
 * Get authenticated user from request
 */
export function getAuthUser(request: NextRequest): AuthUser | null {
  const token = extractAuthToken(request);
  if (!token) return null;
  
  return verifyAuthToken(token);
}
