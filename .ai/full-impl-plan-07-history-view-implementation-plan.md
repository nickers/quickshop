# Pełny plan wdrożenia: Widok Historii Zakupów (History)

**Odniesienie:** ui-plan.md §2.6; impl-plan-07-history  
**Ścieżka:** `/history`  
**Część:** 7 – Historia zakupów

---

## 1. Cel i zakres

**Cel:** Wdrożenie widoku historii zakupów umożliwiającego przegląd zakończonych (zarchiwizowanych) list – lista wpisów posortowana chronologicznie z możliwością rozwinięcia szczegółów (items_snapshot) w formie accordion.

**Zakres:**
- Strona `/history` z listą wpisów z tabeli `shopping_history`: nagłówek każdego wpisu (nazwa listy + data zakończenia), po rozwinięciu – lista produktów ze zrzutu (items_snapshot).
- Prezentacja w formie accordion (jeden lub wiele rozwiniętych wpisów – zgodnie z wyborem UX).
- Bottom Navigation: na `/history` zakładka „Historia” aktywna.
- Stan pusty: komunikat „Brak zakończonych zakupów”.
- Brak mutacji – widok tylko do odczytu (US-015).

---

## 2. Wymagania (User Stories i kryteria akceptacji)

| Id     | User Story            | Kryterium |
|--------|------------------------|-----------|
| US-015 | Przeglądanie historii  | Zakładka Historia; lista archiwalnych zakupów posortowana chronologicznie; możliwość podglądu szczegółów zakończonej listy (items_snapshot). |
| US-006 | Archiwizacja listy    | Lista znika z aktywnych i trafia do historii (completeShoppingTrip → RPC archive_list_items). Archiwizacja realizowana w widoku listy; historia tylko wyświetla dane. |

**Kryteria ukończenia widoku (impl-plan-07):**
- Historia wyświetla zarchiwizowane listy w formie accordion z możliwością rozwinięcia szczegółów (nazwa, data, lista produktów ze zrzutu).
- Sortowanie chronologiczne (najnowsze na górze).
- Na `/history` zakładka „Historia” w Bottom Nav jest aktywna.
- Gdy brak wpisów: komunikat „Brak zakończonych zakupów”.

---

## 3. Architektura i zależności

- **Route:** TanStack Router, plik `history.tsx` (ścieżka `/history`).
- **Dane:** TanStack Query (`useQuery`) z `networkMode: "offlineFirst"`; serwis `historyService.getHistory()`.
- **UI:** React, Tailwind CSS, komponenty shadcn/ui (Button, Card, Separator). Do accordion: komponent Collapsible (shadcn) lub prosty stan rozwijania (useState).
- **Typy:** `domain.types.ts` (HistoryEntry), `database.types.ts` (shopping_history Row). Struktura `items_snapshot`: tablica obiektów `{ name, quantity, note }` (zgodnie z funkcją RPC `archive_list_items`).
- **Zależności między częściami:** Trasa `/history` i link w Bottom Nav są zaimplementowane w części 1 (Layout). HistoryService i typ HistoryEntry istnieją. Archiwizacja (US-006) odbywa się z widoku listy (ListsService.archiveList) – po archiwizacji wpis pojawia się w historii po odświeżeniu/refetch.

---

## 4. Stan obecny (co już jest zaimplementowane)

- **HistoryService:** getHistory() – select z `shopping_history`, .order("completed_at", { ascending: false }). Zwraca HistoryEntry[].
- **history.tsx:** Placeholder – sprawdzenie auth, przekierowanie na `/auth` przy braku sesji, tekst „Historia zakupów – wkrótce”.
- **Typy:** HistoryEntry = Database["public"]["Tables"]["shopping_history"]["Row"] (id, user_id, list_name, items_snapshot, completed_at). W bazie items_snapshot to jsonb (tablica obiektów { name, quantity, note }).
- **MainLayout:** DASHBOARD_PATHS = ["/lists", "/sets", "/history"] – na `/history` wyświetlane są Header i Bottom Nav.
- **BottomNav:** Link do `/history` z etykietą „Historia” i ikoną History; aktywny stan gdy pathname === "/history" (obecnie pathname === to dla każdej trasy – dla `/history` nie ma podtras, więc to wystarczy).
- **Brak:** hook useHistory, komponenty listy/accordion dla historii, obsługa stanu pustego.

---

## 5. Szczegółowy podział zadań

### 5.1. Serwis HistoryService
- **Brak zmian.** getHistory() zwraca wpisy z nazwą listy, datą i items_snapshot; sortowanie po completed_at desc jest w serwisie. RLS na `shopping_history`: SELECT tylko dla auth.uid() = user_id.

