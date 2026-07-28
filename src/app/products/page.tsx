"use client";

import { useEffect, useState } from 'react';
import { Navigation } from '@/components/layout/Navigation';
import { Card, CardContent } from '@/components/ui/Card';
import { Heading, Text, Badge } from '@/components/ui/Typography';
import { Input } from '@/components/ui/Input';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import Image from 'next/image';

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('featured');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const { data: categoriesData } = await supabase
          .from('categories')
          .select('*')
          .eq('is_active', true)
          .order('display_order');

        const { data: productsData } = await supabase
          .from('products')
          .select('*, categories(*)')
          .eq('is_active', true);

        setCategories(categoriesData || []);
        setProducts(productsData || []);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const filteredProducts = products
    .filter((product) => {
      const matchesCategory = selectedCategory === 'all' || product.category_id === selectedCategory;
      const matchesSearch = !search || 
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.description?.toLowerCase().includes(search.toLowerCase());
      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'featured':
        default:
          return (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0);
      }
    });

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
      
      <div className="max-w-container-xl mx-auto px-6 py-8">
        <div className="mb-10">
          <Text variant="muted" size="sm">Catalogue</Text>
          <Heading level="h1" variant="display" className="mt-2">
            Boutique premium de montres, bijoux et accessoires
          </Heading>
        </div>

        <div className="mb-8 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
              selectedCategory === 'all' ? 'border-ink bg-ink text-canvas' : 'border-ink-tertiary text-ink hover:border-ink'
            }`}
          >
            Tous
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => setSelectedCategory(category.id)}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                selectedCategory === category.id ? 'border-ink bg-ink text-canvas' : 'border-ink-tertiary text-ink hover:border-ink'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Rechercher un produit"
            className="max-w-md"
          />
          <label className="flex items-center gap-2 text-sm text-ink">
            <Text variant="muted">Trier par</Text>
            <select 
              value={sortBy} 
              onChange={(event) => setSortBy(event.target.value)} 
              className="bg-surface-1 border border-ink-tertiary rounded-full px-4 py-2 text-sm outline-none focus:border-accent"
            >
              <option value="featured">Sélection</option>
              <option value="price-asc">Prix croissant</option>
              <option value="price-desc">Prix décroissant</option>
            </select>
          </label>
        </div>

        <Text variant="muted" className="mb-6">
          {filteredProducts.length} produit{filteredProducts.length > 1 ? 's' : ''} trouvé{filteredProducts.length > 1 ? 's' : ''}
        </Text>

        {filteredProducts.length === 0 ? (
          <Card variant="content">
            <CardContent className="text-center py-12">
              <Text variant="muted">
                Aucun produit ne correspond à votre recherche. Essayez un autre mot-clé ou une autre catégorie.
              </Text>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredProducts.map((product) => (
              <Link key={product.id} href={`/product/${product.id}`}>
                <Card variant="product" hover>
                  <CardContent className="p-0">
                    <div className="aspect-square bg-surface-2 relative overflow-hidden">
                      {product.images[0] && (
                        <Image
                          src={product.images[0]}
                          alt={product.name}
                          fill
                          className="object-cover transition-transform duration-normal hover:scale-105"
                          sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        />
                      )}
                    </div>
                    <div className="p-4">
                      <div className="flex gap-1 mb-2">
                        {product.is_featured && (
                          <Badge variant="accent">Vedette</Badge>
                        )}
                        {product.is_trending && (
                          <Badge variant="default">Tendance</Badge>
                        )}
                      </div>
                      <Text size="sm" variant="muted" className="mb-1">
                        {product.categories?.name || 'Accessoires'}
                      </Text>
                      <Text size="base" className="mb-2 line-clamp-2">
                        {product.name}
                      </Text>
                      <Text size="lg" className="font-medium">
                        {product.price.toLocaleString('fr-FR')} XOF
                      </Text>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
