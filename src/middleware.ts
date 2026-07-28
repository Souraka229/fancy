import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Allow login page without authentication
  if (pathname === '/admin/login') {
    return NextResponse.next();
  }
  
  // Protect admin routes
  if (pathname.startsWith('/admin')) {
    const authHeader = request.headers.get('authorization');
    const adminToken = process.env.ADMIN_SECRET_TOKEN;
    
    // Check for token in header or cookie
    const token = authHeader?.replace('Bearer ', '') || 
                 request.cookies.get('admin_token')?.value;
    
    if (!token || token !== adminToken) {
      // Redirect to login
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: '/admin/:path*',
};
