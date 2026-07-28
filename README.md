This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.


## KNOWN ISSUES & REQUIRED PR CHECKLIST

Avant d'approuver ou de merger une PR qui touche ce dépôt, elle doit résoudre ou documenter explicitement chaque point ci‑dessous (si applicable au scope de la PR). Toute PR qui n'adresse pas ces éléments sera renvoyée.

1) Build et TypeScript
- Problèmes fréquents rencontrés : imports manquants (ex. components/ui/GlassCard), types incompatibles sur app layouts (params promis), fichiers Supabase inclus dans le type-check Next.
- Exigence PR : passer `npm run build` localement et coller un extrait des erreurs résolues dans la description. Ne pas committer de hacks non expliqués.

2) Composants manquants / dépendances
- Rechercher et corriger imports cassés (ex. src/lib/products, components manquants). Ajouter fallback minimal si nécessaire avec commentaire TODO.
- Exigence PR : ajouter tests manuels rapides (note dans PR) ou unité montrant le composant monte.

3) Tailwind & styles
- Problèmes : config Tailwind non appliquée (tokens non générés), classes custom manquantes (max-w-container-xl), mauvais chemins d'import CSS.
- Exigence PR : vérifier génération CSS, inclure commande de build CSS réussie et screenshots si le visuel est impacté.

4) Double navigation / layout
- Problème : navigation dupliquée (SiteShell + pages individuelles). Impact UX majeur.
- Exigence PR : normaliser l'usage (un seul SiteShell/root navigation). PR doit corriger et expliquer.

5) Panier / état client
- Problème : plusieurs clés localStorage ('cart', 'daydays-fancy-cart') causent divergence d'état et badges inactifs.
- Exigence PR : centraliser à `useCart` et migrer data si présente (migration utilitaire incluse dans PR).

6) Routes & cohérence (app vs pages)
- Problème : routes dupliquées (/product/[slug] vs /products/[slug]) et fichiers déplacés provoquant mismatch.
- Exigence PR : garder une seule source de vérité pour chaque route et ajouter redirections si nécessaire.

7) PWA / assets
- Problèmes : icônes manquantes (icon-192.png, icon-512.png), service worker en cache-first sans stratégie de versioning.
- Exigence PR : ajouter assets manquants, implémenter cache versioning et stratégie 'network-first' pour SW, ou documenter choix.

8) Sécurité & secrets
- Problèmes : supabase service role exposé par erreur possible, Edge functions templates non déployées.
- Exigence PR : ne jamais inclure secrets. Toute PR modifiant déploiement/CI doit lister les secrets nécessaires et où les ajouter.

9) Migrations DB & Supabase
- Problème : migrations fournies mais non exécutées (02_add_seo_fields.sql, 03_orders_schema.sql, 04_create_order_rpc.sql).
- Exigence PR : inclure un plan de migration (commande supabase) et, si possible, un script idempotent. CI doit exécuter migrations sur main seulement.

10) Tests & QA
- Problème : pas d'e2e pour checkout / orders / WhatsApp flow.
- Exigence PR : ajouter tests unitaires/integ ciblés pour code modifié; pour changements critiques (checkout, RPC) inclure test e2e ou playbook de QA détaillé.

11) SEO & Performance
- Exigence PR : tout changement public (product page, images) doit vérifier meta tags, OpenGraph, sitemap generation et ne pas dégrader Lighthouse (baseline >90 visé). Documenter impact.

12) Accessibilité
- Exigence PR : pas de <button> imbriqué dans <a> / <Link>. Vérifier accessibilité basique pour composants modifiés.

13) Documentation & Release
- Exigence PR : mettre à jour README (ou /docs) si la PR change les procédures de build, secrets requis, ou le déploiement.

Template PR (obligatoire) — inclure au début de chaque description PR:
- Objet succinct
- Checklist: Build ✅, Types ✅, Lint ✅, Tests ✅, Migration DB (oui/non + commandes), Secrets requis (liste), Impact UI (screenshot si UI)
- Validation locale: commandes exécutées

Si une PR ne peut pas corriger immédiatement un problème listé (ex. nécessite secret ou migration prod), documenter clairement la limitation et ajouter un ticket TODO associé.

---

SECTION OPÉRATIONNELLE RAPIDE

Commandes utiles locales:
- npm install
- npm run dev
- npm run build
- npm run lint
- scripts/deploy_supabase.sh (pour CI — nécessite SUPABASE_ACCESS_TOKEN et SUPABASE_SERVICE_ROLE_KEY)

Contacts & ownership:
- Responsable deploy / secrets: personne qui gère le compte Supabase / GitHub Actions (documenter dans l'équipe)

---

Ce README doit rester la référence. Toute personne qui travaille sur ce repo doit répondre à ces exigences avant de merger une PR. Si tu veux, j'ajoute aussi un GitHub ISSUE_TEMPLATE / PR_TEMPLATE automatique pour imposer la checklist.
