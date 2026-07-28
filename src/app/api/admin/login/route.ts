import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { password } = await request.json();
    const adminToken = process.env.ADMIN_SECRET_TOKEN;

    if (!password || !adminToken) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // In production, use a proper password hashing library like bcrypt
    // For now, we'll use a simple comparison
    if (password === adminToken) {
      return NextResponse.json({ 
        token: adminToken,
        success: true 
      });
    }

    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
