import Head from 'next/head'

export default function Home() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-muted)]">
      <Head>
        <title>DAYDAY'S FANCY</title>
        <meta name="description" content="DAYDAY'S FANCY — Accessories & Lifestyle" />
      </Head>

      <main className="p-4">
        <section className="relative rounded-xl overflow-hidden" aria-label="Hero">
          <div className="bg-black text-white p-6 rounded-xl">
            <h1 className="text-3xl font-bold">DAYDAY'S FANCY</h1>
            <p className="mt-2 text-orange-500">Accessories & Lifestyle</p>
          </div>
        </section>

        <section className="mt-6">
          <div className="p-4 rounded-md bg-white/5">Demo scaffold ready. Next: integrate Supabase and build catalog.</div>
        </section>
      </main>
    </div>
  )
}
