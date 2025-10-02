import { NextRequest, NextResponse } from 'next/server';
import { UserService } from '@/services/userService';
import { generateToken } from '@/lib/jwt';

// CORS headers for cross-origin requests
const corsHeaders = {
  'Access-Control-Allow-Origin': process.env.NODE_ENV === 'production' 
    ? 'https://your-domain.vercel.app' 
    : '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Credentials': 'true',
};

export async function OPTIONS() {
  return new Response(null, { status: 200, headers: corsHeaders });
}

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json();

    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json(
        { message: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: 'Please enter a valid email address' },
        { status: 400 }
      );
    }

    // Password validation
    if (password.length < 6) {
      return NextResponse.json(
        { message: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Create user using PostgreSQL
    const newUser = await UserService.createUser({
      name,
      email,
      password,
    });

    if (!newUser) {
      return NextResponse.json(
        { message: 'Failed to create user' },
        { status: 500 }
      );
    }

    // Generate token
    const token = generateToken(newUser.id, newUser.email);

    // Return user data (without password) and token
    return NextResponse.json({
      message: 'User created successfully',
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
      },
    }, { headers: corsHeaders });
  } catch (error: unknown) {
    // Handle specific database errors
    if (error instanceof Error && error.message === 'User with this email already exists') {
      return NextResponse.json(
        { message: 'User with this email already exists' },
        { status: 400, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500, headers: corsHeaders }
    );
  }
}
