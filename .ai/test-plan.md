<analiza_projektu>
**1. Kluczowe komponenty projektu:**

*   **Authentication (Auth):** Moduł odpowiedzialny za logowanie (Email/Hasło, Google OAuth), rejestrację oraz zarządzanie sesją użytkownika. Kluczowe pliki: `AuthModeSwitch`, `EmailAuthForm`, `GoogleAuthButton`, `auth.tsx`.
*   **List Management (Listy):** Serce aplikacji. Obejmuje dashboard (`ListsGrid`, `ListCard`) oraz widok szczegółowy (`lists.$listId.tsx`). Obsługuje CRUD list oraz współdzielenie (RLS).
*   **Item Management (Produkty):** Zarządzanie pozycjami na liście. Obejmuje dodawanie (`StickyInputBar`), edycję, usuwanie, oznaczanie jako kupione (`CompletedItemsSection`) oraz sortowanie (Drag&Drop via `@dnd-kit`). Kluczowa logika: `useListDetails.ts`.
*   **Sets (Zestawy/Szablony):** Moduł szablonów zakupowych (`SetsGrid`, `SetCard`), umożliwiający tworzenie zestawów i masowe dodawanie ich do list (`AddSetToListDialog`).
*   **Database Integration & RLS:** Warstwa danych oparta na Supabase. Kluczowe są polityki bezpieczeństwa (RLS) w plikach migracji SQL (szczególnie fixy dotyczące rekurencji w `list_members`).
*   **State Management & Offline:** Wykorzystanie TanStack Query (`useQuery`, `useMutation`) z `networkMode: 'offlineFirst'` oraz `persistClient` do obsługi braku połączenia i optymistycznego UI.

**2. Specyfika stosu technologicznego i wpływ na testy:**

*   **React 19 + Vite:** Wymaga testowania komponentów z uwzględnieniem najnowszych wzorców Reacta. Szybki cykl deweloperski sprzyja testom jednostkowym.
*   **TanStack Query + Offline First:** Najbardziej krytyczny obszar. Testy muszą weryfikować nie tylko czy dane się ładują, ale co się dzieje, gdy *nie ma sieci* (optimistic updates, rollback przy błędzie, synchronizacja po powrocie online). Cache musi być poprawnie inwalidowany.
*   **Supabase (Auth + DB + Realtime):** Testy integracyjne muszą weryfikować uprawnienia (czy User A widzi listę Usera B?). Należy zwrócić uwagę na WebSockets (Realtime) – czy zmiany na jednym urządzeniu widać na drugim.
*   **TanStack Router:** Testowanie nawigacji, przekierowań (guards w `__root.tsx` i loaderach) oraz przekazywania parametrów URL (`$listId`).
*   **PWA (Mobile First):** Testy muszą być prowadzone głównie na widokach mobilnych (responsywność, touch targets, `manifest.json`, service workers).

**3. Priorytety testowe:**

1.  **Core Business Logic (Listy & Produkty):** Jeśli użytkownik nie może dodać produktu lub odhaczyć go jako kupiony, aplikacja nie działa.
2.  **Offline & Sync:** Unikalna wartość aplikacji (USP). Błędy tutaj (utrata danych przy braku sieci) są krytyczne.
3.  **Authentication & Security (RLS):** Ze względu na historię problemów z rekurencją w SQL, weryfikacja RLS jest kluczowa. Bezpieczeństwo danych użytkowników.
4.  **Sets (Zestawy):** Funkcjonalność pomocnicza, ważna, ale nie blokująca głównego flow.
5.  **History:** Funkcjonalność "read-only" (zapisywanie snapshotów).

**4. Potencjalne obszary ryzyka:**

*   **Synchronizacja danych (Conflict Resolution):** Scenariusz: User A zmienia nazwę produktu offline, User B usuwa go online. Co się stanie po synchronizacji? Obsługa konfliktów w `ItemConflictDialog`.
*   **Regresja RLS (Infinite Recursion):** W plikach SQL widać wiele poprawek (`FIX_EXISTING_LISTS.sql`, `20260130231500_fix_lists_rls.sql`). Ryzyko, że nowa zmiana w DB zablokuje dostęp do list.
*   **Wydajność na urządzeniach mobilnych:** Duże listy z Drag&Drop (`@dnd-kit`) mogą lagować na słabszych telefonach.
*   **Logowanie Google w PWA/WebView:** Częsty punkt awarii w aplikacjach mobilnych/PWA (handling redirectów).

</analiza_projektu>

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

### 3.3 Testy Manualne i Eksploracyjne (E2E & Exploratory)
*   **Cel:** Weryfikacja pełnych ścieżek użytkownika, działania PWA i scenariuszy "real-world".
*   **Kluczowe scenariusze:** Tryb samolotowy, synchronizacja między dwoma urządzeniami, instalacja PWA.

### 3.4 Testy Bezpieczeństwa Danych (RLS Verification)
*   **Cel:** Potwierdzenie, że naprawione polityki RLS działają poprawnie i nie powodują rekurencji ani wycieku danych.
*   **Metoda:** Próby dostępu do zasobów innego użytkownika bezpośrednio przez klienta API.

## 4. Scenariusze Testowe (Kluczowe Funkcjonalności)

