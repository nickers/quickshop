# Pełny plan wdrożenia: Widok Szczegółów Zestawu (Set Details)

**Odniesienie:** ui-plan.md §2.5; impl-plan-06-set-details  
**Ścieżka:** `/sets/:setId`  
**Część:** 6 – Szczegóły zestawu

---

## 1. Cel i zakres

**Cel:** Wdrożenie widoku szczegółów zestawu (szablonu zakupowego) umożliwiającego edycję zawartości szablonu: przegląd produktów w zestawie, dodawanie, edycję ilości/notatki oraz usuwanie pozycji.

**Zakres:**
- Nagłówek z przyciskiem Wstecz (→ `/sets`), etykietą „TRYB SZABLONU” oraz nazwą zestawu; opcjonalnie menu (Zmień nazwę, Usuń zestaw).
- Lista produktów w zestawie **bez** checkboxów „kupione” (tylko nazwa, ilość/notatka, akcje: edycja, usuń); opcjonalnie sortowanie (drag handle).
- Sticky Input przyklejony do dołu ekranu do dodawania pozycji do zestawu (analogicznie do widoku listy).
- Optimistic UI: natychmiastowe odzwierciedlenie dodania/edycji/usunięcia z obniżoną opacity dla niesynchronizowanych elementów.
- Bottom Nav na trasie `/sets/:setId` ukryty (zgodnie z MainLayout – tylko `/lists`, `/sets`, `/history` pokazują chrome).

---

## 2. Wymagania (User Stories i kryteria akceptacji)

| Id   | User Story | Kryterium |
|------|------------|-----------|
| US-012 | Tworzenie zestawu z listy | Opcja „Zapisz jako zestaw” z poziomu listy (integracja z ListDetailsHeader – poza zakresem części 6; realizowane w innym widoku). |
| US-013 | Zarządzanie zestawami | Edycja produktów wewnątrz zestawu: dodawanie, edycja ilości/notatki, usuwanie; ewentualnie sortowanie. |

**Kryteria ukończenia widoku (impl-plan-06):**
- Widok szczegółów zestawu pokazuje nagłówek z etykietą „TRYB SZABLONU”, listę pozycji zestawu i Sticky Input.
- Dodawanie, edycja, usuwanie pozycji w zestawie działa (z Optimistic UI).
- Powrót: przycisk Wstecz → `/sets`. Bottom Nav na tej trasie ukryty.

---

## 3. Architektura i zależności

- **Route:** TanStack Router, plik `sets.$setId.tsx` (ścieżka `/sets/:setId`).
- **Dane:** TanStack Query (`useQuery` / `useMutation`) z `networkMode: "offlineFirst"`; serwis `setsService`.
- **UI:** React, Tailwind CSS, komponenty shadn/ui (Button, Input, Dialog, DropdownMenu, Separator).
- **Typy:** `domain.types.ts` (ShoppingSet, SetItem, CreateSetItemDTO), `database.types.ts` (sets, set_items Row).
- **Zależności między częściami:** Brak blokujących zależności; widok jest samodzielny. Opcjonalnie: zmiana nazwy zestawu i usunięcie zestawu (menu w nagłówku) – wymagają rozszerzenia SetsService (updateSet, getSetById już lub w tej części).

---

## 4. Stan obecny (co już jest zaimplementowane)

- **SetsService:** getAllSets(), getSetItems(setId), createSet(CreateSetDTO), createSetFromList(listId, CreateSetDTO), addSetItem(CreateSetItemDTO), updateSetItem(itemId, data), deleteSetItem(itemId), deleteSet(setId). **Brak:** getSetById(setId) – potrzebny do wyświetlenia nazwy zestawu w nagłówku bez pobierania wszystkich zestawów.
- **sets.$setId.tsx:** placeholder – auth check, tekst „Szczegóły zestawu – wkrótce”.
- **StickyInputBar (list-details):** komponent uniwersalny – przyjmuje onAddItem(name), isSubmitting; można go użyć w widoku zestawu (dodawanie pozycji po nazwie; ilość/notatka opcjonalnie w edycji wiersza).
- **ListItemRow (list-details):** checkbox, nazwa, ilość/notatka, drag handle, menu Usuń. Dla zestawu potrzebny wariant **bez** checkboxa (SetItemRow lub ListItemRow z propem hideCheckbox / variant="set").
- **MainLayout:** DASHBOARD_PATHS = ["/lists", "/sets", "/history"] – na `/sets/:setId` header i bottom nav są ukryte (pathname nie jest dokładnie równy żadnej z tych ścieżek). Nie wymaga zmian.
- **Typy:** CreateSetItemDTO (set_id, name, quantity?, note?, sort_order?); SetItem (id, set_id, name, quantity, note, sort_order, created_at, updated_at); ShoppingSet (id, name, description, created_by, …).

