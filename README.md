# SmartSale Marketplace — Customer Frontend

React + Vite + Tailwind CSS marketplace frontend, connected to the existing **smart_sale** Supabase project.

## Stack

- **React 18** + **React Router v6**
- **Vite 5** (fast dev + optimised static build)
- **Tailwind CSS 3** (utility-first, custom design tokens)
- **@supabase/supabase-js** (reads from existing DB — no schema changes)
- **Google Fonts**: Syne (display) + DM Sans (body)

## Pages & Routes

| Route | Page | Description |
|-------|------|-------------|
| `/` | HomePage | Landing: hero, features, categories, featured products, vendors |
| `/search` | SearchPage | Live search + category filter |
| `/category/:slug` | CategoryPage | Products in a category |
| `/product/:id` | ProductPage | Product detail + related |
| `/vendors` | VendorsPage | All vendor companies |

> ⚠️ Admin routes live in the **original project** — this repo only contains public marketplace routes.

## Supabase Tables Used

| Table | Usage |
|-------|-------|
| `products` | Product cards, search, detail |
| `categories` | Category nav, filter chips |
| `customer_companies` | Vendor cards (treated as sellers) |
| `orders` | Stats counter in hero section |
| `customers` | Stats counter in hero section |

> All reads use the **anon key** — RLS policies on the Supabase project control what's publicly visible.

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env.local
# Edit .env.local and set:
#   VITE_SUPABASE_URL=https://vjucvxuldtqlxoptykvh.supabase.co
#   VITE_SUPABASE_ANON_KEY=<your-anon-key>

# 3. Run dev server
npm run dev

# 4. Build for production
npm run build
```

## Deploy

### AWS Amplify (Static)

1. Push repo to GitHub/GitLab/CodeCommit
2. Connect to AWS Amplify → New App → Host Web App
3. Amplify auto-detects `amplify.yml` — no changes needed
4. Add environment variables in **Amplify Console → App Settings → Environment variables**:
   ```
   VITE_SUPABASE_URL     = https://vjucvxuldtqlxoptykvh.supabase.co
   VITE_SUPABASE_ANON_KEY = <anon-key>
   ```
5. Deploy. SPA routing is handled by Amplify's default redirect rule (set `/` → `index.html` with 200).

### Cloudflare Pages

1. Push repo to GitHub
2. Cloudflare Dashboard → Workers & Pages → Create application → Pages → Connect Git
3. Build settings:
   - **Framework preset**: Vite
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
4. Add environment variables:
   ```
   VITE_SUPABASE_URL     = https://vjucvxuldtqlxoptykvh.supabase.co
   VITE_SUPABASE_ANON_KEY = <anon-key>
   ```
5. `public/_redirects` handles SPA routing automatically.

### Cloudflare Workers (edge)

If you need edge-side logic, `wrangler.toml` is included. Run:
```bash
npm install -g wrangler
wrangler secret put VITE_SUPABASE_ANON_KEY
wrangler deploy
```

## Supabase RLS Note

The marketplace uses the **anon** key. Make sure your RLS policies allow public `SELECT` on:
- `products` where `status = 'active'`
- `categories` where `status = 'active'`
- `customer_companies` where `status = 'active'`
- `orders`, `customers` (count only — no sensitive columns exposed)

Example policy for products:
```sql
CREATE POLICY "public_products_select"
  ON products FOR SELECT
  USING (status = 'active');
```

## Project Structure

```
marketplace/
├── public/
│   ├── _redirects        # Cloudflare Pages SPA routing
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── layout/       # Navbar, Footer, Layout
│   │   ├── sections/     # Hero, Features, Categories, Featured, Vendors
│   │   └── ui/           # ProductCard, VendorCard, CategoryCard
│   ├── hooks/
│   │   └── useData.js    # All Supabase data hooks
│   ├── lib/
│   │   └── supabase.js   # Supabase client
│   ├── pages/            # All route pages
│   ├── App.jsx           # Router
│   ├── main.jsx          # Entry
│   └── index.css         # Tailwind + global styles
├── amplify.yml           # AWS Amplify build config
├── wrangler.toml         # Cloudflare Workers config
├── vite.config.js
├── tailwind.config.js
└── .env.example
```
