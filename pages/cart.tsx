import Link from 'next/link'
import { useState } from 'react'

// Simple client-side cart demo (local state) - integrate with real cart store in production
export default function CartPage() {
  const [items, setItems] = useState<any[]>([])

  return (
    <div className="p-4 min-h-screen bg-[var(--color-bg)] text-[var(--color-muted)]">
      <h1 className="text-2xl font-bold text-[var(--color-cream)]">Panier</h1>
      <div className="mt-6">
        {items.length === 0 ? (
          <div className="p-4 bg-white/5 rounded-md">Votre panier est vide.</div>
        ) : (
          <ul>
            {items.map((it, idx) => (
              <li key={idx}>{it.name} x {it.quantity}</li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-6">
        <Link href="/checkout">
          <a className="inline-block px-4 py-2 bg-[var(--color-accent)] text-white rounded-md">Passer à la caisse</a>
        </Link>
      </div>
    </div>
  )
}
