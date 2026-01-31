# Pełny plan wdrożenia: Widok Szczegółów Listy (List Details)

**Odniesienie:** ui-plan.md §2.3, §5.1, §5.2; impl-plan-04-list-details  
**Ścieżka:** `/lists/:listId`  
**Część:** 4 – Szczegóły listy

---

## 1. Cel i zakres

**Cel:** Wdrożenie widoku szczegółów listy zakupów umożliwiającego zarządzanie produktami na liście, realizację zakupów (oznaczanie jako kupione) oraz podstawowe akcje na liście (udostępnianie, archiwizacja, zmiana nazwy).

**Zakres:**
- Nagłówek z nazwą listy, przyciskiem Wstecz, miejscem na SyncStatusIndicator oraz menu (Udostępnij, Utwórz zestaw, Zmień nazwę, Zakończ zakupy).
- Lista aktywnych produktów (do kupienia) oraz sekcja „Kupione” z wyszarzonymi pozycjami.
- Wiersz produktu (ListItemRow): checkbox, nazwa, ilość/notatka, drag handle, menu (Usuń).
- StickyInputBar przyklejony do dołu ekranu do dodawania produktów.
- Optimistic UI: natychmiastowe odzwierciedlenie dodania/zmiany z obniżoną opacity dla niesynchronizowanych elementów.
- Wykrywanie duplikatów: przy dodaniu produktu o istniejącej nazwie – ItemConflictDialog z edycją ilości (updateItem zamiast createItem).
- Archiwizacja z potwierdzeniem i przekierowaniem na `/lists`.
- Placeholdery: ShareModal (część 8), SyncStatusIndicator (część 9), ewentualnie swipe-to-delete i long-press (część 9).

---

## 2. Wymagania (User Stories i kryteria akceptacji)

| Id   | User Story | Kryterium |
|------|------------|-----------|
| US-007 | Dodawanie produktu | Pole tekstowe; opcjonalnie ilość/notatka; produkt pojawia się na liście. |
| US-008 | Optimistic UI | Produkt pojawia się natychmiast; synchronizacja po odzyskaniu połączenia. |
| US-009 | Oznaczanie jako kupione | Checkbox (lub swipe); produkt w sekcji Kupione, wyszarzony. |
| US-010 | Obsługa duplikatów | Wykrywanie duplikatu nazwy; ConflictModal z edycją ilości; nadpisanie ilości (updateItem). |
| US-011 | Sortowanie | Drag & drop; zapis nowej kolejności (reorderItems). |

**Kryteria ukończenia widoku (impl-plan-04):**
- Widok ma nagłówek z miejscem na sync, listę aktywną, sekcję Kupione, StickyInput.
- Optimistic UI dla dodawania i toggle (opacity dla niesynchronizowanych).
- Share/Archive podpięte do modali lub placeholderów (część 8).

---

## 3. Architektura i zależności

- **Route:** TanStack Router, plik `lists.$listId.tsx` (ścieżka `/lists/:listId`).
- **Dane:** TanStack Query (`useQuery` / `useMutation`) z `networkMode: "offlineFirst"`; serwisy `listsService`, `listItemsService`.
- **UI:** React, Tailwind CSS, komponenty shadcn/ui (Button, Input, Dialog, Checkbox, DropdownMenu, Separator).
- **Typy:** `domain.types.ts` (ListItem, CreateListItemDTO, UpdateListItemDTO, SingleItemConflictState), `database.types.ts` (list_items Row).
- **Zależności między częściami:** ShareModal w części 8; SyncStatusIndicator w części 9; opcjonalnie swipe-to-delete i long-press w części 9.

---

## 4. Stan obecny (co już jest zaimplementowane)

