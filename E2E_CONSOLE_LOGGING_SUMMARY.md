# Przechwytywanie Logów Konsoli w Testach E2E - Podsumowanie

## 🎯 Zaimplementowane Funkcje

### 1. Automatyczne Przechwytywanie Logów Konsoli

**Plik:** `code/e2e/helpers/console-logger.ts`

Nowy helper zawierający:

- **`setupConsoleLogger(page, options?)`** - Automatyczne przechwytywanie i wyświetlanie logów z konsoli przeglądarki w terminalu Node.js
  - Filtrowanie po kategoriach (np. `[useListDetails]`, `[ListsService]`)
  - Kolorowanie wyjścia (czerwony=error, żółty=warning, cyan=info)
  - Emoji dla szybkiej identyfikacji typu wiadomości
  - Automatyczne przechwytywanie błędów strony (`pageerror`)

- **`collectConsoleLogs(page, categories?)`** - Zbieranie logów do tablicy dla asercji w testach

- **`DEBUG_LOG_CATEGORIES`** - Predefiniowana lista kategorii logów do przechwycenia

**Funkcje:**
- ✅ Kolorowe wyjście w terminalu
- ✅ Emoji dla typów wiadomości (❌ error, ⚠️ warning, ℹ️ info, 📝 log)
- ✅ Filtrowanie po kategoriach
- ✅ Informacje o lokalizacji (plik:linia)
- ✅ Tryb verbose (wszystkie wiadomości)
- ✅ Przechwytywanie błędów strony

### 2. Globalne Fixture dla Testów

**Plik:** `code/e2e/fixtures.ts`

Rozszerzone fixture Playwright, które automatycznie:
- Dodaje `setupConsoleLogger` do każdego testu
- Przechwytuje logi z predefiniowanych kategorii
- Nie wymaga ręcznej konfiguracji w każdym teście

**Użycie:**
```typescript
import { test, expect } from "./fixtures";  // Zamiast z "@playwright/test"
```

### 3. Zatrzymanie na Pierwszym Błędzie

**Zmiany w konfiguracji:**

#### `playwright.config.ts`
- Dodano `maxFailures` z obsługą zmiennej środowiskowej `MAX_FAILURES`
- Umożliwia zatrzymanie testów po określonej liczbie niepowodzeń

#### `package.json`
Nowy skrypt:
```json
"test:e2e:debug": "playwright test --headed --max-failures=1"
```

**Uruchomienie:**
```bash
npm run test:e2e:debug
```

**Uwaga:** Flaga `--max-failures=1` jest przekazywana bezpośrednio do Playwright, co działa na wszystkich systemach operacyjnych (Windows, Linux, Mac).

Korzyści:
- ✅ Testy zatrzymują się po pierwszym błędzie
- ✅ Przeglądarka pozostaje otwarta (tryb headed)
- ✅ Logi konsoli widoczne w terminalu
- ✅ Możliwość inspekcji stanu przeglądarki

### 4. Aktualizacja Wszystkich Testów

Zaktualizowano importy w:
- `e2e/auth.spec.ts`
- `e2e/auth.setup.ts`
- `e2e/lists.spec.ts`
- `e2e/list-details.spec.ts`

Wszystkie teraz używają:
```typescript
import { test, expect } from "./fixtures";
```

Zamiast:
```typescript
import { test, expect } from "@playwright/test";
```

### 5. Dokumentacja

Zaktualizowano:
- **`HOW_TO_VIEW_DEBUG_LOGS.md`** - Kompletny przewodnik z przykładami
- **`e2e/helpers/README.md`** - Dokumentacja helperów

## 📊 Format Logów

### Wyjście w Terminalu

```
📝 [LOG] [useListsView] 🔵 listsQuery START | Timestamp: 2026-02-01T...
📝 [LOG] [ListsService] 🔵 getAllLists START | Timestamp: 2026-02-01T...
✅ [LOG] [ListsService] ✅ getAllLists SUCCESS | Count: 3 | Lists: Test1, Test2, Test3
📊 [LOG] [useListsView] 📊 Lists state changed | Count: 3 | Timestamp: ...
```

### Kolory

- 🔴 **Czerwony** - Błędy (errors)
- 🟡 **Żółty** - Ostrzeżenia (warnings)
- 🔵 **Niebieski** - Informacje (info)
- ⚪ **Biały** - Zwykłe logi

### Emoji

- 🔵 START - Rozpoczęcie operacji
- ✅ SUCCESS - Sukces
- ❌ ERROR - Błąd
- ⏸️ PAUSE - Wstrzymanie zapytania
- ✨ OPTIMISTIC - Aktualizacja optymistyczna
- 🔄 INVALIDATE - Unieważnienie cache
- 🚀 MUTATION - Wykonanie mutacji
- 📊 STATE - Zmiana stanu

## 🚀 Użycie

### Podstawowe

```bash
# Wszystkie testy z logami
npm run test:e2e

# Z widoczną przeglądarką
npm run test:e2e:headed

# Zatrzymaj na pierwszym błędzie (debugowanie)
npm run test:e2e:debug

# Tryb UI (interaktywny)
npm run test:e2e:ui
```

### W Testach

#### Automatyczne (domyślne)
```typescript
import { test } from "./fixtures";

test("mój test", async ({ page }) => {
  // Logi są automatycznie przechwytywane!
  await page.goto("/lists");
});
```

