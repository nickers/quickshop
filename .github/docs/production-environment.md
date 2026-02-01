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

## E2E tests (TestsE2E)

The **e2e** job uses the GitHub environment **TestsE2E**. E2E tests run against a local dev server started by Playwright in CI. Playwright loads `code/.env.e2e` from the repo (emails, Vite vars); only passwords must come from the environment.

4. In the repo: **Settings** → **Environments** → **TestsE2E** (create if needed).
5. Add secrets so auth setup can log in (emails and Vite vars come from committed `code/.env.e2e`):

   | Type   | Name                 | Description        |
   |--------|----------------------|--------------------|
   | Secret | `E2E_USER1_PASSWORD` | Password for E2E_USER1 (email in `.env.e2e`) |
   | Secret | `E2E_USER2_PASSWORD` | Password for E2E_USER2 |

   **Optional:** `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` — if set in the environment, they override `code/.env.e2e`. `BASE_URL` — if unset or empty, Playwright uses `http://localhost:3000` and starts the dev server.
