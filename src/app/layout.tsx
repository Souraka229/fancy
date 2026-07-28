import type { Metadata } from "next";
import { CartProvider } from "@/components/cart-provider";
import { SiteShell } from "@/components/site-shell";
import "./globals.css";

export const metadata: Metadata = {
  title: "DAYDAY'S FANCY | Boutique premium montres, bijoux & accessoires à Cotonou",
  description: "Boutique en ligne premium à Cotonou — montres, bijoux, gadgets et accessoires lifestyle avec livraison rapide, paiement à la livraison et suivi WhatsApp.",
  keywords: ["montres premium", "bijoux de luxe", "accessoires mode", "gadgets design", "Cotonou", "livraison rapide", "e-commerce", "suivi WhatsApp"],
  manifest: "/manifest.json",
  themeColor: "#0a0a0a",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "FANCY",
  },
  openGraph: {
    title: "DAYDAY'S FANCY | Boutique premium montres, bijoux & accessoires",
    description: "Boutique en ligne premium à Cotonou — montres, bijoux, gadgets et accessoires lifestyle avec livraison rapide, paiement à la livraison et suivi WhatsApp.",
    type: "website",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning className="h-full antialiased">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <meta name="theme-color" content="#0a0a0a" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/sw.js').then((registration) => {
                    console.log('SW registered: ', registration);
                  }).catch((registrationError) => {
                    console.log('SW registration failed: ', registrationError);
                  });
                });
              }
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <CartProvider>
          <SiteShell>{children}</SiteShell>
        </CartProvider>
      </body>
    </html>
  );
}