- **ListItemsService:** getItemsByListId, createItem, updateItem, deleteItem, reorderItems, bulkCreateItems.
- **ListsService:** getListById, completeShoppingTrip, shareListWithEmail, updateList.
- **useListDetails:** pobieranie listy i pozycji, activeItems/completedItems, createItem/updateItem/deleteItem z optimistic updates, pendingIds, obsługa duplikatów (conflictState, resolveConflict, cancelConflict), archiveList.
- **ListDetailsHeader:** Wstecz, nazwa listy, placeholder na SyncStatusIndicator, menu (Udostępnij, Utwórz zestaw, Zmień nazwę, Zakończ zakupy).
- **ListItemRow:** checkbox, nazwa, ilość/notatka, GripVertical (drag handle), menu Usuń, isPending → opacity-70.
- **ActiveItemsList / CompletedItemsSection:** lista ListItemRow z onToggle, onDelete, pendingIds.
- **StickyInputBar:** pole tekstowe, Enter = Dodaj, walidacja (niepusty tekst), feedback przy błędzie (animate-pulse, komunikat).
- **ItemConflictDialog:** pole Ilość wypełnione existingItem.quantity, onConfirm(combinedQuantity), onCancel.
- **lists.$listId.tsx:** auth check, useListDetails, ListDetailsHeader (onShare → placeholder, onArchive → confirm dialog, onCreateSet/onRename puste), ActiveItemsList, CompletedItemsSection, StickyInputBar, ItemConflictDialog, dialog archiwizacji, dialog Udostępnij (placeholder).

---

## 5. Szczegółowy podział zadań

### 5.1. ListDetailsHeader
- Zachować: Wstecz, nazwa listy, Menu (Udostępnij, Utwórz zestaw, Zakończ zakupy/Archiwizuj).
- Miejsce na SyncStatusIndicator: już zarezerwowane (placeholder div); w części 9 podmiana na komponent.
- Opcjonalnie: pozycja „Zmień nazwę” w menu – już obecna (`onRename`); w widoku przekazywane `onRename={() => {}}`; do dopracowania: inline lub modal zmiany nazwy (np. wywołanie listsService.updateList + invalidacja).

### 5.2. SyncStatusIndicator (placeholder)
- Zarezerwowane w nagłówku; w części 9 pełna implementacja (zielony/pomarańczowy/czerwony).

### 5.3. ListItemRow
- Lewa: checkbox; środek: nazwa, ilość/notatka; prawa: drag handle (GripVertical), menu (Usuń). Tap zmienia checkbox.
- Long-press i swipe-to-delete: w części 9; obecnie wystarczy menu kontekstowe z „Usuń”.

### 5.4. StickyInputBar
- Przyklejony nad dolną nawigacją / do dołu ekranu (sticky bottom, pb-safe-area-bottom).
- Walidacja: niepusty tekst; Enter = Dodaj; feedback przy błędzie (pulsowanie, komunikat) – zaimplementowane.

### 5.5. Sekcja Kupione
- CompletedItemsSection: nagłówek „Kupione (N)”, Separator, wyszarzone ListItemRow (opacity-60, line-through). Toggle przenosi z powrotem do aktywnych – realizowane przez ten sam onToggle w useListDetails.

### 5.6. Optimistic UI
- useListDetails: createItemMutation, updateItemMutation, deleteItemMutation z onMutate (optimistic update), onError (rollback przy błędzie innym niż sieciowy), onSettled (usunięcie id z pendingIds).
- ListItemRow otrzymuje isPending; przy isPending stosowana opacity-70.

### 5.7. Integracja akcji nagłówka
- onShare → otwarcie ShareModal (część 8); do czasu wdrożenia – dialog placeholder „Udostępnianie listy – wkrótce”.
- onArchive → modal potwierdzenia + listsService.completeShoppingTrip + invalidacja zapytań + redirect na `/lists` – zaimplementowane.
- onCreateSet → nawigacja do flow „Utwórz zestaw z listy” lub modal; można zostawić pustą akcję do części zestawów.
- onRename → opcjonalnie modal/inline edycja nazwy + updateList + invalidacja.

---

## 6. Komponenty i zmiany w plikach

| Komponent / plik | Odpowiedzialność | Zmiany względem obecnego stanu |
|------------------|------------------|---------------------------------|
| `ListDetailsHeader.tsx` | Wstecz, nazwa, placeholder sync, menu | Ewentualnie dodać slot na przyszły SyncStatusIndicator (już jest placeholder). |
| `ListItemRow.tsx` | Checkbox, nazwa, ilość/notatka, handle, menu Usuń, isPending | Brak zmian wymaganych w ramach części 4; drag-and-drop w US-011 można dodać w tej samej części lub w 9. |
| `ActiveItemsList.tsx` | Lista aktywnych pozycji | Bez zmian. |
| `CompletedItemsSection.tsx` | Sekcja „Kupione” | Bez zmian. |
| `StickyInputBar.tsx` | Formularz dodawania produktu | Bez zmian. |
| `ItemConflictDialog.tsx` | Modal duplikatu – edycja ilości | Bez zmian. |
| `lists.$listId.tsx` | Strona widoku listy | Podłączenie onRename (opcjonalnie: modal zmiany nazwy). Upewnienie, że Share i Archive są podpięte (już są). |

