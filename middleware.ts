import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'your-secret-key';

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Allow auth routes to pass through
  if (pathname.startsWith('/api/auth')) {
    return NextResponse.next();
  }

  // Protect all /api/data routes
  if (pathname.startsWith('/api/data')) {
    try {
      const authHeader = request.headers.get('authorization');
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json(
          { error: "Unauthorized", message: "Valid token required" },
          { status: 401 }
        );
      }

      const token = authHeader.substring(7); // Remove 'Bearer ' prefix
      const decoded = jwt.verify(token, JWT_SECRET) as any;

      // Attach user info to headers for downstream use
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-user-id', decoded.id.toString());
      requestHeaders.set('x-user-email', decoded.email);

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    } catch (error) {
      console.error('Auth middleware error:', error);
      return NextResponse.json(
        { error: "Unauthorized", message: "Invalid or expired token" },
        { status: 401 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/:path*'],
};
