<plan_testów>

# Plan Testów Projektu QuickShop

## 1. Wprowadzenie
Niniejszy dokument stanowi kompleksowy plan testów dla aplikacji QuickShop – mobilnej aplikacji typu PWA służącej do zarządzania listami zakupów. Celem procesu testowego jest zapewnienie stabilności kluczowych funkcji biznesowych, poprawności synchronizacji danych w czasie rzeczywistym oraz niezawodności działania w trybie offline (Offline-First).

## 2. Zakres Testów

### 2.1 Elementy podlegające testom (In-Scope)
*   **Funkcjonalności frontendowe:** Tworzenie/edycja list, zarządzanie produktami, obsługa zestawów (Sets), historia zakupów.
*   **Logika biznesowa:** Obsługa duplikatów, sortowanie, przeliczanie statusu listy.
*   **Integracja z Supabase:** Uwierzytelnianie, operacje CRUD, Row Level Security (RLS).
*   **Zachowanie Offline/Online:** Optymistyczne aktualizacje UI, synchronizacja po odzyskaniu połączenia.
*   **Responsywność:** Działanie na urządzeniach mobilnych (Mobile First).

### 2.2 Elementy wyłączone z testów (Out-Scope)
*   Testy wydajnościowe infrastruktury Supabase (polegamy na SLA dostawcy).
*   Zaawansowane testy penetracyjne (poza weryfikacją RLS).
*   Funkcjonalności spoza MVP (skanowanie kodów kreskowych, integracja z przepisami).

## 3. Strategia i Typy Testów

### 3.1 Testy Jednostkowe (Unit Tests)
*   **Cel:** Weryfikacja izolowanej logiki biznesowej i serwisów.
*   **Pokrycie:**
    *   Serwisy: `items.service.ts`, `lists.service.ts`, `sets.service.ts`.
    *   Hooki: `useListDetails` (logika stanowa), `useListsView`.
    *   Utils: Funkcje pomocnicze w `lib/utils.ts`.
*   **Narzędzia:** Vitest.

### 3.2 Testy Integracyjne (Integration Tests)
*   **Cel:** Weryfikacja współpracy komponentów React z TanStack Query i Routerem.
*   **Obszary:**
    *   Formularze uwierzytelniania (`EmailAuthForm`).
    *   Interakcje na liście zakupów (`ActiveItemsList` + `useListDetails`).
    *   Dialogi i Modale (`ItemConflictDialog`, `CreateListDialog`).
*   **Narzędzia:** Vitest + React Testing Library.

### 3.3 Testy Automatyczne E2E (End-to-End z Playwright)
*   **Cel:** Symulacja pełnych ścieżek użytkownika w rzeczywistej przeglądarce, ze szczególnym naciskiem na scenariusze mobilne i offline.
*   **Konfiguracja:**
    *   Testy uruchamiane na silnikach Chromium (Android emulation) oraz WebKit (iOS emulation).
    *   Wykorzystanie `globalSetup` do jednorazowego logowania i zapisania stanu sesji (Storage State), aby uniknąć logowania w każdym teście.
    *   Izolacja danych: Testy powinny operować na dedykowanym koncie testowym lub czyścić dane po wykonaniu (`test.afterEach`).
*   **Kluczowe możliwości Playwright wykorzystywane w projekcie:**
    *   **Emulacja sieci:** Testowanie zachowania UI przy `context.setOffline(true)` (weryfikacja `networkMode: 'offlineFirst'` w TanStack Query).
    *   **Emulacja mobilna:** Weryfikacja czy `StickyInputBar` nie jest przesłaniany przez klawiaturę systemową i czy `BottomNav` działa poprawnie na małych ekranach.
    *   **Drag & Drop:** Automatyzacja testów sortowania elementów na liście.

### 3.4 Testy Manualne i Eksploracyjne
*   **Cel:** Weryfikacja "look & feel" aplikacji PWA, instalacja na fizycznym urządzeniu, testy użyteczności.

### 3.5 Testy Bezpieczeństwa Danych (RLS Verification)
*   **Cel:** Potwierdzenie, że naprawione polityki RLS działają poprawnie i nie powodują rekurencji ani wycieku danych (dostęp bezpośredni do API).

## 4. Scenariusze Testowe (Kluczowe Funkcjonalności)

### 4.1 Moduł Uwierzytelniania (Auth)
| ID | Typ | Scenariusz | Oczekiwany Rezultat | Priorytet |
|----|---|------------|---------------------|-----------|
| AUTH-01 | E2E | Pełny proces rejestracji i onboardingu | Użytkownik rejestruje się, widzi ekran powitalny/listę domyślną. | Wysoki |
| AUTH-02 | E2E | Logowanie poprawnymi danymi | Przekierowanie do `/lists`, brak błędów w konsoli. | Wysoki |
| AUTH-03 | E2E | Walidacja formularza logowania | Wyświetlenie komunikatów błędów przy pustych polach lub złym formacie email. | Średni |

