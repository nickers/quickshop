# Production environment

Workflow **Production** (`.github/workflows/production.yml`) runs on push to `main`: lint → unit tests (with coverage) → production build.

The **build** job uses the GitHub environment named **Production**. Configure it so the app gets the same variables as locally via `.env.local`.

## Setup

1. In the repo: **Settings** → **Environments** → **Production** (create if needed).
2. Add:

   | Type    | Name                            | Description              |
   |---------|---------------------------------|--------------------------|
   | Variable| `VITE_SUPABASE_URL`             | Supabase project URL     |
   | Variable| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase anon/public key |

Vite embeds these at build time (same as `VITE_*` from `.env.local`). Deployment can be added later to the same workflow.
