-- supabase/policies/orders_rls.sql

-- Enable RLS on orders and order_items
ALTER TABLE IF EXISTS orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS order_items ENABLE ROW LEVEL SECURITY;

-- Policy: allow service role to insert (service role bypasses RLS) -- keep restrictive for anon
-- Policy: allow select on orders only when matching order_number (customer tracking) via function or token

-- Example: create a function to check a public token (customer_token) and allow select when token matches (implementation left as project-specific)

-- For admin role (users table with is_admin boolean), allow full access
-- Example policy (requires users table and JWT claims with sub):
-- CREATE POLICY "admin_full_access" ON orders
-- FOR ALL USING (EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.is_admin = true));

-- Deny anonymous inserts; only allow via service role or authenticated admin
CREATE POLICY "prevent_anon_insert" ON orders FOR INSERT TO public USING (false);

-- Notes: In production, configure precise policies matching your auth model. Keep SUPABASE_SERVICE_ROLE_KEY server-only.
