-- DAYDAY'S FANCY minimal schema and seed for Supabase

-- categories
CREATE TABLE IF NOT EXISTS categories (
  id serial PRIMARY KEY,
  name text NOT NULL
);

-- products
CREATE TABLE IF NOT EXISTS products (
  id serial PRIMARY KEY,
  sku text UNIQUE,
  name text NOT NULL,
  description text,
  price integer NOT NULL,
  discount integer DEFAULT 0,
  stock integer DEFAULT 0,
  badges text[] DEFAULT '{}',
  is_sponsored boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- collections (simple)
CREATE TABLE IF NOT EXISTS collections (
  id serial PRIMARY KEY,
  name text NOT NULL,
  description text
);

-- seed example product
INSERT INTO products (sku, name, description, price, discount, stock, badges, is_sponsored)
VALUES
('FANCY-001', 'DAYDAY''S Signature Tote', 'Sac premium en cuir écologique — design minimal et finitions dorées.', 75000, 0, 12, ARRAY['Nouveau','Best Seller'], false)
ON CONFLICT DO NOTHING;
