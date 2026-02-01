# Plan implementacji testów e2e (Playwright) – QuickShop

## 1. Zakres i narzędzia

- **Framework:** Playwright (uruchomienie w przeglądarce).
- **Przeglądarka:** tylko Chromium (zgodnie z regułami projektu).
- **Struktura:** Page Object Model w `./e2e/page-objects`, testy w `./e2e` (np. `./e2e/auth.spec.ts`).
- **Selektory:** `data-testid` + `page.getByTestId('selectorName')`; przy wprowadzaniu nowych elementów dodawać `data-testid`.

---

## 2. Paczki npm do dodania

Do `package.json` w `code/` dodać:

| Paczka | Typ | Cel |
|--------|-----|-----|
| `@playwright/test` | devDependency | Uruchomienie testów e2e, asercje, konfiguracja |
| `dotenv` | devDependency | Ładowanie `.env.e2e` / `.env.e2e.local` w `playwright.config.ts` |

Instalacja:

```bash
cd code && npm install -D @playwright/test dotenv
npx playwright install chromium
```

(Opcjonalnie: tylko Chromium, bez pełnego `playwright install` – zależnie od CI.)

---

## 3. Konfiguracja

### 3.1 Plik env dla e2e

- **Ścieżka:** `code/.env.e2e` lub `code/.env.e2e.local` (local w `.gitignore`).
- **Zawartość (min.):** `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` (dla aplikacji); dla Playwright np. `BASE_URL`, ewentualnie dane użytkowników testowych (E2E_USER1_EMAIL, E2E_USER1_PASSWORD itd. – do późniejszych testów logowania).

Wczytywanie w konfiguracji Playwright (przed użyciem zmiennych):

```ts
// code/playwright.config.ts
import path from 'node:path';
import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(process.cwd(), '.env.e2e.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.e2e') });
```

Kolejność: najpierw `.env.e2e.local`, potem `.env.e2e`, żeby local mógł nadpisać.

### 3.2 playwright.config.ts (szkic)

- **baseURL:** z `process.env.BASE_URL` lub stała np. `http://localhost:3000`.
- **Projekty:** jeden projekt – Chromium (desktop).
- **Timeouty:** np. `expect` 10s, `timeout` testu 30s (dostosować do potrzeb).
- **Retries:** np. 0 lokalnie, 1–2 w CI.
- **Report:** np. `html`, opcjonalnie `trace: 'on-first-retry'` do debugowania.
- **webServer:** `npm run dev:e2e` (lub `npm run dev`) na porcie 3000, żeby testy miały działającą aplikację z env e2e.

Przykład (fragment):

```ts
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: process.env.BASE_URL ?? 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'npm run dev:e2e',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

---

## 4. Page Object Model

- **Katalog:** `code/e2e/page-objects/`.
- **Konwencja:** jedna strona/widok = jeden plik (np. `AuthPage.ts`).
- Metody: nawigacja, wypełnianie formularzy, asercje na stanie strony.
- Selektory: w pierwszej kolejności `getByTestId(...)`; jeśli brak `data-testid` – role/label jako fallback, z planem dodania `data-testid` w kolejnym kroku.

---

## 5. Pierwszy test: wejście na ekran logowania (bez logowania)

**Cel:** Upewnić się, że aplikacja uruchamia się i użytkownik (niezalogowany) trafia na ekran logowania.

**Kroki:**

1. **Arrange:** Aplikacja działa (webServer w config), brak zalogowanej sesji (czysty kontekst przeglądarki).
2. **Act:** Otwarcie `baseURL/` (lub bezpośrednio `baseURL/auth`). Router w aplikacji przekierowuje niezalogowanych na `/auth`.
3. **Assert:** Na stronie widać ekran logowania:
   - nagłówek „QuickShop” (lub odpowiedni tekst z PRD),
   - formularz logowania (np. e-mail, hasło),
   - opcjonalnie przycisk „Zaloguj z Google”.

**Selektory:** Aby test był odporny na zmiany layoutu, w widoku auth dodać `data-testid` (np. na Card lub kontenerze ekranu logowania oraz na formularzu). W teście użyć `getByTestId('auth-page')` i e.g. `getByRole('heading', { name: /QuickShop/i })` lub `getByTestId('auth-email-form')` po dodaniu atrybutów.

**Sugerowane data-testid do dodania w kodzie aplikacji:**

- W `src/routes/auth.tsx`: na zewnętrznym `div` lub `Card` – `data-testid="auth-page"`.
- Na formularzu e-mail (np. w `EmailAuthForm`) – `data-testid="auth-email-form"` (opcjonalnie).

**Przykład testu (po dodaniu testid):**

```ts
// code/e2e/auth.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Auth screen', () => {
  test('opens app on login screen without logging in', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('auth-page')).toBeVisible();
    await expect(page.getByRole('heading', { name: /QuickShop/i })).toBeVisible();
  });
});
```

Jeśli nie chcemy na razie dodawać `data-testid`, pierwszy test może opierać się na `getByRole('heading', { name: /QuickShop/i })` i np. `getByRole('button', { name: /Zaloguj/i })` – z dopisaniem w planie, że docelowo warto dodać `data-testid` dla stabilności.

---

## 6. Kolejne kroki (po pierwszym teście)

1. **Logowanie e-mail (US-001):** test wypełnienia formularza danymi z `.env.e2e` i sprawdzenia przekierowania na `/lists`.
2. **Page Object dla Auth:** wydzielenie klasy `AuthPage` w `e2e/page-objects/AuthPage.ts` z metodami typu `gotoAuth()`, `expectLoginScreenVisible()`, `loginWithEmail(email, password)`.
3. **Testy list, zestawów, historii:** według PRD i reguł (Arrange–Act–Assert, izolacja kontekstu, opcjonalnie API do setupu danych).
4. **Hooki:** `beforeEach`/`afterEach` np. do czyszczenia storage lub wylogowania, żeby testy były izolowane.
5. **Trace / screenshot:** włączenie przy retry i w CI zgodnie z regułami projektu.

---

## 7. Podsumowanie

| Element | Decyzja |
|---------|---------|
| Paczki | `@playwright/test`, `dotenv` |
| Przeglądarka | Chromium |
| Env | `.env.e2e.local` / `.env.e2e` ładowane w `playwright.config.ts` przez `dotenv` |
| Pierwszy test | Wejście na aplikację → ekran logowania widoczny, bez wykonywania logowania |
| Selektory | `data-testid` w nowych elementach; w pierwszym teście role/tekst lub testid po dodaniu w auth |
| Struktura | `e2e/` + `e2e/page-objects/` |

Po wdrożeniu tego planu pierwszy test weryfikuje uruchomienie aplikacji i wyświetlenie ekranu logowania; kolejne testy (w tym logowanie) można dodawać zgodnie z powyższymi krokami.
