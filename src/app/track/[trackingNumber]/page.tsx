'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Navigation } from '@/components/layout/Navigation';
import { Card, CardContent } from '@/components/ui/Card';
import { Heading, Text, Badge } from '@/components/ui/Typography';
import { Button } from '@/components/ui/Button';
import { supabase } from '@/lib/supabase';
import { CheckCircle, Clock, Package, Truck, XCircle, Search, Home } from 'lucide-react';

const statusSteps = [
  { key: 'pending', label: 'Commande reçue', icon: Clock },
  { key: 'confirmed', label: 'Commande confirmée', icon: CheckCircle },
  { key: 'processing', label: 'En préparation', icon: Package },
  { key: 'shipped', label: 'En livraison', icon: Truck },
  { key: 'delivered', label: 'Livré', icon: CheckCircle },
  { key: 'cancelled', label: 'Annulée', icon: XCircle },
];

export default function TrackPage() {
  const params = useParams();
  const router = useRouter();
  const trackingNumber = (params?.trackingNumber as string) || '';

  // trackingNumber may be empty during initial renders; loadOrder handles it gracefully.
  
  const [order, setOrder] = useState<any>(null);
  const [orderItems, setOrderItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    loadOrder();
  }, [trackingNumber]);

  const loadOrder = async () => {
    try {
      const { data: orderData, error } = await supabase
        .from('orders')
        .select('*')
        .eq('tracking_number', trackingNumber)
        .single();

      if (error || !orderData) {
        setNotFound(true);
        return;
      }

      setOrder(orderData);

      const { data: itemsData } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', orderData.id);

      setOrderItems(itemsData || []);
    } catch (error) {
      console.error('Error loading order:', error);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentStepIndex = () => {
    if (!order) return 0;
    if (order.order_status === 'cancelled') return 5;
    const statusOrder = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
    return statusOrder.indexOf(order.order_status);
  };

  const isStepCompleted = (index: number) => {
    if (!order) return false;
    if (order.order_status === 'cancelled') return false;
    return index <= getCurrentStepIndex();
  };

  const isStepCurrent = (index: number) => {
    if (!order) return false;
    if (order.order_status === 'cancelled') return index === 5;
    return index === getCurrentStepIndex();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-canvas">
        <div className="text-ink text-lg">Chargement...</div>
      </div>
    );
  }

  if (notFound || !order) {
    return (
      <div className="min-h-screen bg-canvas">
        <Navigation />
        <div className="max-w-container-xl mx-auto px-6 py-24 text-center">
          <Search className="mx-auto text-ink-subtle mb-6" size={64} />
          <Heading level="h2" className="mb-2">
            Commande non trouvée
          </Heading>
          <Text variant="muted" className="mb-6">
            Vérifiez votre numéro de suivi et réessayez
          </Text>
          <Button onClick={() => router.back()} size="lg">
            Retour
          </Button>
        </div>
      </div>
    );
  }

  const currentStepIndex = getCurrentStepIndex();

  return (
    <main className="min-h-screen bg-canvas">
      <Navigation />
      
      <div className="max-w-container-xl mx-auto px-6 py-8">
        <div className="mb-10">
          <Text variant="muted" size="sm">Suivi de commande</Text>
          <Heading level="h1" variant="display" className="mt-2">
            Suivi de commande
          </Heading>
        </div>

        {/* Order Info */}
        <Card variant="content" className="mb-6">
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div>
                <Text variant="muted" size="sm">Numéro de suivi</Text>
                <Text size="xl" className="font-medium">#{trackingNumber}</Text>
              </div>
              <Badge variant={
                order.order_status === 'cancelled' ? 'error' :
                order.order_status === 'delivered' ? 'success' : 'accent'
              }>
                {statusSteps[currentStepIndex]?.label}
              </Badge>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <Text variant="muted">Date de commande</Text>
                <Text>
                  {new Date(order.created_at).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </Text>
              </div>
              <div>
                <Text variant="muted">Montant total</Text>
                <Text size="lg" className="font-medium">
                  {order.final_amount.toLocaleString('fr-FR')} XOF
                </Text>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status Timeline */}
        <Card variant="content" className="mb-6">
          <CardContent>
            <Heading level="h2" className="mb-6">Statut de la commande</Heading>
            
            <div className="space-y-4">
              {statusSteps.map((step, index) => {
                const Icon = step.icon;
                const completed = isStepCompleted(index);
                const current = isStepCurrent(index);
                const cancelled = order.order_status === 'cancelled' && index === 5;

                return (
                  <div
                    key={step.key}
                    className={`flex items-center gap-4 ${
                      index < statusSteps.length - 1 ? 'pb-4 border-b border-ink-tertiary' : ''
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      cancelled
                        ? 'bg-semantic-error/10 text-semantic-error'
                        : completed
                        ? 'bg-semantic-success/10 text-semantic-success'
                        : 'bg-surface-2 text-ink-subtle'
                    }`}>
                      <Icon size={24} />
                    </div>
                    
                    <div className="flex-1">
                      <Text className={`font-medium ${
                        cancelled
                          ? 'text-semantic-error'
                          : completed
                          ? 'text-ink'
                          : 'text-ink-subtle'
                      }`}>
                        {step.label}
                      </Text>
                      {current && order.order_status !== 'cancelled' && (
                        <Text variant="subtle" size="sm">En cours</Text>
                      )}
                    </div>

                    {completed && !cancelled && (
                      <CheckCircle className="text-semantic-success" size={24} />
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Order Items */}
        <Card variant="content" className="mb-6">
          <CardContent>
            <Heading level="h2" className="mb-4">Articles commandés</Heading>
            
            <div className="space-y-3">
              {orderItems.map((item) => (
                <div key={item.id} className="flex justify-between items-center py-3 border-b border-ink-tertiary last:border-0">
                  <div>
                    <Text size="base" className="font-medium">{item.product_name}</Text>
                    <Text variant="subtle" size="sm">
                      Quantité: {item.quantity} × {item.unit_price.toLocaleString('fr-FR')} XOF
                    </Text>
                  </div>
                  <Text size="lg" className="font-medium">
                    {item.total_price.toLocaleString('fr-FR')} XOF
                  </Text>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-ink-tertiary">
              <div className="flex justify-between">
                <Heading level="h3">Total</Heading>
                <Text size="xl" className="font-medium">
                  {order.final_amount.toLocaleString('fr-FR')} XOF
                </Text>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Delivery Info */}
        <Card variant="content" className="mb-6">
          <CardContent>
            <Heading level="h2" className="mb-4">Informations de livraison</Heading>
            
            <div className="space-y-3 text-sm">
              <div>
                <Text variant="muted">Nom</Text>
                <Text>{order.customer_name}</Text>
              </div>
              <div>
                <Text variant="muted">Téléphone</Text>
                <Text>{order.customer_phone}</Text>
              </div>
              <div>
                <Text variant="muted">Adresse</Text>
                <Text>{order.customer_address}</Text>
              </div>
              <div>
                <Text variant="muted">Ville</Text>
                <Text>{order.customer_city}</Text>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Back Button */}
        <Button onClick={() => router.push('/')} size="lg" fullWidth>
          <Home size={20} className="mr-2" />
          Retour à l'accueil
        </Button>
      </div>
    </main>
  );
}
