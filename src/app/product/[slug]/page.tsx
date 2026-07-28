'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Navigation } from '@/components/layout/Navigation';
import { Card, CardContent } from '@/components/ui/Card';
import { Heading, Text, Badge } from '@/components/ui/Typography';
import { Button } from '@/components/ui/Button';
import { supabase } from '@/lib/supabase';
import { 
  Share2, 
  Minus, 
  Plus, 
  ChevronLeft,
  Check,
  X,
  ShoppingCart
} from 'lucide-react';

export default function ProductPage() {
  const params = useParams();
  const slug = (params?.slug as string) || '';
  // Note: slug may be empty during some render cycles; the effect handles it.
  
  const [product, setProduct] = useState<any>(null);
  const [similarProducts, setSimilarProducts] = useState<any[]>([]);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [addedToCart, setAddedToCart] = useState(false);

  useEffect(() => {
    async function loadProduct() {
      try {
        const { data: productData } = await supabase
          .from('products')
          .select('*, categories(*)')
          .eq('slug', slug)
          .eq('is_active', true)
          .single();

        if (productData) {
          setProduct(productData);
          setSelectedImage(0);

          const { data: similarData } = await supabase
            .from('products')
            .select('*')
            .eq('category_id', productData.category_id)
            .eq('is_active', true)
            .neq('id', productData.id)
            .limit(4);

          setSimilarProducts(similarData || []);
        }
      } catch (error) {
        console.error('Error loading product:', error);
      } finally {
        setLoading(false);
      }
    }

    loadProduct();
  }, [slug]);

  const handleAddToCart = () => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingItem = cart.find((item: any) => item.id === product.id);

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        compare_at_price: product.compare_at_price,
        image: product.images[0],
        quantity,
      });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const shareOnWhatsApp = () => {
    const message = `Découvrez ce produit premium chez DAYDAY'S FANCY: ${product.name}\n\nPrix: ${product.price.toLocaleString('fr-FR', { style: 'currency', currency: 'XOF' })}\n\nLien: ${window.location.href}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  const discount = product?.compare_at_price 
    ? Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-canvas">
        <div className="text-ink text-lg">Chargement...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-canvas">
        <div className="text-ink text-lg">Produit non trouvé</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-canvas">
      <Navigation />
      
      {/* Header */}
      <div className="sticky top-14 md:top-16 z-30 bg-canvas border-b border-ink-tertiary px-4 py-4">
        <div className="flex items-center justify-between max-w-container-xl mx-auto">
          <Link href="/catalog">
            <button className="p-2 text-ink hover:text-ink-muted transition-colors">
              <ChevronLeft size={24} />
            </button>
          </Link>
          <Heading level="h2" className="flex-1 mx-4 truncate">
            {product.name}
          </Heading>
          <button 
            onClick={shareOnWhatsApp}
            className="p-2 text-ink hover:text-ink-muted transition-colors"
          >
            <Share2 size={24} />
          </button>
        </div>
      </div>

      <div className="max-w-container-xl mx-auto px-6 py-8">
        <div className="grid md:grid-cols-2 gap-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            {product.video_url && (
              <div className="relative aspect-video bg-surface-2 overflow-hidden rounded-none">
                <iframe
                  src={product.video_url.replace('watch?v=', 'embed/')}
                  className="w-full h-full"
                  allowFullScreen
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                />
              </div>
            )}

            {product.images && product.images.length > 0 && (
              <div className="relative aspect-square bg-surface-2 overflow-hidden rounded-none">
                {product.images[selectedImage] ? (
                  <Image
                    src={product.images[selectedImage]}
                    alt={product.name}
                    fill
                    className="object-cover"
                    priority
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-ink-muted">
                    No Image
                  </div>
                )}
                
                {discount > 0 && (
                  <div className="absolute top-4 left-4">
                    <Badge variant="accent">-{discount}%</Badge>
                  </div>
                )}
              </div>
            )}

            {product.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto">
                {product.images.map((image: string, index: number) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`relative w-20 h-20 flex-shrink-0 border-2 transition-colors rounded-none ${
                      selectedImage === index ? 'border-accent' : 'border-ink-tertiary'
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-8">
            <div>
              <Text size="sm" variant="muted" className="mb-2">
                {product.categories?.name}
              </Text>
              <Heading level="h1" variant="display" className="mb-4">
                {product.name}
              </Heading>
              
              <div className="flex items-center gap-4 mb-4">
                <Text size="xl" className="font-medium">
                  {product.price.toLocaleString('fr-FR')} XOF
                </Text>
                {product.compare_at_price && (
                  <Text size="lg" variant="subtle" className="line-through">
                    {product.compare_at_price.toLocaleString('fr-FR')} XOF
                  </Text>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Badge variant={product.stock > 0 ? 'success' : 'error'}>
                  {product.stock > 0 ? `En stock (${product.stock})` : 'Rupture de stock'}
                </Badge>
              </div>
            </div>

            {product.description && (
              <div>
                <Heading level="h3" className="mb-3">
                  Description
                </Heading>
                <Text variant="muted" className="leading-relaxed">
                  {product.description}
                </Text>
              </div>
            )}

            {/* Quantity Selector */}
            <div>
              <Heading level="h3" className="mb-3">
                Quantité
              </Heading>
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-ink-tertiary rounded-none">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-3 text-ink hover:text-ink-muted transition-colors"
                    disabled={quantity <= 1}
                  >
                    <Minus size={20} />
                  </button>
                  <span className="w-12 text-center font-ui font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="p-3 text-ink hover:text-ink-muted transition-colors"
                    disabled={quantity >= product.stock}
                  >
                    <Plus size={20} />
                  </button>
                </div>
              </div>
            </div>

            {/* Add to Cart Button */}
            <Button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              size="lg"
              fullWidth
              className={addedToCart ? 'bg-semantic-success hover:bg-semantic-success' : ''}
            >
              {addedToCart ? (
                <>
                  <Check size={20} className="mr-2" />
                  Ajouté au panier
                </>
              ) : product.stock === 0 ? (
                <>
                  <X size={20} className="mr-2" />
                  Rupture de stock
                </>
              ) : (
                <>
                  <ShoppingCart size={20} className="mr-2" />
                  Ajouter au panier
                </>
              )}
            </Button>

            {/* Features */}
            <div className="grid grid-cols-2 gap-4">
              <Card variant="content">
                <CardContent className="text-center">
                  <Text size="sm" variant="muted" className="mb-1">Livraison</Text>
                  <Text size="base">Rapide & sécurisée</Text>
                </CardContent>
              </Card>
              <Card variant="content">
                <CardContent className="text-center">
                  <Text size="sm" variant="muted" className="mb-1">Paiement</Text>
                  <Text size="base">À la livraison</Text>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Similar Products */}
        {similarProducts.length > 0 && (
          <div className="mt-24">
            <Heading level="h2" variant="display" className="mb-8">
              Produits similaires
            </Heading>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {similarProducts.map((similarProduct) => (
                <Link key={similarProduct.id} href={`/product/${similarProduct.slug}`}>
                  <Card variant="product" hover>
                    <CardContent className="p-0">
                      <div className="aspect-square bg-surface-2 relative overflow-hidden">
                        {similarProduct.images[0] && (
                          <Image
                            src={similarProduct.images[0]}
                            alt={similarProduct.name}
                            fill
                            className="object-cover transition-transform duration-normal hover:scale-105"
                            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 25vw, 20vw"
                          />
                        )}
                      </div>
                      <div className="p-4">
                        <Text size="base" className="mb-2 line-clamp-2">
                          {similarProduct.name}
                        </Text>
                        <Text size="lg" className="font-medium">
                          {similarProduct.price.toLocaleString('fr-FR')} XOF
                        </Text>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
