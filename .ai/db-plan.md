# Schemat Bazy Danych QuickShop

## 1. Lista Tabel

### `profiles`
Tabela przechowująca publiczne informacje o użytkownikach.
*   `id`: uuid (PK, FK -> auth.users.id) - Identyfikator użytkownika
*   `full_name`: text (nullable) - Imię i nazwisko
*   `email`: text (nullable) - Adres email (kopia z auth.users dla łatwiejszego dostępu)
*   `updated_at`: timestamptz - Data ostatniej aktualizacji

### `lists`
Główne listy zakupowe.
*   `id`: uuid (PK, default: gen_random_uuid()) - Unikalny identyfikator listy
*   `name`: text (not null) - Nazwa listy
*   `created_by`: uuid (FK -> auth.users.id, not null) - Twórca listy
*   `created_at`: timestamptz (default: now()) - Data utworzenia
*   `updated_at`: timestamptz (default: now()) - Data ostatniej edycji

### `list_members`
Tabela łącząca dla współdzielenia list (relacja wiele-do-wielu).
*   `list_id`: uuid (PK, FK -> lists.id, ON DELETE CASCADE)
*   `user_id`: uuid (PK, FK -> profiles.id, ON DELETE CASCADE)
*   `created_at`: timestamptz (default: now())

### `list_items`
Pozycje na liście zakupów.
*   `id`: uuid (PK, default: gen_random_uuid())
*   `list_id`: uuid (FK -> lists.id, ON DELETE CASCADE)
*   `name`: text (not null) - Nazwa produktu
*   `quantity`: text (nullable) - Ilość (np. "2 szt", "1 kg")
*   `note`: text (nullable) - Dodatkowe uwagi
*   `is_bought`: boolean (default: false) - Status zakupu
*   `sort_order`: double precision (default: 0.0) - Kolejność (drag & drop)
*   `created_at`: timestamptz (default: now())
*   `updated_at`: timestamptz (default: now())

### `sets`
Szablony zakupowe (zestawy).
*   `id`: uuid (PK, default: gen_random_uuid())
*   `name`: text (not null) - Nazwa zestawu
*   `description`: text (nullable) - Opis zestawu
*   `created_by`: uuid (FK -> auth.users.id, not null)
*   `created_at`: timestamptz (default: now())
*   `updated_at`: timestamptz (default: now())

### `set_members`
Tabela łącząca dla współdzielenia zestawów.
*   `set_id`: uuid (PK, FK -> sets.id, ON DELETE CASCADE)
*   `user_id`: uuid (PK, FK -> profiles.id, ON DELETE CASCADE)
*   `created_at`: timestamptz (default: now())

### `set_items`
Pozycje w zestawie (szablonie).
*   `id`: uuid (PK, default: gen_random_uuid())
*   `set_id`: uuid (FK -> sets.id, ON DELETE CASCADE)
*   `name`: text (not null)
*   `quantity`: text (nullable)
*   `note`: text (nullable)
*   `sort_order`: double precision (default: 0.0)
*   `created_at`: timestamptz (default: now())
*   `updated_at`: timestamptz (default: now())

### `shopping_history`
Archiwum zakończonych zakupów.
*   `id`: uuid (PK, default: gen_random_uuid())
*   `user_id`: uuid (FK -> profiles.id, not null) - Kto zakończył zakupy
*   `list_name`: text (not null) - Nazwa listy w momencie archiwizacji
*   `items_snapshot`: jsonb (not null) - Zrzut zakupionych produktów (nazwa, ilość, notatka)
*   `completed_at`: timestamptz (default: now()) - Data zakończenia zakupów

## 2. Relacje

