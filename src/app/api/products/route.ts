import { NextResponse } from "next/server";
import { createProduct, deleteProduct, getProducts, updateProduct } from "@/lib/db";

export async function GET() {
  const products = await getProducts();
  return NextResponse.json(products);
}

export async function POST(request: Request) {
  const payload = await request.json();
  const product = await createProduct(payload);
  return NextResponse.json(product, { status: 201 });
}

export async function PATCH(request: Request) {
  const payload = await request.json();
  const { productId, updates } = payload;
  if (!productId || !updates) {
    return NextResponse.json({ error: "Missing productId or updates" }, { status: 400 });
  }

  const product = await updateProduct(productId, updates);
  return NextResponse.json(product);
}

export async function DELETE(request: Request) {
  const url = new URL(request.url);
  const productId = Number(url.searchParams.get("id"));
  if (!productId) {
    return NextResponse.json({ error: "Missing product id" }, { status: 400 });
  }

  await deleteProduct(productId);
  return NextResponse.json({ success: true });
}
