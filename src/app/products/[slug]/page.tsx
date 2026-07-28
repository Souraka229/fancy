"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useCart } from "@/components/cart-provider";
import { products as fallbackProducts, type Product } from "@/lib/products";

const galleryImages = [
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1200&q=80",
];

const formatPrice = (value: number) => value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");

export default function ProductDetailPage() {
  const params = useParams<{ slug: string }>();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProduct() {
      try {
        const response = await fetch("/api/products");
        if (!response.ok) {
          throw new Error("Failed to fetch product");
        }
        const data = (await response.json()) as Product[];
        const matchedProduct = data.find((item) => item.slug === params.slug) ?? null;
        setProduct(matchedProduct);
      } catch {
        const matchedProduct = fallbackProducts.find((item) => item.slug === params.slug) ?? null;
        setProduct(matchedProduct);
      } finally {
        setLoading(false);
      }
    }

    loadProduct();
  }, [params.slug]);

  const relatedProducts = useMemo(() => {
    if (!product) {
      return [];
    }

    return fallbackProducts.filter((item) => item.category === product.category && item.id !== product.id).slice(0, 3);
  }, [product]);

  const upsellProducts = useMemo(() => fallbackProducts.slice(0, 2), []);

  if (loading) {
    return <div className="mx-auto max-w-6xl px-4 py-20 text-sm text-stone-600">Chargement du produit…</div>;
  }

  if (!product) {
    return (
      <section className="mx-auto max-w-6xl px-4 py-20">
        <div className="rounded-[24px] border border-dashed border-stone-300 bg-stone-50 p-8 text-sm text-stone-600">
          Ce produit n’est plus disponible. Retourner au catalogue pour découvrir d’autres pièces premium.
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-8">
        <Link href="/products" className="text-sm font-semibold text-stone-700 hover:text-stone-950">
          ← Retour au catalogue
        </Link>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-4">
          <div className={`rounded-[32px] bg-gradient-to-br ${product.accent} p-4`}>
            <img src={galleryImages[selectedImage] || product.image} alt={product.imageAlt ?? product.name} className="h-[420px] w-full rounded-[24px] object-cover" />
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {galleryImages.map((image, index) => (
              <button
                key={image}
                type="button"
                onClick={() => setSelectedImage(index)}
                className={`overflow-hidden rounded-[20px] border ${selectedImage === index ? "border-stone-950" : "border-stone-200"}`}
              >
                <img src={image} alt={`${product.imageAlt ?? product.name} ${index + 1}`} className="h-24 w-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-[32px] border border-stone-200 bg-white p-8 shadow-sm">
          <p className="text-sm uppercase tracking-[0.35em] text-stone-500">{product.category}</p>
          <h1 className="mt-3 text-3xl font-semibold text-stone-950">{product.name}</h1>
          <p className="mt-4 text-lg leading-8 text-stone-600">{product.description}</p>

          <div className="mt-6 flex items-center gap-3">
            <span className="rounded-full border border-stone-200 px-3 py-1 text-sm font-medium text-stone-700">{product.badge}</span>
            <span className="text-sm text-stone-600">★ {product.rating}</span>
          </div>

          <div className="mt-6 rounded-[24px] border border-stone-200 bg-stone-50 p-5">
            <p className="text-sm text-stone-500">Disponibilité</p>
            <p className="mt-2 text-lg font-semibold text-stone-950">{product.stock}</p>
            <div className="mt-4 flex items-center gap-3">
              <span className="text-3xl font-semibold text-stone-950">
                {product.promoPrice ? `${formatPrice(product.promoPrice)} FCFA` : `${formatPrice(product.price)} FCFA`}
              </span>
              {product.promoPrice ? <span className="text-sm text-stone-400 line-through">{formatPrice(product.price)} FCFA</span> : null}
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <button
              onClick={() => addToCart(product)}
              className="rounded-full bg-stone-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-stone-700"
            >
              Ajouter au panier
            </button>
            <Link href="/checkout" className="rounded-full border border-stone-300 px-6 py-3 text-sm font-semibold text-stone-700 transition hover:border-stone-950">
              Passer la commande
            </Link>
            <a
              href={`https://wa.me/2290194635656?text=${encodeURIComponent(`Bonjour, je souhaite commander ${product.name} (${product.price} FCFA).`)}`}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-emerald-600 px-6 py-3 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50"
            >
              Partager WhatsApp
            </a>
          </div>
        </div>
      </div>

      <div className="mt-16 grid gap-8 lg:grid-cols-[1fr_0.8fr]">
        {relatedProducts.length > 0 ? (
          <div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.35em] text-stone-500">Produits similaires</p>
                <h2 className="mt-2 text-2xl font-semibold text-stone-950">Compléments naturels pour votre sélection</h2>
              </div>
              <Link href="/products" className="text-sm font-semibold text-stone-700 hover:text-stone-950">Voir tout</Link>
            </div>
            <div className="mt-8 grid gap-6 md:grid-cols-2">
              {relatedProducts.map((item) => (
                <div key={item.id} className="rounded-[24px] border border-stone-200 bg-white p-5 shadow-sm">
                  <h3 className="text-lg font-semibold text-stone-950">{item.name}</h3>
                  <p className="mt-2 text-sm leading-6 text-stone-600">{item.description}</p>
                  <Link href={`/products/${item.slug}`} className="mt-4 inline-flex text-sm font-semibold text-stone-700 hover:text-stone-950">
                    Voir le produit →
                  </Link>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <div className="rounded-[32px] border border-stone-200 bg-stone-950 p-8 text-white shadow-sm">
          <p className="text-sm uppercase tracking-[0.35em] text-stone-400">Upsell</p>
          <h2 className="mt-3 text-2xl font-semibold">Complétez votre look premium</h2>
          <div className="mt-6 space-y-4">
            {upsellProducts.map((item) => (
              <div key={item.id} className="rounded-2xl border border-white/10 bg-white/10 p-4">
                <p className="font-semibold">{item.name}</p>
                <p className="mt-2 text-sm leading-7 text-stone-300">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
