import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// Simple admin authentication using environment variables
// In production, use a proper auth system like NextAuth.js
export function isAdminAuthenticated(request: Request): boolean {
  const authHeader = request.headers.get('authorization');
  const adminToken = process.env.ADMIN_SECRET_TOKEN;
  
  if (!authHeader || !adminToken) {
    return false;
  }
  
  const token = authHeader.replace('Bearer ', '');
  return token === adminToken;
}

export function requireAdminAuth(request: Request) {
  if (!isAdminAuthenticated(request)) {
    return new Response('Unauthorized', { status: 401 });
  }
  return null;
}
