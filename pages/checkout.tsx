import { useState } from 'react'

export default function CheckoutPage() {
  const [name, setName] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [address, setAddress] = useState('')
  const [zone, setZone] = useState('')
  const [status, setStatus] = useState<string | null>(null)

  // demo cart items - in production get from cart store
  const demoItems = [{ product_id: 1, quantity: 1 }]

  async function submit(e: any) {
    e.preventDefault()
    setStatus('Envoi en cours...')
    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: demoItems, customer: { name, whatsapp, address, zone }, shipping: 0 })
    })
    const j = await res.json()
    if (res.ok) {
      setStatus('Commande créée: ' + (j.result?.order_number || JSON.stringify(j.result)))
    } else {
      setStatus('Erreur: ' + (j.error || JSON.stringify(j)))
    }
  }

  return (
    <div className="p-4 min-h-screen bg-[var(--color-bg)] text-[var(--color-muted)]">
      <h1 className="text-2xl font-bold text-[var(--color-cream)]">Caisse (Guest)</h1>
      <form onSubmit={submit} className="mt-4 space-y-3">
        <input required value={name} onChange={e => setName(e.target.value)} placeholder="Nom complet" className="w-full p-3 rounded-md bg-white/5" />
        <input required value={whatsapp} onChange={e => setWhatsapp(e.target.value)} placeholder="Téléphone WhatsApp" className="w-full p-3 rounded-md bg-white/5" />
        <input required value={address} onChange={e => setAddress(e.target.value)} placeholder="Adresse" className="w-full p-3 rounded-md bg-white/5" />
        <input value={zone} onChange={e => setZone(e.target.value)} placeholder="Zone livraison" className="w-full p-3 rounded-md bg-white/5" />
        <button type="submit" className="w-full px-4 py-3 bg-[var(--color-accent)] text-white rounded-md">Confirmer la commande</button>
      </form>

      {status && <div className="mt-4 p-3 rounded-md bg-white/5">{status}</div>}
    </div>
  )
}