### 5.2. Typ dla items_snapshot (opcjonalnie w domain.types lub lokalnie)
- Zdefiniować typ dla elementu zrzutu, np. `HistoryItemSnapshot`: `{ name: string; quantity: string | null; note: string | null }`. Items_snapshot w odpowiedzi Supabase to `Json` – przy odczycie rzutować na `HistoryItemSnapshot[]` (Array.isArray + walidacja pól w razie potrzeby).

### 5.3. Hook useHistory
- **useHistory():**
  - useQuery: queryKey ["history"], queryFn: () => historyService.getHistory(), networkMode: "offlineFirst".
  - Eksport: entries (HistoryEntry[]), isLoading, error, refetch.
  - Brak mutacji – tylko odczyt.

### 5.4. Komponent listy – Accordion
- **Opcja A (zalecana):** Dodać komponent Collapsible z shadcn/ui (oparty na @radix-ui/react-collapsible). Dla każdego wpisu: trigger (nagłówek) + CollapsibleContent (szczegóły).
- **Opcja B:** Prosty stan: useState<string | null>(null) – id rozwiniętego wpisu (lub Set<string> dla „wiele rozwiniętych”). Klik w wiersz przełącza rozwinięcie; w rozwiniętej treści wyświetlić listę z items_snapshot.
- **Nagłówek wpisu (trigger):** list_name, sformatowana data completed_at (np. format względny lub locale date string). Ikona ChevronDown/ChevronUp w zależności od stanu rozwinięcia.
- **Treść rozwinięta:** Lista pozycji ze items_snapshot: dla każdego elementu wyświetlić name; jeśli quantity lub note – w jednej linii (muted). Brak checkboxów i edycji – tylko odczyt.

### 5.5. Komponent HistoryEntryCard (lub HistoryAccordionItem)
- Jeden wpis historii: Card lub div z border; nagłówek klikalny (CollapsibleTrigger lub button); wewnątrz CollapsibleContent – lista pozycji (np. ul/div z wierszami). Propsy: entry: HistoryEntry; isOpen: boolean; onToggle: () => void (przy opcji B) lub użycie Collapsible (Opcja A – stan wewnętrzny lub przekazany).

### 5.6. Komponent HistoryList (lista accordion)
- Mapowanie entries → HistoryEntryCard (lub odpowiednik). Przekazać entries, obsługa pustej listy – wyświetlenie komunikatu „Brak zakończonych zakupów” w tym samym widoku (nie osobna ścieżka).

### 5.7. Strona history.tsx
- Sprawdzenie auth (jak w placeholderze); przy braku sesji navigate do /auth.
- useHistory().
- Stan ładowania: spinner (spójny z lists/sets).
- Stan błędu: komunikat + przycisk „Spróbuj ponownie” (refetch).
- Stan pusty (entries.length === 0 i !isLoading): komunikat „Brak zakończonych zakupów”.
- Zawartość: nagłówek sekcji (opcjonalnie „Historia” jako tytuł – Header z layoutu już pokazuje „Historia”), następnie HistoryList(entries).

### 5.8. Bottom Nav
- Brak zmian – link „Historia” z pathname === "/history" już wyróżnia zakładkę (obecna logika: pathname === to dla każdego nav item).

### 5.9. Format daty
- completed_at to string (ISO) z bazy; wyświetlić np. format(new Date(entry.completed_at), "dd.MM.yyyy, HH:mm") lub krótszy format – spójny z resztą aplikacji (sprawdzić ListsHeader/SetsHeader pod kątem ewentualnego formatowania dat).

---

## 6. Komponenty i zmiany w plikach

| Komponent / plik              | Odpowiedzialność                                      | Zmiany względem obecnego stanu |
|-------------------------------|--------------------------------------------------------|----------------------------------|
| HistoryService (history.service.ts) | API historii – getHistory()                          | Bez zmian.                       |
| useHistory.ts (nowy)          | Hook useQuery dla historii                            | Nowy plik: queryKey ["history"], entries, isLoading, error, refetch. |
| HistoryItemSnapshot (typ)     | Typ elementu items_snapshot                            | Dodać w domain.types.ts lub w pliku historii: { name, quantity, note }. |
| HistoryEntryCard (lub nazwa)  | Jedna karta wpisu: nagłówek + rozwijana treść (accordion) | Nowy komponent w `components/history/`: list_name, completed_at, lista z items_snapshot. |
| HistoryList.tsx               | Lista kart wpisów lub stan pusty                      | Nowy: map entries → HistoryEntryCard; empty state „Brak zakończonych zakupów”. |
| history.tsx                   | Strona /history                                        | Zastąpić placeholder: auth, useHistory, spinner/error/empty/HistoryList. |
| Collapsible (shadcn)          | Rozwijana treść                                       | Opcjonalnie: dodać komponent z shadcn/ui jeśli wybrano Opcję A. |

