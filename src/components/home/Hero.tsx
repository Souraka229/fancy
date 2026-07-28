'use client';

import { Button } from '@/components/ui/Button';
import { Heading } from '@/components/ui/Typography';
import Link from 'next/link';

export function Hero() {
  return (
    <section className="relative min-h-[80vh] flex items-center bg-surface-1">
      <div className="max-w-container-xl mx-auto px-6 py-24 w-full">
        <div className="max-w-2xl">
          <Heading level="h1" variant="display" className="mb-6">
            L'Élégance à Votre Poignet
          </Heading>
          <p className="text-lg md:text-xl text-ink-muted mb-8 leading-relaxed max-w-xl">
            Découvrez notre collection exclusive de montres et bracelets premium. 
            Chaque pièce raconte une histoire d'artisanat et de sophistication.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/catalog">
              <Button size="lg" fullWidth>
                Explorer la Collection
              </Button>
            </Link>
            <Link href="/catalog?sort=new">
              <Button variant="secondary" size="lg" fullWidth>
                Nouveautés
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