### 4.1 Moduł Uwierzytelniania (Auth)
| ID | Scenariusz | Oczekiwany Rezultat | Priorytet |
|----|------------|---------------------|-----------|
| AUTH-01 | Rejestracja nowego użytkownika (Email/Hasło) | Utworzenie konta, wpis w `profiles`, utworzenie domyślnej listy (trigger `handle_new_user`), przekierowanie do `/lists`. | Wysoki |
| AUTH-02 | Logowanie istniejącego użytkownika | Poprawne zalogowanie, pobranie sesji, przekierowanie. | Wysoki |
| AUTH-03 | Logowanie Google OAuth | Przekierowanie do dostawcy, powrót z tokenem, poprawna sesja. | Średni |
| AUTH-04 | Próba dostępu do `/lists` bez logowania | Przekierowanie do `/auth`. | Wysoki |

### 4.2 Zarządzanie Listami (Lists)
| ID | Scenariusz | Oczekiwany Rezultat | Priorytet |
|----|------------|---------------------|-----------|
| LIST-01 | Tworzenie nowej listy | Lista pojawia się na gridzie. Twórca jest dodany do `list_members` (weryfikacja fixu SQL). | Krytyczny |
| LIST-02 | Usuwanie listy | Lista znika z widoku, usunięcie kaskadowe w DB (items, members). | Wysoki |
| LIST-03 | Udostępnianie listy (Share) | Użytkownik B widzi listę udostępnioną przez Użytkownika A po dodaniu emaila. | Wysoki |
| LIST-04 | Archiwizacja listy (Koniec zakupów) | Wywołanie RPC `archive_list_items`, produkty znikają z listy aktywnej, wpis w `history`. | Średni |

### 4.3 Produkty i Synchronizacja (Items & Sync)
| ID | Scenariusz | Oczekiwany Rezultat | Priorytet |
|----|------------|---------------------|-----------|
| ITEM-01 | Dodanie produktu (Online) | Produkt widoczny natychmiast. UUID tymczasowe podmienione na stałe. | Wysoki |
| ITEM-02 | Dodanie produktu (Offline) | Produkt widoczny (zmniejszona przezroczystość/ikona sync). Po powrocie online – synchronizacja z DB. | Krytyczny |
| ITEM-03 | Wykrycie duplikatu nazwy | Wyświetlenie `ItemConflictDialog`. Po potwierdzeniu – aktualizacja ilości zamiast dodania nowego wiersza. | Średni |
| ITEM-04 | Zmiana stanu (Kupione/Niekupione) | Przeniesienie między sekcjami `ActiveItemsList` a `CompletedItemsSection`. | Wysoki |
| ITEM-05 | Sortowanie (Drag & Drop) | Zmiana kolejności wizualnej i aktualizacja `sort_order` w bazie. | Średni |

### 4.4 Zestawy (Sets)
| ID | Scenariusz | Oczekiwany Rezultat | Priorytet |
|----|------------|---------------------|-----------|
| SET-01 | Tworzenie zestawu z istniejącej listy | Nowy zestaw zawiera kopie produktów z listy. | Średni |
| SET-02 | Dodanie zestawu do listy | Produkty z zestawu dodane do listy. Konflikty nazw rozwiązane przez modal. | Średni |

## 5. Środowisko Testowe

*   **Lokalne (Dev):** `npm run dev` (localhost:3000) połączone z instancją Supabase (staging/dev).
*   **Urządzenia:**
    *   Desktop (Chrome DevTools - emulacja mobile).
    *   Fizyczne urządzenie Android (Chrome).
    *   Fizyczne urządzenie iOS (Safari).
*   **Baza Danych:** Instancja Supabase z zaaplikowanymi migracjami (w szczególności `APPLY_FIX_COMPLETE.sql`).

## 6. Narzędzia

*   **Zarządzanie testami:** (np. Jira / GitHub Issues).
*   **Automatyzacja:** Vitest (Unit/Integration), React Testing Library.
*   **Linting/Static Analysis:** Biome (`npm run lint`, `npm run check`).
*   **API Testing:** Postman lub Supabase Dashboard (do weryfikacji RLS i RPC).

## 7. Procedura Weryfikacji Poprawek Bazy Danych (SQL Fixes)

Ze względu na krytyczne błędy rekurencji w RLS wykryte w analizie projektu (`code/supabase/migrations/`), przed rozpoczęciem testów funkcjonalnych należy wykonać **Testy Dymne Bazy Danych**:

1.  **Weryfikacja tabeli `list_members`:**
    *   Próba dodania nowego członka do listy jako właściciel.
    *   Próba odczytu członków listy.
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
*   Wszystkie testy ścieżki krytycznej (Critical Path) zakończone sukcesem.
*   Scenariusze offline zweryfikowane pozytywnie na co najmniej jednym urządzeniu mobilnym.

## 9. Raportowanie Błędów

Zgłoszenia błędów powinny zawierać:
1.  **Tytuł:** Krótki opis problemu.
2.  **Środowisko:** (np. Android 13, Chrome, Offline mode).
3.  **Kroki do reprodukcji:** Dokładna sekwencja działań.
4.  **Oczekiwany vs Rzeczywisty rezultat.**
5.  **Logi:** Zrzut z konsoli deweloperskiej lub DevTools TanStack Query (jeśli dotyczy stanu).
6.  **Status RLS:** Czy błąd może wynikać z uprawnień w bazie?

---
*Plan przygotowany w oparciu o analizę plików projektu QuickShop, w tym struktury katalogów, konfiguracji TanStack Query oraz migracji Supabase.*
</plan_testów>