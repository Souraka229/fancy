import { serve } from 'std/server'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = Deno.env.get('NEXT_PUBLIC_SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
const TWILIO_ACCOUNT_SID = Deno.env.get('TWILIO_ACCOUNT_SID')
const TWILIO_AUTH_TOKEN = Deno.env.get('TWILIO_AUTH_TOKEN')
const TWILIO_PHONE_NUMBER = Deno.env.get('TWILIO_PHONE_NUMBER')

const supabase = createClient(SUPABASE_URL || '', SUPABASE_SERVICE_ROLE_KEY || '')

serve(async (req) => {
  try {
    const payload = await req.json()
    // Expected payload: { order_number: '12345', event: 'created' }
    const { order_number, event } = payload

    // lookup order details
    const { data: order } = await supabase.from('orders').select('*').eq('order_number', order_number).maybeSingle()
    if (!order) return new Response(JSON.stringify({ ok: false, error: 'Order not found' }), { status: 404 })

    // build message
    let message = ''
    switch (event) {
      case 'created':
        message = `Votre commande #${order_number} a été reçue. Nous vous contacterons sur WhatsApp pour confirmation.`
        break
      case 'prepared':
        message = `Votre commande #${order_number} est prête.`
        break
      case 'shipped':
        message = `Votre commande #${order_number} a été envoyée.`
        break
      case 'delivered':
        message = `Votre commande #${order_number} a été livrée. Merci !`
        break
      default:
        message = `Mise à jour commande #${order_number} : ${event}`
    }

    // send via Twilio (WhatsApp)
    if (TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN && TWILIO_PHONE_NUMBER) {
      const to = `whatsapp:${order.whatsapp_phone}`
      const body = new URLSearchParams({ To: to, From: `whatsapp:${TWILIO_PHONE_NUMBER}`, Body: message })
      const resp = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`)}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: body.toString()
      })
      if (!resp.ok) {
        const text = await resp.text()
        console.error('Twilio error', text)
      }
    }

    return new Response(JSON.stringify({ ok: true }), { status: 200 })
  } catch (e) {
    console.error(e)
    return new Response(JSON.stringify({ ok: false, error: String(e) }), { status: 500 })
  }
})
