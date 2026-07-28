import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";
import { products as fallbackProducts, type Product } from "./products";

export type OrderItem = {
  productId: number;
  name: string;
  quantity: number;
  price: number;
};

type Database = {
  products: Product;
  orders: OrderRecord;
};

export type OrderRecord = {
  id: string;
  code: string;
  customerName: string;
  phone: string;
  address: string;
  zone: string;
  items: OrderItem[];
  total: number;
  createdAt: string;
  status: string;
};

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const hasSupabase = Boolean(supabaseUrl && supabaseServiceKey);

const supabase = hasSupabase
  ? (() => {
      try {
        return createClient(supabaseUrl, supabaseServiceKey, {
          auth: { persistSession: false },
        });
      } catch {
        return null;
      }
    })()
  : null;

const dataPath = path.join(process.cwd(), "data");
const productsFile = path.join(dataPath, "products.json");
const ordersFile = path.join(dataPath, "orders.json");

function ensureDataFiles() {
  if (!fs.existsSync(dataPath)) {
    fs.mkdirSync(dataPath, { recursive: true });
  }

  if (!fs.existsSync(productsFile)) {
    fs.writeFileSync(productsFile, JSON.stringify(fallbackProducts, null, 2), "utf8");
  }
  if (!fs.existsSync(ordersFile)) {
    fs.writeFileSync(ordersFile, "[]", "utf8");
  }
}

function readProductsFile(): Product[] {
  ensureDataFiles();
  return JSON.parse(fs.readFileSync(productsFile, "utf8")) as Product[];
}

function writeProductsFile(records: Product[]) {
  ensureDataFiles();
  fs.writeFileSync(productsFile, JSON.stringify(records, null, 2), "utf8");
}

function readOrdersFile(): OrderRecord[] {
  ensureDataFiles();
  return JSON.parse(fs.readFileSync(ordersFile, "utf8")) as OrderRecord[];
}

function writeOrdersFile(records: OrderRecord[]) {
  ensureDataFiles();
  fs.writeFileSync(ordersFile, JSON.stringify(records, null, 2), "utf8");
}

export async function getProducts(): Promise<Product[]> {
  if (supabase) {
    try {
      const { data, error } = await supabase.from("products").select("*");
      if (error) {
        throw new Error(error.message);
      }
      return (data ?? []) as Product[];
    } catch (error) {
      console.warn("Falling back to local products data:", error);
    }
  }

  return readProductsFile();
}

export async function createProduct(product: Product): Promise<Product> {
  if (supabase) {
    try {
      const { id, ...insertPayload } = product;
      const { data, error } = await supabase.from("products").insert([insertPayload]).select().single();
      if (error) {
        throw new Error(error.message);
      }
      return data as Product;
    } catch (error) {
      console.warn("Falling back to local products data:", error);
    }
  }

  const items = readProductsFile();
  const next = [...items, product];
  writeProductsFile(next);
  return product;
}

export async function updateProduct(productId: number, updates: Partial<Product>): Promise<Product> {
  if (supabase) {
    try {
      const { data, error } = await supabase.from("products").update(updates).eq("id", productId).select().single();
      if (error) {
        throw new Error(error.message);
      }
      return data as Product;
    } catch (error) {
      console.warn("Falling back to local products data:", error);
    }
  }

  const items = readProductsFile();
  const updated = items.map((product) => (product.id === productId ? { ...product, ...updates } : product));
  writeProductsFile(updated);
  const result = updated.find((product) => product.id === productId);
  if (!result) {
    throw new Error("Product not found");
  }
  return result;
}

export async function deleteProduct(productId: number): Promise<void> {
  if (supabase) {
    try {
      const { error } = await supabase.from("products").delete().eq("id", productId);
      if (error) {
        throw new Error(error.message);
      }
      return;
    } catch (error) {
      console.warn("Falling back to local products data:", error);
    }
  }

  const items = readProductsFile().filter((product) => product.id !== productId);
  writeProductsFile(items);
}

export async function getOrders(): Promise<OrderRecord[]> {
  if (supabase) {
    try {
      const { data, error } = await supabase.from("orders").select("*").order("createdAt", { ascending: false });
      if (error) {
        throw new Error(error.message);
      }
      return (data ?? []) as OrderRecord[];
    } catch (error) {
      console.warn("Falling back to local orders data:", error);
    }
  }

  return readOrdersFile().sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export async function createOrderRecord(input: {
  customerName: string;
  phone: string;
  address: string;
  zone: string;
  items: OrderItem[];
  total: number;
}): Promise<OrderRecord> {
  const record: OrderRecord = {
    id: `${Date.now()}`,
    code: String(Math.floor(10000 + Math.random() * 90000)),
    customerName: input.customerName,
    phone: input.phone,
    address: input.address,
    zone: input.zone,
    items: input.items,
    total: input.total,
    createdAt: new Date().toISOString(),
    status: "Commande reçue",
  };

  if (supabase) {
    try {
      const { data, error } = await supabase.from("orders").insert([record]).select().single();
      if (error) {
        throw new Error(error.message);
      }
      return data as OrderRecord;
    } catch (error) {
      console.warn("Falling back to local orders data:", error);
    }
  }

  const orders = readOrdersFile();
  writeOrdersFile([record, ...orders]);
  return record;
}

export async function updateOrderStatus(orderId: string, status: string): Promise<OrderRecord> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("orders")
        .update({ status })
        .eq("id", orderId)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data as OrderRecord;
    } catch (error) {
      console.warn("Falling back to local orders data:", error);
    }
  }

  const orders = readOrdersFile();
  const updated = orders.map((order) => (order.id === orderId ? { ...order, status } : order));
  writeOrdersFile(updated);
  return updated.find((order) => order.id === orderId)!;
}

export function hasDatabaseConnection(): boolean {
  return hasSupabase;
}
