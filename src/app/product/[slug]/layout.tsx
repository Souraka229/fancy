import { Metadata } from 'next';
import { supabase } from '@/lib/supabase';

interface ProductPageLayoutProps {
  children: React.ReactNode;
  params: { slug: string };
}

export async function generateMetadata({ params }: ProductPageLayoutProps): Promise<Metadata> {
  const { data: product } = await supabase
    .from('products')
    .select('*, categories(*)')
    .eq('slug', params.slug)
    .eq('is_active', true)
    .single();

  if (!product) {
    return {
      title: 'Produit non trouvé',
    };
  }

  const seoTitle = product.seo_title || `${product.name} - DAYDAY'S FANCY`;
  const seoDescription = product.seo_description || product.description;
  const seoKeywords = product.seo_keywords || 'montres, bijoux, accessoires, Cotonou';

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: seoDescription,
    image: product.images || [],
    offers: {
      '@type': 'Offer',
      price: product.compare_at_price || product.price,
      priceCurrency: 'XOF',
      availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      priceValidUntil: product.compare_at_price ? '2025-12-31' : undefined,
    },
    brand: {
      '@type': 'Brand',
      name: 'DAYDAY\'S FANCY',
    },
    category: product.categories?.name || 'Accessoires',
  };

  return {
    title: seoTitle,
    description: seoDescription,
    keywords: seoKeywords,
    openGraph: {
      title: seoTitle,
      description: seoDescription,
      type: 'website',
      images: product.images?.[0] ? [{ url: product.images[0], width: 1200, height: 630, alt: product.name }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: seoTitle,
      description: seoDescription,
      images: product.images?.[0] ? [product.images[0]] : [],
    },
    other: {
      'application/ld+json': JSON.stringify(schema),
    },
  };
}

export default function ProductPageLayout({ children, params }: ProductPageLayoutProps) {
  return (
    <>
      {children}
    </>
  );
}
