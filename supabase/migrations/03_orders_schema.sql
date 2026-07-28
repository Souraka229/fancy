-- 03_orders_schema.sql

-- orders table
CREATE TABLE IF NOT EXISTS orders (
  id serial PRIMARY KEY,
  order_number text UNIQUE NOT NULL,
  customer_name text NOT NULL,
  whatsapp_phone text NOT NULL,
  address text NOT NULL,
  delivery_zone text,
  total integer NOT NULL,
  currency text DEFAULT 'XOF',
  status text DEFAULT 'Reçue',
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- order items
CREATE TABLE IF NOT EXISTS order_items (
  id serial PRIMARY KEY,
  order_id integer REFERENCES orders(id) ON DELETE CASCADE,
  product_id integer,
  sku text,
  name text,
  unit_price integer NOT NULL,
  quantity integer NOT NULL,
  total_price integer NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders (order_number);
