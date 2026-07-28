'use client';

import { Card, CardContent } from '@/components/ui/Card';
import { Heading, Text, Badge } from '@/components/ui/Typography';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import Image from 'next/image';

interface Product {
  id: string;
  name: string;
  price: number;
  images: string[];
  is_featured?: boolean;
  is_trending?: boolean;
  categories?: { name: string };
}

interface ProductGridProps {
  title: string;
  subtitle?: string;
  products: Product[];
  actionLabel?: string;
  actionHref?: string;
}

export function ProductGrid({ title, subtitle, products, actionLabel, actionHref }: ProductGridProps) {
  if (products.length === 0) return null;

  return (
    <section className="py-24">
      <div className="max-w-container-xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12">
          <div>
            <Heading level="h2" variant="display" className="mb-2">
              {title}
            </Heading>
            {subtitle && (
              <Text size="lg" variant="muted">
                {subtitle}
              </Text>
            )}
          </div>
          {actionLabel && actionHref && (
            <Link href={actionHref} className="mt-4 md:mt-0">
              <Button variant="ghost">{actionLabel}</Button>
            </Link>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
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
      </div>
    </section>
  );
}
