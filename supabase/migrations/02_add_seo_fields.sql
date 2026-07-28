-- 02_add_seo_fields.sql

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS slug text,
  ADD COLUMN IF NOT EXISTS seo_title text,
  ADD COLUMN IF NOT EXISTS seo_description text,
  ADD COLUMN IF NOT EXISTS og_title text,
  ADD COLUMN IF NOT EXISTS og_description text,
  ADD COLUMN IF NOT EXISTS canonical_url text,
  ADD COLUMN IF NOT EXISTS image_alt text,
  ADD COLUMN IF NOT EXISTS lcp_image text;

-- generate slug for existing rows
UPDATE products
SET slug = trim(both '-' from regexp_replace(lower(name), '[^a-z0-9]+', '-', 'g'))
WHERE slug IS NULL OR slug = '';

-- ensure uniqueness: if duplicates, append id
WITH duplicates AS (
  SELECT slug, count(*) as cnt
  FROM products
  GROUP BY slug
  HAVING count(*) > 1
)
UPDATE products p
SET slug = p.slug || '-' || p.id
FROM duplicates d
WHERE p.slug = d.slug;

-- create unique index
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'idx_products_slug_unique') THEN
    CREATE UNIQUE INDEX idx_products_slug_unique ON products (slug);
  END IF;
END$$;

-- set defaults for future inserts: trigger can be added by app logic; for now rely on application to set slug
