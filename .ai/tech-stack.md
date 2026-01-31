* Frontend: React + Vite, Tailwind CSS + Material Design components.
* Backend (BaaS): Supabase (PostgreSQL).
* Komunikacja: Realtime via WebSockets (PostgreSQL CDC) dla synchronizacji list.
* Uwierzytelnianie: Supabase Auth (Email/Hasło + Google OAuth).
* Hosting: Cloudflare Pages (deploy z GitHub Actions); lokalnie Vite dev server.
* Model danych: Optimistic UI (zakładamy sukces operacji) + Persist Cache (np. TanStack Query zapisujący stan w localStorage).
* Strategia rozwiązywania konfliktów: Last Write Wins.
