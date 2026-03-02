import { NextRequest, NextResponse } from 'next/server';
import { upsertGoogleUser } from '@/lib/auth';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'your-secret-key';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, google_id, name, photo_url } = body;

    if (!email || !google_id) {
      return NextResponse.json(
        { error: 'Email and Google ID are required' },
        { status: 400 }
      );
    }

    // Create or update Google user
    const user = await upsertGoogleUser(google_id, email, name, photo_url);

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email,
        name: user.name 
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return NextResponse.json({
      success: true,
      data: {
        id: user.id.toString(),
        email: user.email,
        name: user.name,
        photo_url: user.photo_url,
        access_token: token,
      },
    });
  } catch (error: any) {
    console.error('Google auth error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}
