'use client';

import { useEffect, useState } from 'react';
import { Navigation } from '@/components/layout/Navigation';
import { Card, CardContent } from '@/components/ui/Card';
import { Heading, Text, Badge } from '@/components/ui/Typography';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { supabase } from '@/lib/supabase';
import { SlidersHorizontal, X } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function CatalogPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [showFilters, setShowFilters] = useState(false);
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

  const filteredAndSortedProducts = products
    .filter((product) => {
      const matchesCategory = !selectedCategory || product.category_id === selectedCategory;
      const matchesSearch = !searchQuery || 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'popular':
          return (b.is_trending ? 1 : 0) - (a.is_trending ? 1 : 0);
        case 'recent':
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
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
      
      {/* Header */}
      <div className="sticky top-0 z-40 bg-canvas border-b border-ink-tertiary px-4 py-4 md:hidden">
        <div className="flex items-center gap-3">
          <Input
            placeholder="Rechercher..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
          />
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="p-2 text-ink border border-ink-tertiary rounded-full"
          >
            <SlidersHorizontal size={20} />
          </button>
        </div>
      </div>

      <div className="max-w-container-xl mx-auto px-6 py-8">
        {/* Desktop Header */}
        <div className="hidden md:block mb-8">
          <Heading level="h1" variant="display" className="mb-6">
            Catalogue
          </Heading>
          <div className="flex gap-4">
            <Input
              placeholder="Rechercher un produit..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 max-w-md"
            />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-surface-1 border border-ink-tertiary rounded-full px-4 py-3 text-ink focus:outline-none focus:border-accent"
            >
              <option value="recent">Plus récent</option>
              <option value="price-asc">Prix croissant</option>
              <option value="price-desc">Prix décroissant</option>
              <option value="popular">Plus populaire</option>
            </select>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Sidebar Filters - Desktop */}
          <aside className="w-64 flex-shrink-0 hidden lg:block">
            <div className="sticky top-24">
              <Heading level="h3" className="mb-4">
                Catégories
              </Heading>
              <div className="space-y-2 mb-8">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`w-full text-left px-4 py-2 rounded-none transition-colors ${
                    !selectedCategory ? 'bg-ink text-canvas' : 'text-ink-muted hover:text-ink hover:bg-surface-1'
                  }`}
                >
                  Toutes
                </button>
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full text-left px-4 py-2 rounded-none transition-colors ${
                      selectedCategory === category.id ? 'bg-ink text-canvas' : 'text-ink-muted hover:text-ink hover:bg-surface-1'
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Products Grid */}
          <div className="flex-1">
            {/* Mobile Categories */}
            <div className="flex gap-2 overflow-x-auto pb-4 mb-6 lg:hidden">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-4 py-2 rounded-full whitespace-nowrap ${
                  !selectedCategory ? 'bg-ink text-canvas' : 'bg-surface-1 text-ink'
                }`}
              >
                Toutes
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 rounded-full whitespace-nowrap ${
                    selectedCategory === category.id ? 'bg-ink text-canvas' : 'bg-surface-1 text-ink'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>

            {/* Mobile Filter Panel */}
            {showFilters && (
              <div className="lg:hidden mb-6 p-4 bg-surface-1 border border-ink-tertiary">
                <div className="flex items-center justify-between mb-4">
                  <Heading level="h3">Filtres</Heading>
                  <button
                    onClick={() => setShowFilters(false)}
                    className="p-2 text-ink-muted hover:text-ink"
                  >
                    <X size={20} />
                  </button>
                </div>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full bg-canvas border border-ink-tertiary rounded-full px-4 py-3 text-ink mb-4"
                >
                  <option value="recent">Plus récent</option>
                  <option value="price-asc">Prix croissant</option>
                  <option value="price-desc">Prix décroissant</option>
                  <option value="popular">Plus populaire</option>
                </select>
              </div>
            )}

            {/* Results Count */}
            <div className="flex items-center justify-between mb-6">
              <Text variant="muted">
                {filteredAndSortedProducts.length} produit{filteredAndSortedProducts.length > 1 ? 's' : ''}
              </Text>
            </div>

            {/* Products */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {filteredAndSortedProducts.map((product) => (
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

            {filteredAndSortedProducts.length === 0 && (
              <div className="text-center py-24">
                <Heading level="h3" className="mb-2">
                  Aucun produit trouvé
                </Heading>
                <Text variant="muted">
                  Essayez de modifier vos filtres de recherche
                </Text>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
