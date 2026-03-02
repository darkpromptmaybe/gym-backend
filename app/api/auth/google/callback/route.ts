import { NextRequest, NextResponse } from 'next/server';
import { upsertGoogleUser } from '@/lib/auth';
import jwt from 'jsonwebtoken';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/auth/google/callback';
const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'your-secret-key';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state'); // This contains the original redirect URL
    const error = searchParams.get('error');

    if (error) {
      const redirectUrl = state || 'http://localhost:54321';
      return NextResponse.redirect(`${redirectUrl}?error=access_denied`);
    }

    if (!code) {
      const redirectUrl = state || 'http://localhost:54321';
      return NextResponse.redirect(`${redirectUrl}?error=missing_code`);
    }

    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
      return NextResponse.json(
        { error: 'Google OAuth not configured properly' },
        { status: 500 }
      );
    }

    // Exchange authorization code for access token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: GOOGLE_REDIRECT_URI,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange code for token');
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // Get user info from Google
    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!userInfoResponse.ok) {
      throw new Error('Failed to get user info from Google');
    }

    const googleUser = await userInfoResponse.json();

    // Create or update user in database
    const user = await upsertGoogleUser(
      googleUser.id,
      googleUser.email,
      googleUser.name,
      googleUser.picture
    );

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

    // Redirect back to frontend with token
    const redirectUrl = state || 'http://localhost:54321';
    const finalUrl = new URL(redirectUrl);
    finalUrl.searchParams.set('token', token);
    finalUrl.searchParams.set('user', JSON.stringify({
      id: user.id.toString(),
      email: user.email,
      name: user.name,
      photo_url: user.photo_url,
    }));

    return NextResponse.redirect(finalUrl.toString());
  } catch (error: any) {
    console.error('Google OAuth callback error:', error);
    const redirectUrl = request.nextUrl.searchParams.get('state') || 'http://localhost:54321';
    return NextResponse.redirect(`${redirectUrl}?error=authentication_failed&message=${encodeURIComponent(error.message)}`);
  }
}
