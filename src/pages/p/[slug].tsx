import { GetServerSideProps } from 'next'
import Head from 'next/head'
import { createClient } from '@supabase/supabase-js'

type Product = {
  id: number
  name: string
  description?: string
  price: number
  discount?: number
  sku?: string
  slug?: string
  badges?: string[]
  is_sponsored?: boolean
  image_urls?: string[]
  stock?: number
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { slug } = context.params as { slug: string }
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  const supabase = createClient(supabaseUrl, serviceKey)

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('slug', slug)
    .limit(1)
    .maybeSingle()

  if (error || !data) {
    return { notFound: true }
  }

  const product: Product = {
    id: data.id,
    name: data.name,
    description: data.description || '',
    price: data.price,
    discount: data.discount || 0,
    sku: data.sku || `F-${data.id}`,
    slug: data.slug,
    badges: data.badges || [],
    is_sponsored: data.is_sponsored || false,
    image_urls: data.image_urls || [],
    stock: data.stock || 0
  }

  return { props: { product } }
}

export default function ProductPage({ product }: { product: Product }) {
  const price = product.price - (product.discount || 0)
  const fullUrl = process.env.NEXT_PUBLIC_SITE_URL ? `${process.env.NEXT_PUBLIC_SITE_URL}/p/${product.slug}` : `/p/${product.slug}`

  const jsonLd = {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: product.name,
    image: product.image_urls?.length ? product.image_urls : [],
    description: product.description,
    sku: product.sku,
    brand: {
      '@type': 'Brand',
      name: "DAYDAY'S FANCY"
    },
    offers: {
      '@type': 'Offer',
      url: fullUrl,
      priceCurrency: 'XOF',
      price: String(price),
      availability: product.stock && product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock'
    }
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-muted)] p-4">
      <Head>
        <title>{(product as any).seo_title || product.name} — DAYDAY'S FANCY</title>
        <meta name="description" content={(product as any).seo_description || product.description} />
        <link rel="canonical" href={fullUrl} />

        {/* OpenGraph */}
        <meta property="og:type" content="product" />
        <meta property="og:title" content={(product as any).og_title || product.name} />
        <meta property="og:description" content={(product as any).og_description || product.description} />
        {product.image_urls && product.image_urls[0] && (
          <meta property="og:image" content={product.image_urls[0]} />
        )}

        {/* JSON-LD */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </Head>

      <article className="max-w-xl mx-auto">
        <header className="mb-4">
          <h1 className="text-2xl font-bold text-[var(--color-cream)]">{product.name}</h1>
          <div className="mt-2 text-sm text-[var(--color-gray)]">{product.badges?.join(' · ')}</div>
        </header>

        <section className="mb-6">
          {product.image_urls && product.image_urls.length ? (
            <img src={product.image_urls[0]} alt={(product as any).image_alt || product.name} className="w-full rounded-xl" />
          ) : (
            <div className="w-full h-60 bg-gray-200 rounded-xl" />
          )}
        </section>

        <section className="prose text-[var(--color-cream)]">
          <p>{product.description}</p>
        </section>

        <section className="mt-6 p-4 bg-white/3 rounded-md">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-[var(--color-gray)]">Prix</div>
              <div className="text-xl font-semibold text-[var(--color-cream)]">{price.toLocaleString('fr-FR')} FCFA</div>
            </div>
            <button className="px-4 py-2 bg-[var(--color-accent)] text-white rounded-md">Ajouter au panier</button>
          </div>
        </section>
      </article>
    </div>
  )
}
