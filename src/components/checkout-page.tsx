'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Navigation } from '@/components/layout/Navigation';
import { Card, CardContent } from '@/components/ui/Card';
import { Heading, Text } from '@/components/ui/Typography';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Check, ArrowRight, ShoppingBag, MapPin, User } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface CartItem {
  id: string;
  name: string;
  price: number;
  compare_at_price: number | null;
  image: string;
  quantity: number;
}

export function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [deliveryZones, setDeliveryZones] = useState<any[]>([]);
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState('');
  
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    notes: '',
  });

  useEffect(() => {
    loadCart();
    loadDeliveryZones();
  }, []);

  const loadCart = () => {
    const savedCart = localStorage.getItem('cart');
    const savedZone = localStorage.getItem('selectedZone');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
    if (savedZone) {
      setSelectedZone(savedZone);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedZone || cart.length === 0) return;

    setSubmitting(true);

    try {
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          customer_name: form.name,
          customer_email: form.email,
          customer_phone: form.phone,
          customer_address: form.address,
          customer_city: form.city,
          total_amount: subtotal,
          discount_amount: discountTotal,
          final_amount: total,
          payment_method: 'cod',
          payment_status: 'pending',
          order_status: 'pending',
          notes: form.notes,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      const orderItems = cart.map(item => ({
        order_id: orderData.id,
        product_name: item.name,
        quantity: item.quantity,
        unit_price: item.price,
        total_price: item.price * item.quantity,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      await supabase.from('payments').insert({
        order_id: orderData.id,
        payment_method: 'cod',
        amount: total,
        status: 'pending',
      });

      await supabase.from('deliveries').insert({
        order_id: orderData.id,
        zone_id: selectedZone,
        status: 'pending',
        delivery_address: form.address,
      });

      setTrackingNumber(orderData.tracking_number);
      setOrderSuccess(true);
      
      localStorage.removeItem('cart');
      localStorage.removeItem('selectedZone');
      setCart([]);

    } catch (error) {
      console.error('Error creating order:', error);
      alert('Erreur lors de la création de la commande. Veuillez réessayer.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-canvas">
        <div className="text-ink text-lg">Chargement...</div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-canvas">
        <Navigation />
        <div className="max-w-container-xl mx-auto px-6 py-24 text-center">
          <ShoppingBag className="mx-auto text-ink-subtle mb-6" size={64} />
          <Heading level="h2" className="mb-2">
            Votre panier est vide
          </Heading>
          <Button onClick={() => router.push('/catalog')} size="lg">
            Explorer le catalogue
          </Button>
        </div>
      </div>
    );
  }

  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-canvas">
        <Navigation />
        <div className="max-w-container-xl mx-auto px-6 py-24">
          <div className="max-w-md mx-auto text-center">
            <div className="w-20 h-20 bg-semantic-success rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="text-canvas" size={40} />
            </div>
            
            <Heading level="h1" className="mb-2">
              Commande confirmée!
            </Heading>
            <Text variant="muted" className="mb-6">
              Votre commande a été enregistrée avec succès
            </Text>
            
            <Card variant="content" className="mb-6">
              <CardContent>
                <Text variant="muted" size="sm" className="mb-1">Numéro de suivi</Text>
                <Text size="xl" className="font-medium mb-2">#{trackingNumber}</Text>
                <Text variant="subtle" size="sm">
                  Conservez ce numéro pour suivre votre commande
                </Text>
              </CardContent>
            </Card>
            
            <div className="space-y-3">
              <Button onClick={() => router.push(`/track/${trackingNumber}`)} size="lg" fullWidth>
                Suivre ma commande
                <ArrowRight size={20} className="ml-2" />
              </Button>
              
              <Button onClick={() => router.push('/')} variant="secondary" size="lg" fullWidth>
                Retour à l'accueil
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-canvas">
      <Navigation />
      
      {/* Header */}
      <div className="sticky top-14 md:top-16 z-30 bg-canvas border-b border-ink-tertiary px-4 py-4">
        <div className="max-w-container-xl mx-auto">
          <Heading level="h1">Finaliser la commande</Heading>
        </div>
      </div>

      <div className="max-w-container-xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Personal Info */}
              <Card variant="content">
                <CardContent>
                  <Heading level="h2" className="mb-6 flex items-center gap-2">
                    <User size={24} className="text-accent" />
                    Informations personnelles
                  </Heading>
                  
                  <div className="space-y-4">
                    <Input
                      label="Nom complet *"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Votre nom"
                    />
                    
                    <Input
                      label="Email *"
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="votre@email.com"
                    />
                    
                    <Input
                      label="Téléphone WhatsApp *"
                      type="tel"
                      required
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="+229 XX XX XX XX"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Delivery Info */}
              <Card variant="content">
                <CardContent>
                  <Heading level="h2" className="mb-6 flex items-center gap-2">
                    <MapPin size={24} className="text-accent" />
                    Adresse de livraison
                  </Heading>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-ui font-medium text-ink mb-2">
                        Zone de livraison *
                      </label>
                      <select
                        required
                        value={selectedZone || ''}
                        onChange={(e) => {
                          setSelectedZone(e.target.value);
                          localStorage.setItem('selectedZone', e.target.value);
                        }}
                        className="w-full bg-surface-1 border border-ink-tertiary rounded-none px-4 py-3 text-ink focus:outline-none focus:border-accent"
                      >
                        <option value="">Sélectionner une zone</option>
                        {deliveryZones.map((zone) => (
                          <option key={zone.id} value={zone.id}>
                            {zone.name} - {zone.base_fee.toLocaleString()} FCFA ({zone.estimated_days} jours)
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <Input
                      label="Ville *"
                      required
                      value={form.city}
                      onChange={(e) => setForm({ ...form, city: e.target.value })}
                      placeholder="Cotonou"
                    />
                    
                    <div>
                      <label className="block text-sm font-ui font-medium text-ink mb-2">
                        Adresse complète *
                      </label>
                      <textarea
                        required
                        value={form.address}
                        onChange={(e) => setForm({ ...form, address: e.target.value })}
                        rows={3}
                        className="w-full bg-surface-1 border border-ink-tertiary rounded-none px-4 py-3 text-ink placeholder-ink-subtle focus:outline-none focus:border-accent resize-none"
                        placeholder="Quartier, rue, numéro de maison..."
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-ui font-medium text-ink mb-2">
                        Notes (optionnel)
                      </label>
                      <textarea
                        value={form.notes}
                        onChange={(e) => setForm({ ...form, notes: e.target.value })}
                        rows={2}
                        className="w-full bg-surface-1 border border-ink-tertiary rounded-none px-4 py-3 text-ink placeholder-ink-subtle focus:outline-none focus:border-accent resize-none"
                        placeholder="Instructions de livraison spéciales..."
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Button
                type="submit"
                disabled={!selectedZone || submitting}
                size="lg"
                fullWidth
              >
                {submitting ? 'Traitement en cours...' : 'Confirmer la commande'}
                <ArrowRight size={20} className="ml-2" />
              </Button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card variant="content" className="sticky top-24">
              <CardContent>
                <Heading level="h2" className="mb-6">
                  Récapitulatif
                </Heading>
                
                <div className="space-y-3 mb-6">
                  {cart.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <Text variant="muted">
                        {item.name} × {item.quantity}
                      </Text>
                      <Text>
                        {(item.price * item.quantity).toLocaleString('fr-FR')} XOF
                      </Text>
                    </div>
                  ))}
                </div>
                
                <div className="border-t border-ink-tertiary pt-4 space-y-3">
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
                  
                  <div className="flex justify-between">
                    <Text variant="muted">Livraison</Text>
                    <Text>
                      {shippingFee > 0 ? shippingFee.toLocaleString('fr-FR') + ' XOF' : '-'}
                    </Text>
                  </div>
                  
                  <div className="border-t border-ink-tertiary pt-3 flex justify-between">
                    <Heading level="h3">Total</Heading>
                    <Text size="xl" className="font-medium">
                      {total.toLocaleString('fr-FR')} XOF
                    </Text>
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-surface-1 rounded-none">
                  <Text variant="subtle" size="sm" className="text-center">
                    💳 Paiement à la livraison
                  </Text>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
