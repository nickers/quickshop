<conversation_summary>
<decisions>
1. Utworzenie tabeli profiles powiązanej z auth.users, zawierającej pola full_name (text, nullable) oraz email (text, nullable). avatar_url odroczone na później.
2. Współdzielenie list realizowane przez tabelę łączącą list_members (list_id, user_id). Brak ról w MVP - wszyscy członkowie mają prawa edycji.
3. Produkty na liście (list_items) przechowują nazwę jako zwykły tekst (brak relacji do bazy produktów).
4. Sortowanie produktów metodą drag-and-drop przy użyciu kolumny sort_order (float).
5. Wykrywanie duplikatów realizowane po stronie aplikacji, nie bazy danych.
6. Oddzielne tabele dla zestawów/szablonów: sets i set_items.
7. Zestawy również będą współdzielone (jak listy), wymagana tabela set_members. Tabela sets zawiera: id, created_by, name, description, created_at.
8. Archiwizacja zakupów do tabeli shopping_history jako snapshot JSONB.
9. Archiwizacja realizowana funkcją RPC: przeniesienie "kupionych" produktów do historii, usunięcie ich z aktywnej listy, ale sama lista pozostaje aktywna (użytkownik usuwa ją ręcznie).
10. Tabela shopping_history zawiera dodatkowo: completed_at, list_name, user_id.
11. Produkty oznaczone jako kupione za pomocą kolumny is_bought (boolean, default false).
12. Automatyczna aktualizacja updated_at za pomocą triggera.
13. Usuwanie kaskadowe (ON DELETE CASCADE) dla elementów list i członków przy usunięciu listy głównej.
14. Typ danych dla ilości produktu (quantity) to tekst.
15. Pole notatki (note) bezpośrednio w list_items (text, nullable).
</decisions>

<matched_recommendations>
1. Utworzenie tabeli profiles jako rozszerzenia auth.users.
2. Zastosowanie tabeli pivot list_members dla relacji wiele-do-wielu (użytkownicy-listy).
3. Przechowywanie elementów listy jako tekst w list_items (uproszczenie dla MVP).
4. Użycie sort_order (float/double) do sortowania elementów.
5. Rozdzielenie logiki list aktywnych i szablonów (sets).
6. Wykorzystanie JSONB do przechowywania niezmiennej historii zakupów (shopping_history).
7. Zastosowanie RLS w oparciu o tabele członkowskie (list_members, set_members).
8. Kaskadowe usuwanie danych powiązanych.
9. Indeksowanie kluczy obcych (list_id, user_id, owner_id/created_by) dla wydajności.
10. Użycie triggerów do obsługi updated_at.
</matched_recommendations>

<database_planning_summary>
Schemat bazy danych dla QuickShop MVP opiera się na usługach Supabase (PostgreSQL).

Kluczowe Encje:

1. Profiles: Rozszerzenie systemowej tabeli użytkowników. Przechowuje full_name i email.
2. Lists: Główne listy zakupowe. Atrybuty: name, created_by, created_at, updated_at.
3. List Members: Tabela łącząca dla współdzielenia list. Atrybuty: list_id, user_id.
4. List Items: Pozycje na liście. Atrybuty: name, quantity (text), note (text), is_bought (boolean), sort_order (float). Relacja do lists.
5. Sets: Szablony zakupowe (zestawy). Współdzielone podobnie jak listy. Atrybuty: name, description, created_by.
6. Set Members: Tabela łącząca dla współdzielenia zestawów. Atrybuty: set_id, user_id.
7. Set Items: Pozycje w szablonie. Podobna struktura do list_items (bez is_bought).
8. Shopping History: Archiwum zakupów. Przechowuje snapshot listy jako jsonb, metadane (completed_at, list_name, user_id).

Bezpieczeństwo i Skalowalność:
* RLS (Row Level Security): Dostęp do danych (SELECT, INSERT, UPDATE, DELETE) będzie ściśle kontrolowany przez polityki sprawdzające obecność
    użytkownika w tabelach list_members lub set_members (dla zasobów współdzielonych) lub zgodność id w tabeli profiles.
* Wydajność: Kluczowe kolumny wykorzystywane w warunkach złączeń i filtrów (klucze obce) zostaną zaindeksowane. Sortowanie po float jest wydajne i nie
    wymaga częstych aktualizacji wielu wierszy.

Logika Biznesowa w Bazie:
* Triggery: Automatyczna aktualizacja updated_at.
* Funkcje RPC: archive_list do atomowej operacji przenoszenia kupionych produktów do historii i czyszczenia aktywnej listy.

</database_planning_summary>

<unresolved_issues>
Brak istotnych nierozwiązanych kwestii. Plan jest kompletny i gotowy do implementacji w postaci migracji SQL.
</unresolved_issues>
</conversation_summary>