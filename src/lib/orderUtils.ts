import { SupabaseClient } from '@supabase/supabase-js'

export async function generateUniqueOrderNumber(supabase: SupabaseClient): Promise<string> {
  const maxAttempts = 10
  for (let i = 0; i < maxAttempts; i++) {
    const candidate = Math.floor(10000 + Math.random() * 90000).toString()
    const { data, error } = await supabase.from('orders').select('id').eq('order_number', candidate).limit(1)
    if (error) throw new Error('DB error checking order number: ' + error.message)
    if (!data || (Array.isArray(data) && data.length === 0)) {
      return candidate
    }
  }
  throw new Error('Unable to generate unique order number after several attempts')
}
