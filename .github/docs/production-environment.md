# Production environment

Workflow **Production** (`.github/workflows/production.yml`) runs on push to `main`: lint + unit tests → build → deploy to Cloudflare Pages.

The **build** and **deploy** jobs use the GitHub environment named **Production**. Configure variables and secrets so the app builds and deploys correctly.

## Build (Vite)

1. In the repo: **Settings** → **Environments** → **Production** (create if needed).
2. Add variables for the build (same as `.env.local` locally):

   | Type    | Name                            | Description              |
   |---------|---------------------------------|--------------------------|
   | Variable| `VITE_SUPABASE_URL`             | Supabase project URL     |
   | Variable| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase anon/public key |

Vite embeds these at build time.

## Deploy (Cloudflare Pages)

3. Add secrets and variable for Cloudflare Pages:

   | Type    | Name                         | Description                                      |
   |---------|------------------------------|--------------------------------------------------|
   | Secret  | `CLOUDFLARE_API_TOKEN`        | API token z uprawnieniem „Cloudflare Pages Edit”|
   | Secret  | `CLOUDFLARE_ACCOUNT_ID`       | Cloudflare Account ID                            |
   | Variable| `CLOUDFLARE_PAGES_PROJECT_NAME` | Nazwa projektu Pages (np. `quickshop`)        |

Token: Cloudflare Dashboard → My Profile → API Tokens → Create Token → template „Edit Cloudflare Workers” lub custom z „Cloudflare Pages Edit”.
