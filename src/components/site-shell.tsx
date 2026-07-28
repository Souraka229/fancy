"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/components/cart-provider";

const links = [
  { href: "/", label: "Accueil" },
  { href: "/products", label: "Produits" },
  { href: "/checkout", label: "Commande" },
  { href: "/admin", label: "Admin" },
  { href: "/tracking", label: "Suivi" },
];

export function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { itemCount } = useCart();

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#fffdf9_0%,_#f8f2e8_100%)] text-stone-900">
      <header className="border-b border-stone-200/80 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-stone-950 text-sm font-semibold text-white">
              DF
            </div>
            <div>
              <p className="text-lg font-semibold tracking-[0.25em] text-stone-950">DAYDAY&apos;S FANCY</p>
              <p className="text-xs uppercase tracking-[0.3em] text-stone-500">Mode premium & accessoires lifestyle</p>
            </div>
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            {links.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-medium transition ${active ? "text-stone-950" : "text-stone-600 hover:text-stone-950"}`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/checkout" className="rounded-full border border-stone-300 px-4 py-2 text-sm font-semibold text-stone-700 transition hover:border-stone-950 hover:text-stone-950">
              Panier · {itemCount}
            </Link>
            <div className="flex gap-2 md:hidden">
              {links.slice(0, 3).map((link) => (
                <Link key={link.href} href={link.href} className="rounded-full border border-stone-200 px-2.5 py-2 text-xs font-semibold text-stone-700">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </header>
      <main>{children}</main>
      <footer className="border-t border-stone-200 bg-white/70">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-8 text-sm text-stone-600 sm:px-6 lg:px-8 md:flex-row md:items-center md:justify-between">
          <p>DAYDAY&apos;S FANCY — boutique en ligne premium de montres, bijoux et accessoires à Cotonou.</p>
          <div className="flex gap-4">
            <a href="https://wa.me/2290194635656" className="font-semibold text-stone-950">WhatsApp</a>
            <a href="/tracking" className="font-semibold text-stone-950">Suivi commande</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