#### Własne Kategorie
```typescript
import { test } from "./fixtures";
import { setupConsoleLogger } from "./helpers/console-logger";

test("custom logging", async ({ page }) => {
  // Nadpisanie domyślnych ustawień
  setupConsoleLogger(page, {
    categories: ["[useListDetails]"],  // Tylko ta kategoria
    verbose: true,                      // Wszystkie typy wiadomości
  });
  
  await page.goto("/lists");
});
```

#### Zbieranie do Asercji
```typescript
import { test } from "./fixtures";
import { collectConsoleLogs } from "./helpers/console-logger";

test("verify logs", async ({ page }) => {
  const logs = collectConsoleLogs(page, ["[useListDetails]"]);
  
  await listPage.addItem("Mleko");
  
  // Asercje na logach
  expect(logs.some(log => log.includes("CREATE onMutate"))).toBeTruthy();
  expect(logs.some(log => log.includes("CREATE onSuccess"))).toBeTruthy();
});
```

## 🔍 Debugowanie

### Zatrzymaj na Pierwszym Błędzie

```bash
npm run test:e2e:debug
```

To:
1. Uruchamia testy z widoczną przeglądarką
2. Zatrzymuje się po pierwszym błędzie
3. Zostawia przeglądarkę otwartą
4. Wyświetla wszystkie logi w terminalu

### Analiza Problemów Czasowych

Gdy test się nie powiedzie (np. lista niewidoczna), sprawdź sekwencję logów:

```
[ListsService] 🔵 createList START
[ListsService] ✅ createList SUCCESS | ListId: xyz
[useListsView] ✅ createList onSuccess
[MutationCache] 🔄 Invalidating queries
[useListsView] 🔵 listsQuery START
[ListsService] ✅ getAllLists SUCCESS | Count: 3
[useListsView] 📊 Lists state changed | Count: 3
```

**Porównaj timestampy:**
```
| Timestamp: 2026-02-01T21:45:30.123Z  <- Create
| Timestamp: 2026-02-01T21:45:30.125Z  <- Query (tylko 2ms później!)
```

Jeśli zapytanie następuje zbyt szybko po utworzeniu, baza danych mogła nie zdążyć zakończyć transakcji.

## 📝 Przykłady

### Przykład 1: Debug Tworzenia Listy

```bash
npm run test:e2e:debug
```

Terminal pokaże:
```
📝 [LOG] [useListsView] 🚀 createList mutationFn called | Name: E2E Test 20260201...
📝 [LOG] [ListsService] 🔵 createList START | Name: E2E Test 20260201...
📝 [LOG] [ListsService] ✅ List created | ListId: abc-123 | Name: E2E Test...
📝 [LOG] [ListsService] 🔵 Adding creator as member | ListId: abc-123
📝 [LOG] [ListsService] ✅ createList SUCCESS | ListId: abc-123
```

### Przykład 2: Debug Dodawania Produktu

```typescript
test("add item with logging", async ({ page }) => {
  const logs = collectConsoleLogs(page);
  
  await listPage.addItem("Mleko");
  
  // Sprawdź czy wszystkie kroki się wykonały
  const hasOptimistic = logs.some(l => l.includes("Optimistic update applied"));
  const hasSuccess = logs.some(l => l.includes("CREATE onSuccess"));
  const hasRefetch = logs.some(l => l.includes("list-items query START"));
  
  expect(hasOptimistic).toBeTruthy();
  expect(hasSuccess).toBeTruthy();
  expect(hasRefetch).toBeTruthy();
});
```

## ✅ Korzyści

1. **Natychmiastowa Widoczność** - Logi z przeglądarki natychmiast w terminalu
2. **Łatwe Debugowanie** - Kolorowanie i emoji ułatwiają skanowanie
3. **Zatrzymanie na Błędzie** - Oszczędność czasu przy debugowaniu
4. **Automatyczne** - Działa bez dodatkowej konfiguracji
5. **Elastyczne** - Można dostosować do potrzeb
6. **Asercje** - Możliwość weryfikacji logów w testach

## 🔧 Konfiguracja

### Zmiana Kategorii Globalnie

Edytuj `e2e/fixtures.ts`:

```typescript
setupConsoleLogger(page, {
  categories: ["[useListDetails]", "[MojaKategoria]"],
  captureAll: false,
  verbose: false,
});
```

### Wyłączenie Logowania

Jeśli z jakiegoś powodu chcesz wyłączyć logowanie:

```typescript
import { test } from "@playwright/test";  // Zamiast z "./fixtures"
```

## 📚 Dokumentacja

- **`HOW_TO_VIEW_DEBUG_LOGS.md`** - Kompletny przewodnik
- **`DEBUG_LOGS_GUIDE.md`** - Struktura logów i wzorce
- **`e2e/helpers/README.md`** - Dokumentacja helperów
- **`e2e/helpers/console-logger.ts`** - Kod źródłowy

## 🎉 Podsumowanie

Testy E2E mają teraz:
- ✅ Automatyczne przechwytywanie logów z konsoli przeglądarki
- ✅ Kolorowe i czytelne wyjście w terminalu
- ✅ Możliwość zatrzymania na pierwszym błędzie
- ✅ Kompletną dokumentację
- ✅ Zero dodatkowej konfiguracji w większości przypadków

Uruchom:
```bash
npm run test:e2e:debug
```

I zacznij debugować! 🚀