---

## 7. Serwisy i API

- **listItemsService:** getItemsByListId(listId), createItem(CreateListItemDTO), updateItem(UpdateListItemDTO), deleteItem(itemId), reorderItems(items). Duplikaty: po stronie UI wykrywanie po nazwie (case-insensitive) w activeItems → wywołanie updateItem (merge quantity), nie createItem.
- **listsService:** getListById(listId), updateList(listId, { name }), completeShoppingTrip(listId), shareListWithEmail(listId, email). completeShoppingTrip wywołuje RPC archive_list_items (db-plan).

---

## 8. Stan i hook useListDetails

- **Zapytania:** list (getListById), list-items (getItemsByListId); networkMode: "offlineFirst".
- **Pochodne:** activeItems = items.filter(!is_bought), completedItems = items.filter(is_bought).
- **Mutations:** createItem, updateItem, deleteItem z optimistic update i pendingIds; rollback przy błędzie (z wyłączeniem błędów sieciowych).
- **Duplikaty:** conflictState (isOpen, conflictingItem, pendingName); handleAddItem sprawdza duplikat → ustawia conflictState; resolveConflict wywołuje updateItem(quantity) i zamyka modal.
- **Eksport:** list, activeItems, completedItems, pendingIds, isLoading, error, addItem, toggleItem, deleteItem, conflictState, resolveConflict, cancelConflict, isSubmitting, archiveList. Ewentualnie rozszerzenie o updateList (nazwa) i reorderItems gdy dodamy drag-and-drop.

---

## 9. Kryteria akceptacji i testy

- Wejście na `/lists/:listId` pokazuje nagłówek z nazwą listy, listę aktywnych, sekcję Kupione (jeśli są kupione), StickyInput.
- Dodanie produktu: wpisanie nazwy i Enter/Dodaj – produkt pojawia się od razu (optimistic); przy braku sieci element ma obniżoną opacity do czasu sync.
- Dodanie produktu o tej samej nazwie (aktywnego) otwiera ItemConflictDialog; zatwierdzenie z ilością aktualizuje istniejącą pozycję (updateItem).
- Zaznaczenie checkboxa przenosi pozycję do sekcji Kupione (wyszarzenie); odznaczenie przywraca do aktywnych.
- Usunięcie z menu kontekstowego usuwa pozycję z listy (optimistic).
- Menu nagłówka: Udostępnij → placeholder (docelowo ShareModal); Zakończ zakupy → potwierdzenie → archiwizacja i redirect na `/lists`.
- Walidacja StickyInput: puste pole + Enter wywołuje komunikat i pulsowanie.

---

## 10. Kolejność wdrożenia

1. Upewnienie się, że wszystkie komponenty (Header, ActiveItemsList, CompletedItemsSection, ListItemRow, StickyInputBar, ItemConflictDialog) są podłączone w `lists.$listId.tsx` i że useListDetails obsługuje optimistic UI oraz duplikaty.
2. Weryfikacja archiwizacji (completeShoppingTrip, modal, redirect) oraz placeholderów Share / Utwórz zestaw.
3. Opcjonalnie: implementacja „Zmień nazwę” (modal lub inline) z użyciem listsService.updateList i invalidacji zapytań.
4. Opcjonalnie w tej części lub w części 9: drag-and-drop (np. @dnd-kit) z wywołaniem reorderItems po upuszczeniu.

---

## 11. Uwagi i ryzyka

- **ShareModal / SyncStatusIndicator:** Świadomie pozostawione jako placeholdery do części 8 i 9; nie blokują uznania części 4 za ukończoną.
- **Drag-and-drop (US-011):** Serwis reorderItems jest gotowy; brak biblioteki DnD w projekcie – można dodać @dnd-kit/core lub podobną w ramach części 4 lub 9.
- **Offline:** networkMode: "offlineFirst" i rollback tylko przy błędach innych niż sieciowe zapewniają zgodność z US-008; pełna synchronizacja po powrocie sieci to zakres części 9.
- **Zmiana nazwy listy:** Wymaga sprawdzenia RLS dla update listów (już w db-plan); frontendowo wystarczy wywołanie updateList i invalidacja ["list", listId].
