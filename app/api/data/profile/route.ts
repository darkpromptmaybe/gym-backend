import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedSql } from '@/lib/db';
import { extractAuthToken, getAuthUser } from '@/lib/auth-helpers';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Extract JWT token for Neon Authorize
    const token = extractAuthToken(request);
    const user = getAuthUser(request);

    if (!user || !token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Use authenticated SQL connection with JWT for Neon Authorize
    const sql = getAuthenticatedSql(token);

    // Fetch user profile from database
    // With Neon Authorize, row-level security policies can be applied
    const users = await sql`
      SELECT id, email, name, photo_url, created_at
      FROM users
      WHERE id = ${user.id}
    `;

    if (users.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const userProfile = users[0];

    return NextResponse.json({
      success: true,
      data: {
        id: userProfile.id.toString(),
        email: userProfile.email,
        name: userProfile.name,
        photo_url: userProfile.photo_url,
        created_at: userProfile.created_at,
      },
    });
  } catch (error: any) {
    console.error('Profile fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
