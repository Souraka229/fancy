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


## Project notes & production checklist

- Frontend: Next.js + Tailwind + Framer Motion
- Backend: Supabase (Postgres, Auth, Storage, Edge Functions) — configure policies and service keys in Supabase dashboard.
- design-system.tokens.css is included: import it from your globals.css

Production checklist (short):
1. Set secrets in deployment platform / GitHub repo: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, NEXT_PUBLIC_SITE_URL.
2. Run SQL migrations in supabase/migrations (02_add_seo_fields.sql) via Supabase SQL editor or migration tooling.
3. Configure Supabase RLS policies for orders and private data.
4. Configure Supabase Storage + CDN and populate product.image_urls with CDN links.
5. Configure Vercel project (or chosen host) with environment variables and set up automatic deploys from main.
6. Enable monitoring and backups in Supabase; set up basic alerts for errors and low stock.

Automated deploy (CI):
- A `deploy-supabase` workflow and `scripts/deploy_supabase.sh` are provided which will run SQL migrations and deploy Edge Functions using the supabase CLI. The workflow is configured to run on push to `main` when secrets are available.

Secrets required for automated deploy (set in GitHub or Vercel):
- SUPABASE_URL (your project ref URL or ID)
- SUPABASE_SERVICE_ROLE_KEY (server-only)
- SUPABASE_ACCESS_TOKEN (for supabase CLI in CI)
- TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER (optional — for WhatsApp)

Security notes:
- Do NOT commit service keys. Store them in deployment secrets only.
- The Edge Function `supabase/functions/create_order_webhook` is a template that sends WhatsApp messages via Twilio when called; it must be deployed and secrets configured to be active.

To finalize production-ready release (automated):
1. Add the secrets above to GitHub Actions or Vercel environment.
2. Push to `main` — CI will run build and the deploy workflow (if enabled).
3. Verify migrations in Supabase SQL editor and ensure RLS policies are applied (supabase/policies/*.sql provided).
4. Run QA checklist: product pages, checkout, /track-order, notifications, admin.

The repository includes:
- migrations/ for SQL schema updates
- functions/ template for Edge Functions
- scripts/deploy_supabase.sh to run migrations and deploy functions via supabase CLI

Once secrets are set and you push to main, CI will apply migrations and deploy the Edge Function automatically. If anything fails, CI logs provide troubleshooting details.