**Struktura katalogów:** Komponenty widoku historii w `src/components/history/` (HistoryEntryCard, HistoryList) – spójność z lists/, sets/.

---

## 7. Serwisy i API

- **historyService (bez zmian):**
  - **getHistory(): Promise<HistoryEntry[]>** – from("shopping_history").select("*").order("completed_at", { ascending: false }). RLS: SELECT tylko gdzie user_id = auth.uid().
- **Tabela shopping_history:** user_id, list_name, items_snapshot (jsonb), completed_at. Brak mutacji po stronie widoku historii – tylko odczyt.

---

## 8. Stan i hook useHistory

- **Zapytanie:** queryKey ["history"], queryFn: historyService.getHistory, networkMode: "offlineFirst".
- **Eksport:** entries (HistoryEntry[]), isLoading, error, refetch.
- **Typ entries:** HistoryEntry; items_snapshot w runtime to tablica obiektów { name, quantity?, note? } – przy renderze rzutować na HistoryItemSnapshot[] (z zabezpieczeniem na null/undefined).

---

## 9. Kryteria akceptacji i testy

- Wejście na `/history` (zalogowany użytkownik) pokazuje listę zarchiwizowanych zakupów posortowanych od najnowszych; każdy wpis ma nagłówek (nazwa listy + data zakończenia).
- Kliknięcie w wpis (lub w trigger) rozwija/zwija szczegóły – lista produktów ze zrzutu (nazwa, ewentualnie ilość i notatka).
- Gdy użytkownik nie ma żadnego wpisu w historii – wyświetla się komunikat „Brak zakończonych zakupów”.
- Na `/history` w Bottom Nav zakładka „Historia” jest oznaczona jako aktywna.
- Stan ładowania: spinner; stan błędu: komunikat i przycisk „Spróbuj ponownie” (refetch).
- Niezalogowany użytkownik trafia na /auth (obecna logika w history.tsx).

---

## 10. Kolejność wdrożenia

1. **Typ HistoryItemSnapshot:** Dodać w domain.types.ts (lub w pliku hooka/komponentu) – struktura jednego elementu items_snapshot.
2. **useHistory:** Nowy hook – useQuery ["history"], getHistory; eksport entries, isLoading, error, refetch.
3. **Collapsible (opcjonalnie):** Dodać komponent Collapsible z shadcn/ui, jeśli wybrano accordion oparty na Radix.
4. **HistoryEntryCard:** Komponent jednego wpisu – nagłówek (list_name, completed_at, ikona rozwiń/zwiń) + rozwijana treść z listą pozycji z items_snapshot.
5. **HistoryList:** Mapowanie entries na HistoryEntryCard; empty state „Brak zakończonych zakupów”.
6. **history.tsx:** Podłączenie auth, useHistory, obsługa loading/error/empty oraz render HistoryList(entries).
7. Weryfikacja Bottom Nav: na `/history` zakładka „Historia” aktywna (już zapewnione przez pathname === "/history").

---

## 11. Uwagi i ryzyka

- **items_snapshot:** W bazie zapisuje tylko kupione pozycje (archive_list_items bierze list_items gdzie is_bought = true). Format: tablica obiektów { name, quantity, note }. W TypeScript Supabase zwraca typ Json – przy użyciu w UI bezpiecznie założyć HistoryItemSnapshot[] i obsłużyć przypadek null/undefined (np. pusty array).
- **Accordion:** W projekcie nie ma jeszcze komponentu Accordion/Collapsible w `components/ui`. Można zaimplementować prosty wariant na useState (jedno lub wiele rozwiniętych id) bez dodawania zależności – lub dodać shadcn Collapsible dla lepszej dostępności (ARIA).
- **Offline:** networkMode: "offlineFirst" pozwala na wyświetlenie ostatnio pobranych danych z cache przy braku sieci; przy pierwszym wejściu offline lista może być pusta do czasu powrotu połączenia.
- **Spójność wizualna:** Nagłówki i karty w widoku historii powinny być spójne z ListsGrid/SetCard (Card, typografia, odstępy) – bez konieczności reużycia tych samych komponentów, bo kontekst jest inny (tylko odczyt, accordion).
