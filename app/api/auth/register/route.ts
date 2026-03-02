import { NextRequest, NextResponse } from 'next/server';
import { createUser } from '@/lib/auth';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'your-secret-key';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Create user
    const user = await createUser(email, password, name);

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
    }, { status: 201 });
  } catch (error: any) {
    console.error('Registration error:', error);
    
    if (error.message === 'Email already exists') {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}
