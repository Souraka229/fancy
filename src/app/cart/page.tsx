'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Navigation } from '@/components/layout/Navigation';
import { Card, CardContent } from '@/components/ui/Card';
import { Heading, Text } from '@/components/ui/Typography';
import { Button } from '@/components/ui/Button';
import { supabase } from '@/lib/supabase';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';

interface CartItem {
  id: string;
  name: string;
  price: number;
  compare_at_price: number | null;
  image: string;
  quantity: number;
}

export default function CartPage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [suggestedProducts, setSuggestedProducts] = useState<any[]>([]);
  const [deliveryZones, setDeliveryZones] = useState<any[]>([]);
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCart();
    loadDeliveryZones();
    loadSuggestedProducts();
  }, []);

  const loadCart = () => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
    setLoading(false);
  };

  const loadDeliveryZones = async () => {
    try {
      const { data } = await supabase
        .from('delivery_zones')
        .select('*')
        .eq('is_active', true)
        .order('base_fee');
      setDeliveryZones(data || []);
    } catch (error) {
      console.error('Error loading delivery zones:', error);
    }
  };

  const loadSuggestedProducts = async () => {
    try {
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .eq('is_featured', true)
        .limit(4);
      setSuggestedProducts(data || []);
    } catch (error) {
      console.error('Error loading suggested products:', error);
    }
  };

  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    const updatedCart = cart.map(item =>
      item.id === id ? { ...item, quantity: newQuantity } : item
    );
    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  const removeItem = (id: string) => {
    const updatedCart = cart.filter(item => item.id !== id);
    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discountTotal = cart.reduce((sum, item) => {
    if (item.compare_at_price) {
      return sum + ((item.compare_at_price - item.price) * item.quantity);
    }
    return sum;
  }, 0);
  
  const selectedZoneData = deliveryZones.find(z => z.id === selectedZone);
  const shippingFee = selectedZoneData ? selectedZoneData.base_fee : 0;
  const total = subtotal + shippingFee;

  const handleCheckout = () => {
    if (cart.length === 0) return;
    router.push('/checkout');
  };

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
      <div className="sticky top-14 md:top-16 z-30 bg-canvas border-b border-ink-tertiary px-4 py-4">
        <div className="max-w-container-xl mx-auto">
          <Heading level="h1">Mon Panier</Heading>
          <Text variant="muted">{cart.length} article{cart.length > 1 ? 's' : ''}</Text>
        </div>
      </div>

      <div className="max-w-container-xl mx-auto px-6 py-8">
        {cart.length === 0 ? (
          <div className="text-center py-24">
            <ShoppingBag className="mx-auto text-ink-subtle mb-6" size={64} />
            <Heading level="h2" className="mb-2">
              Votre panier est vide
            </Heading>
            <Text variant="muted" className="mb-6">
              Ajoutez des articles pour commencer
            </Text>
            <Link href="/catalog">
              <Button size="lg">
                Explorer le catalogue
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cart.map((item) => (
                <Card key={item.id} variant="elevated">
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <div className="relative w-24 h-24 overflow-hidden flex-shrink-0 bg-surface-2 rounded-none">
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full text-ink-subtle">
                            No Image
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <Text size="base" className="mb-2 font-medium truncate">
                          {item.name}
                        </Text>
                        <div className="flex items-center gap-3 mb-3">
                          <Text size="lg" className="font-medium">
                            {item.price.toLocaleString('fr-FR')} XOF
                          </Text>
                          {item.compare_at_price && (
                            <Text size="sm" variant="subtle" className="line-through">
                              {item.compare_at_price.toLocaleString('fr-FR')} XOF
                            </Text>
                          )}
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 border border-ink-tertiary rounded-none">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="p-2 text-ink hover:text-ink-muted transition-colors"
                            >
                              <Minus size={16} />
                            </button>
                            <span className="w-8 text-center font-ui font-medium">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="p-2 text-ink hover:text-ink-muted transition-colors"
                            >
                              <Plus size={16} />
                            </button>
                          </div>
                          
                          <button
                            onClick={() => removeItem(item.id)}
                            className="p-2 text-semantic-error hover:bg-semantic-error/10 transition-colors"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card variant="content" className="sticky top-24">
                <CardContent>
                  <Heading level="h2" className="mb-6">
                    Récapitulatif
                  </Heading>
                  
                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between">
                      <Text variant="muted">Sous-total</Text>
                      <Text>{subtotal.toLocaleString('fr-FR')} XOF</Text>
                    </div>
                    
                    {discountTotal > 0 && (
                      <div className="flex justify-between text-semantic-success">
                        <Text variant="muted">Réduction</Text>
                        <Text>-{discountTotal.toLocaleString('fr-FR')} XOF</Text>
                      </div>
                    )}
                    
                    <div className="space-y-2">
                      <Text variant="muted" size="sm">Zone de livraison</Text>
                      <select
                        value={selectedZone || ''}
                        onChange={(e) => setSelectedZone(e.target.value || null)}
                        className="w-full bg-surface-1 border border-ink-tertiary rounded-none px-4 py-3 text-ink focus:outline-none focus:border-accent"
                      >
                        <option value="">Sélectionner une zone</option>
                        {deliveryZones.map((zone) => (
                          <option key={zone.id} value={zone.id}>
                            {zone.name} - {zone.base_fee.toLocaleString()} FCFA
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="flex justify-between">
                      <Text variant="muted">Livraison</Text>
                      <Text>
                        {shippingFee > 0 ? shippingFee.toLocaleString('fr-FR') + ' XOF' : '-'}
                      </Text>
                    </div>
                    
                    <div className="border-t border-ink-tertiary pt-4 flex justify-between">
                      <Heading level="h3">Total</Heading>
                      <Text size="xl" className="font-medium">
                        {total.toLocaleString('fr-FR')} XOF
                      </Text>
                    </div>
                  </div>
                  
                  <Button
                    onClick={handleCheckout}
                    disabled={!selectedZone || cart.length === 0}
                    size="lg"
                    fullWidth
                  >
                    Passer la commande
                    <ArrowRight size={20} className="ml-2" />
                  </Button>
                  
                  <Text variant="subtle" size="sm" className="text-center mt-4">
                    Paiement à la livraison disponible
                  </Text>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Suggested Products */}
        {suggestedProducts.length > 0 && cart.length > 0 && (
          <div className="mt-24">
            <Heading level="h2" variant="display" className="mb-8">
              Vous aimerez aussi
            </Heading>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {suggestedProducts.map((product) => (
                <Link key={product.id} href={`/product/${product.slug}`}>
                  <Card variant="product" hover>
                    <CardContent className="p-0">
                      <div className="aspect-square bg-surface-2 relative overflow-hidden">
                        {product.images[0] && (
                          <Image
                            src={product.images[0]}
                            alt={product.name}
                            fill
                            className="object-cover transition-transform duration-normal hover:scale-105"
                            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 25vw, 20vw"
                          />
                        )}
                      </div>
                      <div className="p-4">
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
        )}
      </div>
    </main>
  );
}