### 4.2 Zarządzanie Listami (Lists)
| ID | Typ | Scenariusz | Oczekiwany Rezultat | Priorytet |
|----|---|------------|---------------------|-----------|
| LIST-01 | E2E | Utworzenie nowej listy (Smoke Test) | Kliknięcie "Nowa lista" -> wpisanie nazwy -> lista widoczna na gridzie. | Krytyczny |
| LIST-02 | E2E | Usunięcie listy | Użytkownik usuwa listę -> potwierdza w dialogu -> lista znika. | Wysoki |
| LIST-03 | Manual | Udostępnianie listy (Share) | Użytkownik B widzi listę udostępnioną przez Użytkownika A. | Wysoki |

### 4.3 Produkty i Synchronizacja (Items & Sync) - Fokus na Playwright
| ID | Typ | Scenariusz | Oczekiwany Rezultat | Priorytet |
|----|---|------------|---------------------|-----------|
| ITEM-01 | E2E | CRUD Produktu (Create, Read, Update, Delete) | Dodanie produktu, edycja nazwy, usunięcie. Stan UI zgodny z oczekiwaniami. | Krytyczny |
| ITEM-02 | E2E | **Symulacja Offline (Network Interception)** | 1. Wyłącz sieć (`context.setOffline(true)`).<br>2. Dodaj produkt.<br>3. Sprawdź, czy produkt jest widoczny (Optimistic UI).<br>4. Włącz sieć.<br>5. Sprawdź, czy request do Supabase przeszedł pomyślnie. | Krytyczny |
| ITEM-03 | E2E | Obsługa konfliktów (Dialog) | Próba dodania produktu o istniejącej nazwie -> weryfikacja czy `ItemConflictDialog` jest widoczny. | Średni |
| ITEM-04 | E2E | Oznaczanie jako kupione | Kliknięcie w checkbox -> weryfikacja przeniesienia elementu do sekcji "Kupione" (sprawdzenie selektorów CSS). | Wysoki |
| ITEM-05 | E2E | Sortowanie (Drag & Drop) | Przeciągnięcie elementu A nad element B -> weryfikacja zmiany kolejności w DOM. | Średni |

### 4.4 Responsywność (Mobile Viewports)
| ID | Typ | Scenariusz | Oczekiwany Rezultat | Priorytet |
|----|---|------------|---------------------|-----------|
| RWD-01 | E2E | Widoczność StickyInputBar na mobile | Weryfikacja czy input dodawania jest widoczny i klikalny w emulacji iPhone 12/Pixel 5. | Wysoki |
| RWD-02 | E2E | Nawigacja BottomNav | Przejście między zakładkami Listy/Zestawy/Historia na widoku mobilnym. | Średni |

## 5. Środowisko Testowe

*   **Lokalne (Dev):** `npm run dev` (localhost:3000) połączone z instancją Supabase (staging/dev).
*   **CI/CD (GitHub Actions):** Automatyczne uruchamianie testów Playwright (headless) przy każdym Pull Request.
*   **Baza Danych:** Instancja Supabase z zaaplikowanymi migracjami.

## 6. Narzędzia

*   **Framework E2E:** Playwright.
*   **Framework Unit/Integration:** Vitest + React Testing Library.
*   **Zarządzanie testami:** (np. Jira / GitHub Issues).
*   **Linting/Static Analysis:** Biome (`npm run lint`, `npm run check`).
*   **API Testing:** Postman lub Supabase Dashboard (do weryfikacji RLS i RPC).

## 7. Procedura Weryfikacji Poprawek Bazy Danych (SQL Fixes)

Ze względu na krytyczne błędy rekurencji w RLS wykryte w analizie projektu, przed rozpoczęciem testów funkcjonalnych należy wykonać **Testy Dymne Bazy Danych**:

1.  **Weryfikacja tabeli `list_members`:**
    *   Próba dodania nowego członka do listy jako właściciel.
    *   *Cel:* Upewnienie się, że błąd `infinite recursion detected` nie występuje.
2.  **Weryfikacja tabeli `lists`:**
    *   Stworzenie listy i natychmiastowe pobranie jej z API.
    *   *Cel:* Weryfikacja, czy `created_by` poprawnie steruje polityką dostępu bez odpytywania `list_members`.

## 8. Kryteria Akceptacji (Entry/Exit Criteria)

**Kryteria wejścia (Start testów):**
*   Kod kompiluje się bez błędów (`npm run build`).
*   Migracje bazy danych zostały zaaplikowane.
*   Aplikacja uruchamia się lokalnie.

**Kryteria wyjścia (Zakończenie fazy):**
*   Brak błędów krytycznych (Blocker/Critical).
*   Wszystkie testy E2E dla ścieżki krytycznej (Login -> Lista -> Produkt) przechodzą na zielono (Pass).
*   Scenariusze offline zweryfikowane pozytywnie.

## 9. Raportowanie Błędów

Zgłoszenia błędów powinny zawierać:
1.  **Tytuł:** Krótki opis problemu.
2.  **Środowisko:** (np. Playwright WebKit, Android 13).
3.  **Trace/Video:** W przypadku testów Playwright – załączony plik trace.zip lub nagranie wideo z nieudanego testu.
4.  **Kroki do reprodukcji.**
5.  **Logi:** Zrzut z konsoli.

</plan_testów>