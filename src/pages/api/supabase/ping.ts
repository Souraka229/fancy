import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabase = createClient(supabaseUrl, serviceKey)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { data, error } = await supabase.from('products').select('id, name').limit(1)
    if (error) {
      // Table might not exist but connection is OK
      return res.status(200).json({ ok: true, connected: true, tableExists: false, error: error.message })
    }
    return res.status(200).json({ ok: true, connected: true, tableExists: true, sample: data || [] })
  } catch (e) {
    return res.status(500).json({ ok: false, connected: false, error: String(e) })
  }
}
