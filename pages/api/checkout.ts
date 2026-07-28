import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'
import { generateUniqueOrderNumber } from '../../lib/orderUtils'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const supabase = createClient(supabaseUrl, serviceKey)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const payload = req.body
    const items = payload.items || []
    const customer = payload.customer || {}
    if (!items.length) return res.status(400).json({ error: 'Cart empty' })
    if (!customer.name || !customer.whatsapp || !customer.address) {
      return res.status(400).json({ error: 'Missing customer information' })
    }

    // Fetch product snapshots
    const productIds = items.map((i: any) => i.product_id)
    const { data: products, error: prodErr } = await supabase.from('products').select('*').in('id', productIds)
    if (prodErr) throw prodErr

    // Build order items and compute total
    let total = 0
    const orderItems: any[] = []
    for (const item of items) {
      const prod = (products || []).find((p: any) => p.id === item.product_id)
      if (!prod) return res.status(400).json({ error: `Product ${item.product_id} not found` })
      const unitPrice = prod.price - (prod.discount || 0)
      if (prod.stock != null && prod.stock < item.quantity) return res.status(400).json({ error: `Insufficient stock for ${prod.name}` })
      const lineTotal = unitPrice * item.quantity
      total += lineTotal
      orderItems.push({ product_id: prod.id, sku: prod.sku, name: prod.name, unit_price: unitPrice, quantity: item.quantity, total_price: lineTotal })
    }

    // Optional shipping / fees
    const shipping = payload.shipping || 0
    total += shipping

    // Generate unique 5-digit order number
    const orderNumber = await generateUniqueOrderNumber(supabase)

    // Use atomic RPC to create order, items and decrement stock
    const { data: rpcData, error: rpcErr } = await supabase.rpc('create_order_atomic', { p_items: JSON.stringify(items), p_customer: JSON.stringify(customer), p_shipping: shipping })
    if (rpcErr) throw rpcErr

    return res.status(201).json({ ok: true, result: rpcData })
  } catch (e: any) {
    console.error('checkout error', e)
    return res.status(500).json({ ok: false, error: String(e.message || e) })
  }
}
