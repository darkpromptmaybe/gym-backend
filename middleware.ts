import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Allow auth routes to pass through
  if (pathname.startsWith('/api/auth')) {
    return NextResponse.next();
  }

  // Protect all /api/data routes
  if (pathname.startsWith('/api/data')) {
    try {
      const session = await auth.api.getSession({ 
        headers: request.headers 
      });
      
      if (!session || !session.user) {
        return NextResponse.json(
          { error: "Unauthorized", message: "Valid session required" },
          { status: 401 }
        );
      }

      // Attach user info to headers for downstream use
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-user-id', session.user.id);
      requestHeaders.set('x-user-email', session.user.email);

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    } catch (error) {
      console.error('Auth middleware error:', error);
      return NextResponse.json(
        { error: "Unauthorized", message: "Invalid session" },
        { status: 401 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/:path*'],
};
