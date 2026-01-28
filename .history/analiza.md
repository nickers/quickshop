# Dokument Wymagań Projektowych (PRD) – QuickShop (MVP)

## 1. Przegląd Projektu
*   **Nazwa produktu:** QuickShop
*   **Typ aplikacji:** Progressive Web App (PWA) – Mobile First.
*   **Główny cel:** Ułatwienie planowania zakupów i eliminacja problemu zapominania o produktach stałych (np. śniadaniowych) poprzez wykorzystanie szablonów (zestawów).
*   **Branding:** Minimalistyczne logo oparte na ikonie koszyka.

## 2. Architektura i Technologia
* **Frontend:** React + Vite.
* **Stylizacja:** Tailwind CSS + Material Design components.
* **Backend (BaaS):** **Supabase**.
* **Realtime:** Wykorzystanie mechanizmu PostgreSQL Change Data Capture (CDC) do streamowania zmian w listach przez WebSockets.
* **Auth:** Supabase Auth (Email/Hasło + Google OAuth).
* **Storage:** (Opcjonalnie w przyszłości) dla zdjęć produktów.
* **Model danych:** Local-first (z wykorzystaniem np. `React Query` dla cache lub `Zustand` z persystencją) + synchronizacja z Supabase.
*   **Rozwiązywanie konfliktów:** Strategia **"Last Write Wins"** (ostatnia zmiana nadpisuje) na poziomie pojedynczego produktu.
*   **Język:** Interfejs w języku polskim (MVP), ale kod przygotowany pod i18n (np. biblioteka `i18next`).

## 3. Uwierzytelnianie i Użytkownicy
*   **Logowanie:** Email/Hasło oraz Google Auth.
*   **Onboarding:** Po założeniu konta tworzona jest automatycznie "Pierwsza lista" z jedną pozycją ("mleko").
*   **Usuwanie konta:** W MVP brak automatycznej opcji w UI – wymagana interwencja administratora. Usunięcie użytkownika nie usuwa list współdzielonych (jedynie anonimizuje wpisy tego użytkownika).

## 4. Główne Funkcjonalności

### A. Zarządzanie Listami Zakupów (Zakładka 1)
*   **Atrybuty produktu:** Nazwa (wymagane, łączenie duplikatów ignoruje wielkość liter), Ilość/Notatka (opcjonalne).
*   **Obsługa duplikatów:** Produkty o tej samej nazwie są wyświetlane jako jedna pozycja z adnotacją/wyróżnieniem. Decyzja o sumowaniu ilości należy do użytkownika. Brak opcji automatycznego "rozdzielania".
*   **Interakcje:**
    *   **Kupione:** Checkbox lub Swipe przenosi produkt na dół do sekcji "Kupione" (lub go wyszarza).
    *   **Sortowanie:** Drag-and-drop (ręczne ustalanie kolejności).
    *   **Szukanie:** Pasek wyszukiwania na górze listy.
    *   **Czyszczenie:** Opcja "Wyczyść listę" (usuwa niezakupione, wymaga potwierdzenia).
*   **Zakończenie zakupów:** Przycisk archiwizuje listę i czyści widok. Użytkownik może (opcjonalnie) podać liczbę produktów kupionych spoza listy dla statystyk.
*   **Współdzielenie:**
    *   Dodawanie przez adres e-mail.
    *   System zaproszeń (widoczne w aplikacji, wymagają akceptacji).
    *   Równość uprawnień (każdy może edytować, usuwać innych).
    *   Powiadomienia: Brak Push. Subtelne sygnały wizualne (np. mignięcie tła) przy zmianach na żywo.

### B. Zestawy / Szablony (Zakładka 2)
*   **Definicja:** Zestawy działają jako szablony ("kopiuj-wklej"). Ich edycja nie wpływa na aktywne listy i odwrotnie.
*   **Akcje na zestawach:**
    *   Utwórz nowy / Kopiuj / Zmień nazwę / Usuń.
    *   **"Zapisz listę jako zestaw"** – opcja dostępna z widoku listy zakupów.
    *   Edycja zestawu w dedykowanym widoku (identycznym jak lista zakupów).
*   **Dodawanie do listy:**
    *   Jedno kliknięcie dodaje cały zestaw.
    *   Wykrycie ponownego dodania tego samego zestawu -> Pytanie do użytkownika: "Dodać ponownie (zwiększyć ilości)?".
*   **Kategorie:** Brak kategoryzowania produktów wewnątrz zestawów w MVP.

### C. Historia (Zakładka 3)
*   Przechowywanie danych o zrealizowanych zakupach przez **365 dni**.
*   Statystyki (jeśli podano) dotyczące zakupów spoza listy.

## 5. Interfejs Użytkownika (UI/UX)
*   **Nawigacja:** Dolny pasek (Bottom Navigation Bar): **Listy | Zestawy | Historia**.
*   **Status synchronizacji:** Dyskretna ikona w nagłówku (np. zielona chmurka / pomarańczowa z wykrzyknikiem dla offline).
*   **Tryb ciemny (Dark Mode):** Nie w MVP.

## 6. Ograniczenia i Wykluczenia (MVP)
*   **Limity:** Brak twardych limitów technicznych na liczbę list/produktów (zakładamy "rozsądne użytkowanie"), brak wirtualizacji długich list.
*   **Brak:** Skanowania kodów kreskowych, integracji z przepisami, analityki cen, wielopoziomowych uprawnień.

### 7. Model Danych i Baza Danych (Supabase)

Aby obsłużyć współdzielenie i streamowanie zmian, struktura tabel w PostgreSQL powinna wyglądać następująco:

#### A. Tabele Główne

* **`profiles`**: Rozszerzenie danych użytkownika (id, email, avatar_url).
* **`shopping_lists`**:
* `id` (uuid), `name` (text), `created_at`, `archived` (boolean).
* `owner_id` (użytkownik, który stworzył listę).


* **`list_items`**:
* `id`, `list_id` (FK), `name` (text), `amount` (text/notatka), `is_bought` (boolean).
* `position` (int) – do obsługi drag-and-drop.
* `last_modified_by` (uuid) – dla strategii "Last Write Wins".


* **`shared_lists`**: Tabela łącząca (wiele-do-wielu) użytkowników z listami, określająca kto ma dostęp do danej listy.

#### B. Mechanizm Realtime

* Włączenie **Supabase Realtime** na tabeli `list_items`.
* Klient (React) subskrybuje kanał: `list_items:list_id=eq.{ID_LISTY}`.
* Każdy `INSERT`, `UPDATE` lub `DELETE` wywołuje natychmiastową aktualizację u wszystkich obserwujących.

#### C. Bezpieczeństwo (RLS - Row Level Security)

* Dostęp do produktów w `list_items` jest ograniczony tylko do użytkowników, którzy widnieją w tabeli `shared_lists` dla danego `list_id`.