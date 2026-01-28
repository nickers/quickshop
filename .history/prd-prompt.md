Jesteś doświadczonym menedżerem produktu, którego zadaniem jest stworzenie kompleksowego dokumentu wymagań produktu (PRD) w oparciu o poniższe opisy:

<project_description>
# Aplikacja - Szybkie zakupy (MVP)

### Główny problem
Zakupy wymagają planowania, często całego tygodnia na przód
w efekcie często zapominamy o zakupie rzeczy stale potrzebnych 
(np. owoców i musli na śniadania).

### Najmniejszy zestaw funkcjonalności
- Tworzenie i zarządzanie listami zakupów.
- Dodawanie, edytowania i usuwania zestawów zakupów (np. „na rosół”, „śniadania”), zarządzanych przez użytkowników.
- Możliwość dodawania całego zestawu do listy zakupów jednym kliknięciem.
- Podstawowy system uwierzytelniania i autoryzacji
- Wykrywanie duplikatów towarów z różnych list i wyświetlanie ich jako 1 pozycji z adnotacją


### Co NIE wchodzi w zakres MVP
- skanowanie kodów kreskowych, 
- integracja z przepisami kulinarnymi,
- analityka cen,
- wielopoziomowy system uprawnień

### Kryteria sukcesu
- 90% zakupionych towarów na weekendowych zakupach pochodzi z listy zakupów
- 50% zakupów potwrzalnych z tygodnia na tydzień pochodzi z zestawu
</project_description>

<project_details>
# Dokument Wymagań Projektowych (PRD) – QuickShop (MVP)

## 1. Przegląd Projektu
*   **Nazwa produktu:** QuickShop
*   **Typ aplikacji:** Progressive Web App (PWA) – Mobile First.
*   **Główny cel:** Ułatwienie planowania zakupów i eliminacja problemu zapominania o produktach stałych (np. śniadaniowych) poprzez wykorzystanie szablonów (zestawów).
*   **Branding:** Minimalistyczne logo oparte na ikonie koszyka.

## 2. Architektura i Technologia
* **Frontend:** React + Vite.
* **Hosting:** Vercel.
* **Stylizacja:** Tailwind CSS + Material Design components.
* **Backend (BaaS):** **Supabase**.
* **Realtime:** Wykorzystanie mechanizmu PostgreSQL Change Data Capture (CDC) do streamowania zmian w listach przez WebSockets.
* **Auth:** Supabase Auth (Email/Hasło + Google OAuth).
* **Storage:** (Opcjonalnie w przyszłości) dla zdjęć produktów.
* **Model danych:** Optimistic UI (zakładamy sukces operacji) + Persist Cache (np. TanStack Query zapisujący stan w localStorage). To da wrażenie działania offline i szybkości, będąc łatwiejszym w implementacji niż pełna baza danych po stronie klienta (np. PouchDB/WatermelonDB).
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
</project_details>

Wykonaj następujące kroki, aby stworzyć kompleksowy i dobrze zorganizowany dokument:

1. Podziel PRD na następujące sekcje:
   a. Przegląd projektu
   b. Problem użytkownika
   c. Wymagania funkcjonalne
   d. Granice projektu
   e. Historie użytkownika
   f. Metryki sukcesu

2. W każdej sekcji należy podać szczegółowe i istotne informacje w oparciu o opis projektu i odpowiedzi na pytania wyjaśniające. Upewnij się, że:
   - Używasz jasnego i zwięzłego języka
   - W razie potrzeby podajesz konkretne szczegóły i dane
   - Zachowujesz spójność w całym dokumencie
   - Odnosisz się do wszystkich punktów wymienionych w każdej sekcji

3. Podczas tworzenia historyjek użytkownika i kryteriów akceptacji
   - Wymień WSZYSTKIE niezbędne historyjki użytkownika, w tym scenariusze podstawowe, alternatywne i skrajne.
   - Przypisz unikalny identyfikator wymagań (np. US-001) do każdej historyjki użytkownika w celu bezpośredniej identyfikowalności.
   - Uwzględnij co najmniej jedną historię użytkownika specjalnie dla bezpiecznego dostępu lub uwierzytelniania, jeśli aplikacja wymaga identyfikacji użytkownika lub ograniczeń dostępu.
   - Upewnij się, że żadna potencjalna interakcja użytkownika nie została pominięta.
   - Upewnij się, że każda historia użytkownika jest testowalna.

Użyj następującej struktury dla każdej historii użytkownika:
- ID
- Tytuł
- Opis
- Kryteria akceptacji

4. Po ukończeniu PRD przejrzyj go pod kątem tej listy kontrolnej:
   - Czy każdą historię użytkownika można przetestować?
   - Czy kryteria akceptacji są jasne i konkretne?
   - Czy mamy wystarczająco dużo historyjek użytkownika, aby zbudować w pełni funkcjonalną aplikację?
   - Czy uwzględniliśmy wymagania dotyczące uwierzytelniania i autoryzacji (jeśli dotyczy)?

5. Formatowanie PRD:
   - Zachowaj spójne formatowanie i numerację.
   - Nie używaj pogrubionego formatowania w markdown ( ** ).
   - Wymień WSZYSTKIE historyjki użytkownika.
   - Sformatuj PRD w poprawnym markdown.

Przygotuj PRD z następującą strukturą:

```markdown
# Dokument wymagań produktu (PRD) - {{app-name}}
## 1. Przegląd produktu
## 2. Problem użytkownika
## 3. Wymagania funkcjonalne
## 4. Granice produktu
## 5. Historyjki użytkowników
## 6. Metryki sukcesu
```

Pamiętaj, aby wypełnić każdą sekcję szczegółowymi, istotnymi informacjami w oparciu o opis projektu i nasze pytania wyjaśniające. Upewnij się, że PRD jest wyczerpujący, jasny i zawiera wszystkie istotne informacje potrzebne do dalszej pracy nad produktem.

Ostateczny wynik powinien składać się wyłącznie z PRD zgodnego ze wskazanym formatem w markdown, który zapiszesz w pliku .ai/prd.md