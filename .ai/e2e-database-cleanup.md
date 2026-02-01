# E2E: sprzątanie bazy danych po testach

## Analiza architektury testów E2E

### Struktura
- **Playwright** z dwoma projektami:
  - `setup` – logowanie jako E2E_USER1, zapis stanu w `.auth/user.json`
  - `chromium-no-auth` – testy auth (bez stanu)
  - `chromium-authenticated` – testy list i list-details (z `.auth/user.json`)
- **Fixtures** (`e2e/fixtures.ts`) – rozszerzenie `test` o zbieranie logów konsoli przy niepowodzeniu.
- **Page Objects** – `AuthPage`, `ListsPage`, `ListDetailsPage` w `e2e/page-objects/`.
- **Konwencja nazw** – listy tworzone w testach mają nazwy `E2E Test <timestamp>` lub `E2E RWD <timestamp>` (unikalne per uruchomienie).

### Dane tworzone w testach
- **lists.spec.ts** – jedna lista na test „create new list”.
- **list-details.spec.ts** – w każdym `beforeEach` tworzona jest nowa lista, potem dodawane są pozycje (Mleko, Duplikat, Mobile item itd.).

### Baza (Supabase)
- Tabele: `profiles`, `lists`, `list_members`, `list_items`, `sets`, `set_members`, `set_items`, `shopping_history`.
- RLS włączone; operacje wykonywane w kontekście użytkownika (E2E_USER1).
- Kaskady: usunięcie `lists` usuwa `list_members` i `list_items`.

---

## Wdrożone rozwiązanie: globalTeardown + RPC

### 1. Funkcja w bazie
**Migracja:** `supabase/migrations/20260201120000_e2e_cleanup_function.sql`

- Funkcja `public.e2e_cleanup_test_lists()`:
  - Usuwa z `public.lists` wiersze gdzie `created_by = auth.uid()` oraz `name LIKE 'E2E Test %'` lub `name LIKE 'E2E RWD %'`.
  - Zwraca liczbę usuniętych list.
  - `security invoker` – działa w kontekście wywołującego (E2E_USER1 po zalogowaniu).
- `list_members` i `list_items` są usuwane kaskadowo.

### 2. globalTeardown Playwright
**Plik:** `e2e/globalTeardown.ts`

- Ładuje zmienne z otoczenia (już ustawione przez `playwright.config.ts` z `.env.e2e` / `.env.e2e.local`).
- Tworzy klienta Supabase z anon key (URL + publishable key).
- Loguje się jako E2E_USER1 (`signInWithPassword`).
- Wywołuje `supabase.rpc('e2e_cleanup_test_lists')`.
- Przy braku zmiennych lub błędzie logowania/RPC – tylko ostrzeżenie, bez przerywania.

### 3. Konfiguracja
- W `playwright.config.ts` ustawione jest `globalTeardown: path.join(configDir, "e2e", "globalTeardown.ts")`.
- Typ RPC dodany w `src/db/database.types.ts`: `e2e_cleanup_test_lists: { Args: Record<string, never>; Returns: number }`.

### Wymagania
- W `.env.e2e` / `.env.e2e.local`: `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `E2E_USER1_EMAIL`, `E2E_USER1_PASSWORD`.
- Migracja `20260201120000_e2e_cleanup_function.sql` zastosowana na projekcie Supabase używanym w E2E.

---

## Opcjonalne rozszerzenia

### Czyszczenie przed testami (globalSetup)
Można dodać `globalSetup`, który wywołuje ten sam RPC przed uruchomieniem testów, aby usunąć pozostałości po wcześniejszych uruchomieniach. Wystarczy w shared module wywołać logowanie + `e2e_cleanup_test_lists()` i podłączyć ten plik jako `globalSetup` w `playwright.config.ts`.

### Service role (alternatywa)
Zamiast logowania jako E2E_USER1 można użyć **Supabase Service Role Key** w Node (tylko w globalTeardown, nigdy w frontendzie):

- W `.env.e2e.local`: `SUPABASE_SERVICE_ROLE_KEY=...`
- W teardown: `createClient(url, serviceRoleKey)` i usunięcie list po `created_by = E2E_USER1_ID` (np. bezpośrednio `from('lists').delete().eq('created_by', process.env.E2E_USER1_ID).like('name', 'E2E Test %')`).

Nie wymaga to funkcji RPC, ale wymaga przechowywania i zabezpieczenia service role (np. tylko w CI secrets).

---

## Uruchomienie

```bash
cd code
npm run test:e2e
```

Po zakończeniu wszystkich testów Playwright uruchomi `globalTeardown`; w logu pojawi się np. `[e2e teardown] Cleaned N E2E test list(s) from database.` jeśli cokolwiek zostało usunięte.