---

## 5. Szczegółowy podział zadań

### 5.1. Serwis SetsService – rozszerzenie
- Dodać **getSetById(setId: UUID): Promise<ShoppingSet>**: zapytanie `from("sets").select("*").eq("id", setId).single() (RLS przez set_members zwróci zestaw tylko jeśli użytkownik ma dostęp). Używane w useSetDetails do nagłówka (nazwa zestawu).
- Opcjonalnie w tej części lub później: **updateSet(setId, { name?, description? })** dla „Zmień nazwę” w menu.

### 5.2. Hook useSetDetails
- **useSetDetails(setId: string)**:
  - Zapytania: `["set", setId]` → getSetById(setId); `["set-items", setId]` → getSetItems(setId); oba z networkMode: "offlineFirst".
  - Mutacje: addSetItem (createSetItemDTO z sort_order na końcu listy), updateSetItem (itemId, { name?, quantity?, note?, sort_order? }), deleteSetItem(itemId) – każda z optimistic update i pendingIds (analogicznie do useListDetails).
  - Rollback przy błędzie innego niż sieciowy; onSettled – usunięcie id z pendingIds.
  - Eksport: set, items, isLoading, error, addItem(name), updateItem(itemId, data), deleteItem(itemId), refetch, pendingIds, isSubmitting. Opcjonalnie: renameSet, deleteSet (gdy zaimplementowane w serwisie i menu).

### 5.3. SetDetailsHeader
- Przycisk Wstecz: Link do `/sets` (ArrowLeft), aria-label „Wróć do zestawów”.
- Etykieta „TRYB SZABLONU”: badge lub drugi wiersz pod przyciskiem (np. tekst mniejszym fontem, kolor muted).
- Nazwa zestawu: `set.name` (truncate przy długiej nazwie).
- Menu (DropdownMenu): opcjonalnie „Zmień nazwę” (onRename), „Usuń zestaw” (onDeleteSet). Callbacki przekazywane z strony; do pełnej implementacji potrzebne updateSet / deleteSet w serwisie i modale potwierdzenia.
- Propsy: set: ShoppingSet; onRename?: () => void; onDeleteSet?: () => void.

### 5.4. Lista produktów zestawu – SetItemRow
- Wiersz pozycji zestawu: **bez** checkboxa „kupione”. Zawartość: nazwa, ilość/notatka (w jednej linii, muted), po prawej: opcjonalnie drag handle (GripVertical), menu (Edycja, Usuń).
- **Edycja:** inline (rozwiń pola) lub modal/dialog z polami: Nazwa, Ilość, Notatka – zapis przez updateSetItem(itemId, { name, quantity, note }).
- **Usuń:** DropdownMenuItem „Usuń” → deleteSetItem(itemId); optimistic usunięcie z listy.
- isPending → opacity-70 (analogicznie do ListItemRow).
- Można zaimplementować jako osobny komponent **SetItemRow** (SetItem, onUpdate, onDelete, isPending?, dragHandleProps?, isDragging?) albo rozszerzyć ListItemRow o wariant bez checkboxa (variant="set" i bez onToggle). Zalecane: osobny SetItemRow dla czytelności i mniejszego ryzyka regresji w widoku listy.

### 5.5. Komponent listy SetItemsList
- Lista wierszy SetItemRow; przekazanie items, pendingIds, onUpdate, onDelete. Opcjonalnie: drag-and-drop (np. @dnd-kit) z zapisem sort_order przez updateSetItem w pętli – można zostawić na później (MVP: bez sortowania lub tylko kolejność z API).

### 5.6. Sticky Input
- Użyć istniejącego **StickyInputBar**: onAddItem(name) → w useSetDetails addItem przyjmuje nazwę i tworzy CreateSetItemDTO({ set_id: setId, name, sort_order: items.length }). Ilość i notatka pozostają puste przy dodawaniu; użytkownik może je uzupełnić w edycji wiersza (SetItemRow).
- isSubmitting z hooka (stan mutacji addSetItem).

### 5.7. Strona sets.$setId.tsx
- Sprawdzenie auth (jak w placeholderze); przekierowanie na `/auth` gdy brak sesji.
- useSetDetails(setId) z Route.useParams().
- Stan ładowania: spinner; błąd / brak zestawu: komunikat + przycisk „Wróć do zestawów”.
- Layout: SetDetailsHeader(set, onRename?, onDeleteSet?) → div overflow-y-auto z SetItemsList → StickyInputBar(onAddItem, isSubmitting).
- Opcjonalnie: dialogi Zmień nazwę zestawu, Usuń zestaw (potwierdzenie) – gdy zaimplementowane updateSet/deleteSet i menu w nagłówku.

### 5.8. Bottom Nav
- Już ukryty na `/sets/:setId` dzięki MainLayout (showBottomNav tylko dla pathname === "/lists" | "/sets" | "/history"). Brak zmian.

---

## 6. Komponenty i zmiany w plikach

| Komponent / plik | Odpowiedzialność | Zmiany względem obecnego stanu |
|------------------|------------------|---------------------------------|
| `SetsService` (sets.service.ts) | API zestawów | Dodać getSetById(setId). Opcjonalnie: updateSet(setId, data). |
| `useSetDetails.ts` (nowy) | Hook danych zestawu i mutacji | Nowy plik: zapytania set + set-items, mutacje add/update/delete z optimistic UI, pendingIds. |
| `SetDetailsHeader.tsx` (nowy) | Wstecz, „TRYB SZABLONU”, nazwa zestawu, menu | Nowy komponent w `components/set-details/` lub `components/sets/`. |
| `SetItemRow.tsx` (nowy) | Wiersz pozycji zestawu (bez checkboxa) | Nowy: nazwa, ilość/notatka, menu Edycja/Usuń, isPending. Opcjonalnie drag handle. |
| `SetItemsList.tsx` (nowy) | Lista SetItemRow | Nowy: mapowanie items → SetItemRow z onUpdate, onDelete, pendingIds. |
| `StickyInputBar.tsx` (list-details) | Dodawanie pozycji | Bez zmian – reużycie; placeholder „Dodaj produkt…” pasuje do zestawu. |
| `sets.$setId.tsx` | Strona szczegółów zestawu | Zastąpić placeholder: auth, useSetDetails, SetDetailsHeader, SetItemsList, StickyInputBar. |

**Struktura katalogów:** Komponenty widoku zestawu można umieścić w `src/components/set-details/` (analogia do list-details) lub w `src/components/sets/` obok kart zestawów. Zalecane: `set-details/` (SetDetailsHeader, SetItemRow, SetItemsList) dla spójności z list-details.

---

## 7. Serwisy i API

- **setsService (rozszerzenie):**
  - **getSetById(setId: UUID): Promise<ShoppingSet>** – select z tabeli `sets` where id = setId, .single(); RLS zapewnia dostęp tylko dla członków set_members.
  - Istniejące: getSetItems(setId), addSetItem(CreateSetItemDTO), updateSetItem(itemId, Partial<CreateSetItemDTO>), deleteSetItem(itemId).
  - Opcjonalnie: updateSet(setId, { name?, description? }), deleteSet(setId) – dla menu w nagłówku.
- **CreateSetItemDTO:** set_id, name, quantity?, note?, sort_order?. Przy dodawaniu z StickyInput: set_id, name; sort_order = items.length lub max(sort_order)+1.

---

## 8. Stan i hook useSetDetails

- **Zapytania:** set (getSetById), set-items (getSetItems); queryKey ["set", setId], ["set-items", setId]; networkMode: "offlineFirst".
- **Mutations:** addSetItem (optimistic: dopisanie wiersza z tymczasowym id do listy; pendingIds), updateSetItem (optimistic: podmiana wiersza w cache), deleteSetItem (optimistic: usunięcie z listy). Rollback w onError gdy błąd nie jest sieciowy (isNetworkError – analogia useListDetails).
- **Eksport:** set, items, isLoading, error, addItem(name), updateItem(itemId, { name?, quantity?, note? }), deleteItem(itemId), refetch, pendingIds, isSubmitting. Opcjonalnie: renameSet(name), deleteSet() z przekierowaniem na /sets.

---

## 9. Kryteria akceptacji i testy

- Wejście na `/sets/:setId` (z prawidłowym id zestawu) pokazuje nagłówek z przyciskiem Wstecz, etykietą „TRYB SZABLONU”, nazwą zestawu oraz listę pozycji i Sticky Input.
- Klik „Wstecz” prowadzi do `/sets`.
- Dodanie pozycji: wpisanie nazwy w Sticky Input i Enter/Dodaj – pozycja pojawia się na liście (optimistic); przy braku sieci element ma obniżoną opacity do czasu synchronizacji.
- Edycja pozycji (menu → Edycja): zmiana nazwy/ilości/notatki zapisuje się (updateSetItem); optimistic update.
- Usunięcie pozycji (menu → Usuń): pozycja znika z listy (optimistic).
- Walidacja Sticky Input: puste pole + Enter wywołuje komunikat i pulsowanie (jak w list-details).
- Bottom Nav nie jest widoczny na `/sets/:setId`.
- Stan błędu / brak zestawu: komunikat i przycisk „Wróć do zestawów”.

---

## 10. Kolejność wdrożenia

1. **SetsService:** Dodać getSetById(setId). (Opcjonalnie: updateSet, deleteSet.)
2. **useSetDetails:** Nowy hook – zapytania set + set-items, mutacje add/update/delete z optimistic updates i pendingIds.
3. **SetDetailsHeader:** Komponent z Wstecz, „TRYB SZABLONU”, nazwa zestawu, opcjonalne menu (Zmień nazwę, Usuń zestaw – callbacks puste lub podpięte do dialogów).
4. **SetItemRow:** Wiersz bez checkboxa: nazwa, ilość/notatka, menu Edycja (modal lub inline), Usuń; isPending.
5. **SetItemsList:** Lista SetItemRow; przekazanie items, pendingIds, onUpdate, onDelete.
6. **sets.$setId.tsx:** Podłączenie auth, useSetDetails, SetDetailsHeader, SetItemsList, StickyInputBar; obsługa loading i error.
7. Weryfikacja ukrycia Bottom Nav na `/sets/:setId` (już zapewnione przez MainLayout).
8. Opcjonalnie: dialog Zmień nazwę zestawu i Usuń zestaw (z updateSet/deleteSet); opcjonalnie sortowanie drag-and-drop (updateSetItem w pętli po nowej kolejności).

---

## 11. Uwagi i ryzyka

- **getSetById:** Obecnie brak w SetsService – konieczne rozszerzenie; RLS na tabeli `sets` (przez set_members) pozwala na select po id bez ujawniania cudzych zestawów.
- **Współdzielenie komponentu wiersza:** ListItemRow jest zoptymalizowany pod listę (checkbox, is_bought). Osobny SetItemRow unika skomplikowanych warunków i zmniejsza ryzyko błędów w widoku listy. Ewentualna późniejsza ekstrakcja wspólnego „ProductRow” (nazwa, ilość, notatka) z wariantami list/set jest możliwa, ale nie wymagana w MVP.
- **Sortowanie:** W MVP kolejność z API (sort_order) jest wyświetlana; zmiana kolejności (drag-and-drop) może być dodana w tej samej części (analogia do reorderItems w listach) lub w późniejszym etapie. set_items mają kolumnę sort_order (double precision).
- **Offline:** networkMode: "offlineFirst" i rollback tylko przy błędach innych niż sieciowe zapewniają spójność z Optimistic UI; pełna synchronizacja po powrocie sieci to zakres części 9 (sync-ux).
- **Nawigacja z pulpitu zestawów:** Na `/sets` karty zestawów powinny linkować do `/sets/$setId` (np. Link lub navigate po kliknięciu karty) – jeśli jeszcze nie zaimplementowane w części 5, dodać w tej części lub w części 5.