*   **Użytkownicy - Listy**: Relacja wiele-do-wielu przez tabelę `list_members`.
*   **Listy - Elementy Listy**: Relacja jeden-do-wielu (`lists.id` -> `list_items.list_id`).
*   **Użytkownicy - Zestawy**: Relacja wiele-do-wielu przez tabelę `set_members`.
*   **Zestawy - Elementy Zestawu**: Relacja jeden-do-wielu (`sets.id` -> `set_items.set_id`).
*   **Użytkownicy - Historia**: Relacja jeden-do-wielu (`profiles.id` -> `shopping_history.user_id`).
*   **Użytkownicy - Profile**: Relacja jeden-do-jednego (`auth.users.id` -> `profiles.id`).

## 3. Indeksy

*   `list_items`: indeks na `list_id` (częste filtrowanie po liście).
*   `list_members`: indeks na `user_id` (pobieranie list użytkownika).
*   `list_members`: indeks na `list_id` (sprawdzanie uprawnień).
*   `set_items`: indeks na `set_id`.
*   `set_members`: indeks na `user_id`.
*   `set_members`: indeks na `set_id`.
*   `shopping_history`: indeks na `user_id` (historia użytkownika).
*   `shopping_history`: indeks na `completed_at` (sortowanie historii).

## 4. Zasady PostgreSQL (RLS)

Wszystkie tabele będą miały włączone RLS (`ALTER TABLE ... ENABLE ROW LEVEL SECURITY`).

### `profiles`
*   `SELECT`: Dostępne dla każdego uwierzytelnionego użytkownika (aby móc wyszukać innych do współdzielenia).
*   `UPDATE`: Tylko dla właściciela rekordu (`auth.uid() = id`).
*   `INSERT`: Trigger systemowy (zakładany przy rejestracji).

### `lists`
*   `SELECT`, `UPDATE`, `DELETE`: Jeśli użytkownik znajduje się w `list_members` dla danej listy (`auth.uid() IN (SELECT user_id FROM list_members WHERE list_id = id)`).
*   `INSERT`: Dla każdego uwierzytelnionego użytkownika.

### `list_members`
*   `SELECT`: Jeśli użytkownik jest członkiem listy.
*   `INSERT`, `DELETE`: Jeśli użytkownik jest członkiem listy (wszyscy członkowie mogą zarządzać dostępem w MVP).

### `list_items`
*   `ALL`: Jeśli użytkownik ma dostęp do listy nadrzędnej (`list_id`). Sprawdzenie przez `list_members`.

### `sets`
*   Analogicznie do `lists` (przez `set_members`).

### `set_members`
*   Analogicznie do `list_members`.

### `set_items`
*   Analogicznie do `list_items` (przez `set_id`).

### `shopping_history`
*   `SELECT`, `INSERT`: Tylko dla właściciela rekordu (`auth.uid() = user_id`).

## 5. Dodatkowe uwagi

### Funkcje i Triggery
1.  **`handle_new_user`**: Trigger po `INSERT` na `auth.users`, który tworzy rekord w `public.profiles` oraz domyślną listę powitalną (zgodnie z PRD).
2.  **`update_updated_at`**: Trigger aktualizujący kolumnę `updated_at` przed każdą zmianą (`UPDATE`) w tabelach edytowalnych (`lists`, `list_items`, `sets`, `set_items`).
3.  **`archive_list_items(list_id uuid)`**: Funkcja RPC (Database Function).
    *   Pobiera elementy z `list_items` gdzie `list_id = $1` AND `is_bought = true`.
    *   Tworzy wpis w `shopping_history`.
    *   Usuwa pobrane elementy z `list_items`.

### Typy danych
*   `quantity` w tabelach items to `text` (zamiast liczby), aby obsłużyć różne jednostki (np. "1.5 kg", "opakowanie") bez skomplikowanej logiki jednostek w MVP.
*   `sort_order` to `double precision` (float), co pozwala na wstawianie elementów pomiędzy inne (np. `(1.0 + 2.0) / 2 = 1.5`) bez konieczności aktualizacji wszystkich indeksów.

### Bezpieczeństwo
*   Polityki RLS będą kluczowym mechanizmem zabezpieczającym dane.
*   Brak ról ("admin", "viewer") w MVP upraszcza logikę `list_members` - samo bycie w tabeli daje pełne prawa.
