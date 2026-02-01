# Plan realizacji: testy e2e w pipeline produkcyjnym

## 1. Cel

- Uruchamiać testy e2e **przed** wdrożeniem na produkcję.
- Używać środowiska GitHub **TestsE2E** (już utworzone).
- Dostarczać zmienne jak przy uruchomieniu lokalnym z `code/.env.e2e` (bez commitu pliku na repo).

## 2. Czy testy e2e można uruchomić równolegle z buildem i testami jednostkowymi?

**Tak.** Rekomendowany układ:

| Faza | Zadania | Równolegle? |
|------|---------|-------------|
| 1 | `lint-and-test` (lint + testy jednostkowe) | — |
| 2 | `build` i **`e2e`** | Tak – oba po `lint-and-test` |
| 3 | `deploy` | Po zakończeniu **obu**: `build` i `e2e` |

**Uzasadnienie:**

- E2e **nie zależą** od artefaktu builda: uruchamiają dev server (`npm run dev:e2e`) i testują w przeglądarce.
- Build **nie zależy** od e2e: produkuje `dist` pod deploy.
- Deploy powinien ruszyć tylko gdy **build** i **e2e** są zielone, więc `deploy` ma `needs: [build, e2e]`.

Dzięki temu e2e i build działają równolegle po przejściu lintu i testów jednostkowych, bez wydłużania całkowitego czasu pipeline’u.

## 3. Zmienne jak z `code/.env.e2e`

Lokalnie Playwright ładuje `code/.env.e2e` (i opcjonalnie `.env.e2e.local`) przez `dotenv`. W CI plik z danymi nie powinien być w repo.

**Podejście:** W środowisku GitHub **TestsE2E** ustawiasz **Environment variables** (i ewentualnie secrets) o tych samych nazwach co w `.env.e2e`:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `BASE_URL` (np. `http://localhost:3000` dla webServer)
- Opcjonalnie: `E2E_USER1_EMAIL`, `E2E_USER1_PASSWORD`, `E2E_USER2_*` itd. (dla przyszłych testów logowania)

W jobie e2e przekazujesz te zmienne przez `env:` (z `vars.*` / `secrets.*`). Playwright i Vite (dev server) widzą je w `process.env` – zachowanie jak przy ładowaniu z `code/.env.e2e` lokalnie, bez fizycznego pliku w repozytorium.

## 4. Wymagane zmienne w środowisku TestsE2E (GitHub)

W **Settings → Environments → TestsE2E → Environment variables** ustaw (nazwy jak w `code/.env.e2e`):

| Zmienna | Opis |
|---------|------|
| `VITE_SUPABASE_URL` | URL projektu Supabase (dla dev servera i testów) |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Klucz publiczny Supabase |
| `BASE_URL` | Opcjonalnie; domyślnie w CI używane jest `http://localhost:3000` |

Opcjonalnie (dla przyszłych testów logowania): `E2E_USER1_EMAIL`, `E2E_USER1_PASSWORD`, `E2E_USER2_*` – hasła lepiej w **Secrets**.

## 5. Uproszczony plan realizacji

1. **Środowisko TestsE2E w GitHub**
   - Dodać zmienne (i ewentualnie secrets) jak wyżej – odpowiednik `code/.env.e2e` bez commitu pliku.

2. **Nowy job `e2e` w `production.yml`**
   - `environment: TestsE2E`.
   - `needs: [lint-and-test]` (tak jak `build`).
   - Kroki: checkout, setup Node/npm (np. istniejąca akcja), `npm ci`, instalacja przeglądarki Chromium (`npx playwright install chromium`), uruchomienie `npx playwright test`.
   - W jobie ustawić `env:` z zmiennymi ze środowiska TestsE2E (np. `VITE_SUPABASE_URL: ${{ vars.VITE_SUPABASE_URL }}` itd.), żeby „ładować” te same zmienne co z `code/.env.e2e` lokalnie.

3. **Job `deploy`**
   - Zmienić `needs: [build]` na `needs: [build, e2e]`, żeby deploy szedł dopiero po udanym buildzie i e2e.

4. **Opcje**
   - Zapis raportu Playwright (`playwright-report`) jako artefakt przy failure (zrobione w workflow).
   - W jobie e2e ustawić `CI=true`, żeby konfiguracja Playwright (retries, workers) była jak w CI (zrobione).

## 6. Kolejność i zależności (podsumowanie)

```
lint-and-test
    ├── build   ──┐
    │             ├── deploy
    └── e2e    ───┘
```

- **Równolegle:** build i e2e.
- **Przed wdrożeniem:** muszą przejść lint, testy jednostkowe, build i testy e2e.
