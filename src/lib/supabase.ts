import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

function createFallbackQueryBuilder() {
  const builder: any = {
    select: () => builder,
    insert: () => builder,
    update: () => builder,
    delete: () => builder,
    eq: () => builder,
    order: () => builder,
    limit: () => builder,
    single: async () => ({ data: null, error: null }),
    then: (resolve: (value: { data: null; error: null }) => void) => resolve({ data: null, error: null }),
  };

  return builder;
}

function createOptionalClient(url: string, key: string, options?: Parameters<typeof createClient>[2]) {
  if (!url || !key) {
    return {
      from: () => createFallbackQueryBuilder(),
    };
  }

  try {
    return createClient(url, key, options);
  } catch {
    return {
      from: () => createFallbackQueryBuilder(),
    };
  }
}

export const supabase = createOptionalClient(supabaseUrl, supabaseAnonKey);

// For server-side operations with service role key
export const supabaseAdmin = createOptionalClient(
  supabaseUrl,
  supabaseServiceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// Database types
export interface Product {
  id: string;
  category_id: string | null;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  compare_at_price: number | null;
  cost_price: number | null;
  sku: string | null;
  stock: number;
  images: string[];
  is_active: boolean;
  is_featured: boolean;
  is_trending: boolean;
  is_sponsored: boolean;
  meta_title: string | null;
  meta_description: string | null;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  tracking_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_address: string;
  customer_city: string;
  customer_country: string;
  total_amount: number;
  discount_amount: number;
  final_amount: number;
  payment_method: string;
  payment_status: string;
  order_status: string;
  notes: string | null;
  whatsapp_notification_sent: boolean;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  created_at: string;
}

export interface Promotion {
  id: string;
  name: string;
  description: string | null;
  type: string;
  value: number;
  start_date: string;
  end_date: string;
  min_purchase_amount: number;
  max_discount_amount: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface HomepageSection {
  id: string;
  section_type: string;
  title: string;
  subtitle: string | null;
  display_order: number;
  is_active: boolean;
  config: Record<string, any>;
  created_at: string;
  updated_at: string;
}
