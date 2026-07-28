'use client';

import { useEffect, useState } from 'react';
import { Navigation } from '@/components/layout/Navigation';
import { Card, CardContent } from '@/components/ui/Card';
import { Heading, Text, Badge } from '@/components/ui/Typography';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { supabase } from '@/lib/supabase';

const trackingSteps = [
  { label: 'Commande confirmée', value: 'pending' },
  { label: 'En préparation', value: 'processing' },
  { label: 'En livraison', value: 'shipped' },
  { label: 'Livré', value: 'delivered' },
];

export default function TrackingPage() {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    if (!trackingNumber.trim()) return;

    setLoading(true);
    setError('');
    setOrder(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('orders')
        .select('*, deliveries(*, delivery_zones(*))')
        .eq('tracking_number', trackingNumber.trim())
        .single();

      if (fetchError) throw fetchError;

      if (!data) {
        setError('Aucune commande trouvée avec ce numéro de suivi.');
      } else {
        setOrder(data);
      }
    } catch (err) {
      console.error('Error tracking order:', err);
      setError('Erreur lors de la recherche. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const activeIndex = order ? trackingSteps.findIndex((step) => step.value === order.order_status) : -1;

  return (
    <main className="min-h-screen bg-canvas">
      <Navigation />
      
      <div className="max-w-container-xl mx-auto px-6 py-8">
        <div className="mb-10">
          <Text variant="muted" size="sm">Suivi de commande</Text>
          <Heading level="h1" variant="display" className="mt-2">
            Suivez votre commande
          </Heading>
        </div>

        <Card variant="content" className="mb-8">
          <CardContent>
            <div className="flex gap-4">
              <Input
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="Entrez votre numéro de suivi"
                className="flex-1"
              />
              <Button onClick={handleSearch} disabled={loading}>
                {loading ? 'Recherche...' : 'Rechercher'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {error && (
          <Card variant="content" className="mb-8">
            <CardContent>
              <Text variant="subtle" className="text-center">
                {error}
              </Text>
            </CardContent>
          </Card>
        )}

        {order && (
          <Card variant="content">
            <CardContent>
              <div className="mb-6">
                <Text variant="muted" size="sm">Numéro de commande</Text>
                <Heading level="h2">#{order.tracking_number}</Heading>
              </div>

              <div className="grid gap-6 md:grid-cols-2 mb-8">
                <div className="bg-surface-2 p-4">
                  <Text variant="muted" size="sm">Montant total</Text>
                  <Text size="xl" className="font-medium">
                    {order.final_amount.toLocaleString('fr-FR')} XOF
                  </Text>
                </div>
                <div className="bg-surface-2 p-4">
                  <Text variant="muted" size="sm">Statut</Text>
                  <Badge variant="accent">
                    {trackingSteps[activeIndex]?.label || order.order_status}
                  </Badge>
                </div>
              </div>

              <div className="space-y-3">
                {trackingSteps.map((step, index) => {
                  const isActive = index <= activeIndex;
                  return (
                    <div
                      key={step.label}
                      className={`flex items-center gap-3 border px-4 py-3 ${
                        isActive ? 'border-ink bg-ink text-canvas' : 'border-ink-tertiary bg-surface-1 text-ink'
                      }`}
                    >
                      <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                        isActive ? 'bg-canvas text-ink' : 'bg-surface-2 text-ink-subtle'
                      }`}>
                        {index + 1}
                      </div>
                      <Text size="base" className="font-medium">{step.label}</Text>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}
