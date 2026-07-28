import { useEffect, useState } from 'react'

type Ping = {
  ok: boolean
  connected?: boolean
  tableExists?: boolean
  error?: string
  sample?: any
}

export default function SupabaseTest() {
  const [res, setRes] = useState<Ping | null>(null)
  useEffect(() => {
    fetch('/api/supabase/ping')
      .then((r) => r.json())
      .then((j) => setRes(j))
      .catch((e) => setRes({ ok: false, error: String(e) }))
  }, [])

  return (
    <div className="p-6 min-h-screen bg-[var(--color-bg)] text-[var(--color-muted)]">
      <h1 className="text-2xl font-bold text-[var(--color-cream)]">Supabase connection test</h1>
      <div className="mt-4 p-4 rounded-md bg-white/5">
        {res ? (
          <pre className="whitespace-pre-wrap text-sm">{JSON.stringify(res, null, 2)}</pre>
        ) : (
          <p>Testing connection…</p>
        )}
      </div>
      <div className="mt-4 text-sm text-[var(--color-gray)]">If table 'products' doesn't exist, use supabase/init.sql in the repo to create seed data.</div>
    </div>
  )
}
