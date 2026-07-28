'use client';

import { useEffect, useState } from 'react';
import { Navigation } from '@/components/layout/Navigation';
import { Hero } from '@/components/home/Hero';
import { ProductGrid } from '@/components/home/ProductGrid';
import { Text } from '@/components/ui/Typography';
import { supabase } from '@/lib/supabase';

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [trendingProducts, setTrendingProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProducts() {
      try {
        const { data: featured } = await supabase
          .from('products')
          .select('*')
          .eq('is_active', true)
          .eq('is_featured', true)
          .limit(8);

        const { data: trending } = await supabase
          .from('products')
          .select('*')
          .eq('is_active', true)
          .eq('is_trending', true)
          .limit(8);

        setFeaturedProducts(featured || []);
        setTrendingProducts(trending || []);
      } catch (error) {
        console.error('Error loading products:', error);
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-canvas">
        <div className="text-ink text-lg">Chargement...</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-canvas">
      <Navigation />
      
      <Hero />

      {featuredProducts.length > 0 && (
        <ProductGrid
          title="Collection Vedette"
          subtitle="Nos pièces les plus exclusives"
          products={featuredProducts}
          actionLabel="Voir tout"
          actionHref="/catalog?filter=featured"
        />
      )}

      {trendingProducts.length > 0 && (
        <ProductGrid
          title="Tendances"
          subtitle="Les plus populaires cette semaine"
          products={trendingProducts}
          actionLabel="Voir tout"
          actionHref="/catalog?filter=trending"
        />
      )}

      <footer className="border-t border-ink-tertiary py-12">
        <div className="max-w-container-xl mx-auto px-6">
          <div className="text-center">
            <p className="font-display text-2xl font-medium text-ink mb-4">DAYDAY'S FANCY</p>
            <Text variant="muted" size="sm">
              © 2024 DAYDAY'S FANCY. Tous droits réservés.
            </Text>
          </div>
        </div>
      </footer>
    </main>
  );
}
