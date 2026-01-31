# Szczegółowy plan wdrożenia: Część 9 – SyncStatusIndicator i dopracowanie UX

**Odniesienie:** ui-plan.md §5.3, §2.3 (optimistic, swipe, long-press), §5.1 (StickyInput)  
**Część:** 9 – SyncStatusIndicator i dopracowanie UX  
**Dokument:** Plan implementacji dla programisty frontendowego

---

## 1. Cel i zakres

Wdrożenie wskaźnika stanu synchronizacji w nagłówku oraz dopracowanie UX wiersza pozycji i paska dodawania produktu:

- **SyncStatusIndicator** – mała ikona/kropka w nagłówku szczegółów listy: trzy stany (zsynchronizowano / synchronizacja w toku lub offline / błąd) z możliwością kliknięcia przy błędzie (szczegóły lub „Ponów”).
- **ListItemRow** – swipe-to-delete (mobile: czerwone tło + kosz; desktop: fallback – menu lub ikona), long-press → modal edycji (ilość, notatka).
- **StickyInputBar** – walidacja niepustego tekstu przed dodaniem, Enter = submit, czytelny feedback przy błędzie (pulsowanie, komunikat „Wpisz nazwę produktu”).
- **Optimistic UI** – elementy w trakcie synchronizacji (pending) z obniżoną opacity; spójność ze SyncStatusIndicator.

---

## 2. Odniesienia

- **PRD:** `.ai/prd.md` – US-007 (dodawanie), US-008 (Optimistic UI, offline), US-009 (oznaczanie kupione, swipe), US-010 (edycja ilości), US-016 (synchronizacja, stan w UI).
- **ui-plan:** §2.3 (Optimistic UI, swipe-to-delete, long-press), §5.1 (StickyInput – walidacja, Enter, feedback), §5.2 (ListItemRow – tap, long-press, swipe left), §5.3 (SyncStatusIndicator – trzy stany).
- **Plan bazowy:** `.ai/impl-plan-09-sync-ux.md`.
- **Typy:** `code/src/types/domain.types.ts` (ListItem, UpdateListItemDTO), `code/src/db/database.types.ts`.
- **Tech stack:** React + Vite, Tailwind, shadcn/ui, TanStack Query, Supabase, opcjonalnie react-swipeable lub natywne touch events.

---

## 3. Stan obecny

- **SyncStatusIndicator** – brak. W `ListDetailsHeader.tsx` jest placeholder: `<div className="h-1 w-4 mt-0.5" aria-hidden title="Status synchronizacji – wkrótce" />`.
- **ListItemRow** – istnieje w `code/src/components/list-details/ListItemRow.tsx`. Ma: checkbox, nazwę, ilość/notatkę, drag handle, **DropdownMenu** z opcją „Usuń”. **isPending** → `opacity-70`. Brak swipe-to-delete, brak long-press i modala edycji ilości/notatki (w zestawach jest SetItemRow z takim modalem).
- **StickyInputBar** – w `code/src/components/list-details/StickyInputBar.tsx`. Już ma: walidację (trim, pusty → `setShowError`), Enter = submit (form onSubmit), feedback przy błędzie: `animate-pulse`, `ring-destructive`, `aria-invalid`, komunikat „Wpisz nazwę produktu” pod polem. Zgodne z planem; ewentualne dopracowanie (np. krótszy timeout 600 ms, sprawdzenie dostępności).
- **useListDetails** – mutacje: createItem, updateItem, deleteItem, reorderItems; każda ma `scope`, `networkMode: "offlineFirst"`, optimistic update i `pendingIds`. Eksportuje `isSubmitting` (createItemMutation.isPending || updateItemMutation.isPending) oraz `pendingIds`. Brak agregacji „czy jakakolwiek mutacja jest pending” ani „czy jest błąd ostatniej mutacji” na potrzeby SyncStatusIndicator.
- **ActiveItemsList** – przekazuje `pendingIds` do `ListItemRow`; drag-and-drop przez @dnd-kit. ListItemRow nie ma opcji edycji (ilość, notatka) – tylko Usuń w menu.

---

## 4. Wymagania funkcjonalne (User Stories)

- **US-008** – Optimistic UI: pozycje dodane offline synchronizowane po odzyskaniu połączenia; stan sync w UI.
- **US-016** – Synchronizacja po odzyskaniu: wykrywanie powrotu łączności, wysyłka lokalnych zmian, odzwierciedlenie stanu w UI.
- **US-009** – Oznaczanie jako kupione: swipe zmienia status; swipe-to-delete dla usuwania.
- **US-007 / US-010** – Edycja ilości/notatki (long-press), walidacja pola dodawania produktu.

---

## 5. Zadania – SyncStatusIndicator

1. **Nowy komponent**
   - Ścieżka: `code/src/components/list-details/SyncStatusIndicator.tsx` lub `code/src/components/layout/SyncStatusIndicator.tsx` (zgodnie z impl-plan).
   - **Props:** np. `status: 'synced' | 'syncing' | 'error'`, opcjonalnie `error?: Error | null`, `onRetry?: () => void`. Alternatywnie: przyjmuje tylko `listId` i wewnętrznie używa hooka `useSyncStatus(listId)`.

2. **Trzy stany wizualne**
   - **Zsynchronizowano (synced):** zielona kropka lub ikona check; można ukryć gdy synced (wg ui-plan „Zielony/Ukryty”).
   - **Synchronizacja w toku / offline (syncing):** pomarańczowa kropka/ikona, animacja pulsowania.
   - **Błąd (error):** czerwona kropka/ikona; kliknięcie otwiera tooltip/popover z komunikatem błędu i przyciskiem „Ponów” (wywołanie `onRetry` lub retry z hooka).

3. **Źródło stanu**
   - **Hook `useSyncStatus(listId)`** (opcjonalnie w `code/src/hooks/useSyncStatus.ts`):  
     - Czy są pending mutations dla tej listy: np. `useMutationState` (TanStack Query v5) po `mutationKey` zawierającym `listId`, lub przekazanie z `useListDetails`: `isSubmitting`, `isReordering` oraz ewentualnie flagi „hasPendingMutations” jeśli hook agreguje wiele mutacji.  
     - Offline: `navigator.onLine` + opcjonalnie `window.addEventListener('online'/'offline')`; gdy offline i są zmiany w kolejkę → stan „syncing”.  
     - Błąd: ostatni błąd mutacji (np. z `useMutationState` lub przekazany z rodzica).  
   - Alternatywa bez osobnego hooka: w `lists.$listId.tsx` wyliczyć stan z `useListDetails` (isSubmitting, isReordering, error z mutacji) oraz `navigator.onLine`, i przekazać do `<SyncStatusIndicator status={...} error={...} onRetry={...} />`.

4. **Umieszczenie**
   - W `ListDetailsHeader`: zastąpić placeholder `<div ... title="Status synchronizacji – wkrótce" />` komponentem `<SyncStatusIndicator ... />`. ListDetailsHeader musi otrzymać props: np. `syncStatus`, `syncError`, `onSyncRetry` – lub sam `listId` jeśli SyncStatusIndicator korzysta z useSyncStatus(listId).

**Kroki implementacyjne:**
- Zdefiniować typ stanu: `type SyncStatus = 'synced' | 'syncing' | 'error'`.
- Zaimplementować `SyncStatusIndicator.tsx`: render kropki/ikony w zależności od statusu, przy error – klikalny obszar z popover/tooltip (szczegóły błędu + przycisk Ponów).
- Dodać w `useListDetails` (lub w osobnym `useSyncStatus`) agregację: `isAnyMutationPending = createItemMutation.isPending || updateItemMutation.isPending || deleteItemMutation.isPending || reorderItemsMutation.isPending`; oraz przechowanie ostatniego błędu mutacji (np. `mutationError` z onError). Uwzględnić `navigator.onLine`: gdy offline i (pending lub kolejka) → syncing; gdy błąd → error; w przeciwnym razie → synced.
- W `lists.$listId.tsx` przekazać do ListDetailsHeader: syncStatus, syncError, onSyncRetry (np. invalidateQueries + reset mutacji lub retry).
- W ListDetailsHeader dodać props i render SyncStatusIndicator.

---

## 6. Zadania – ListItemRow: Swipe-to-delete

1. **Zachowanie na mobile**
   - Swipe w lewo odsłania czerwone tło + ikona kosza (Trash2).
   - Po pełnym swipe: potwierdzenie (np. przycisk „Usuń”) lub natychmiastowe usunięcie (wg ui-plan „potwierdzenie lub natychmiastowe usunięcie”).

2. **Implementacja**
   - **Opcja A:** biblioteka `react-swipeable` (onSwipedLeft, render overlay z czerwonym tłem i ikoną).
   - **Opcja B:** natywne touch events (onTouchStart, onTouchMove, onTouchEnd) + CSS transform (translateX); kontener z overflow hidden, wewnątrz warstwa czerwona + ikona, na wierzchu zawartość wiersza.
   - Wykrywanie mobile vs desktop: media query lub `window.matchMedia('(pointer: coarse)')`; na desktop wyświetlać fallback (obecne menu z „Usuń” lub ikona kosza przy hover).

3. **Integracja**
   - ListItemRow już ma `onDelete(item.id)`; swipe po przekroczeniu progu wywołuje `onDelete(item.id)` lub pokazuje przycisk „Usuń” w odsłoniętym obszarze.
   - Zachować zgodność z drag-and-drop (DnD): swipe nie powinien uruchamiać drag; activationConstraint w PointerSensor (distance: 8) już ogranicza przypadkowe przeciąganie. Swipe w poziomie nie koliduje z vertical drag.

**Kroki implementacyjne:**
- Dodać wrapper w ListItemRow (lub w ActiveItemsList dla SortableRow): kontener z pozycją relative, wewnątrz „action” div (czerwone tło + Trash2) po lewej, następnie zawartość wiersza. Na mobile: obsługa swipe (react-swipeable lub touch events) i ustawienie translateX; po zwolnieniu powyżej progu → onDelete.
- Desktop: bez zmiany – DropdownMenu z „Usuń” (i ewentualnie ikona kosza przy hover jako ulepszenie).

---

## 7. Zadania – ListItemRow: Long-press → modal edycji

1. **Zachowanie**
   - Long-press na wierszu (lub na obszarze nazwy/ilości) otwiera modal edycji: pola Ilość, Notatka (nazwa może być tylko do odczytu lub edytowalna – wg PRD ilość/notatka).
   - Zatwierdzenie → `updateItem(item.id, { quantity, note })` (useListDetails.updateItemMutation).

2. **Implementacja**
   - **Touch:** onTouchStart → start timera (~500 ms); onTouchEnd/onTouchCancel → clear timer. Po 500 ms bez zwolnienia → otwarcie modala.
   - **Desktop:** right-click (onContextMenu) otwiera modal, lub przycisk „Edycja” w istniejącym DropdownMenu (obok „Usuń”).
   - Modal: Dialog z polami Input dla ilości i notatki (analogicznie do SetItemRow), przyciski Anuluj / Zapisz. Zapisz wywołuje `onUpdate(item.id, { quantity: value, note: value })`. ListItemRow nie ma dziś `onUpdate` – trzeba dodać callback z useListDetails (updateItem z payloadem quantity/note).

3. **Integracja z useListDetails**
   - useListDetails już ma `updateItemMutation` i `updateItem` przez `handleToggleItem` i inne. Dodać wywołanie updateItem z dowolnymi polami (name, quantity, note) – np. `updateItem(itemId, { quantity, note })`. Obecnie w widoku listy nie ma edycji ilości/notatki; tylko toggle i delete. Więc: w useListDetails udostępnić funkcję np. `updateItemFields(itemId, { quantity?, note? })` wywołującą updateItemMutation z odpowiednim UpdateListItemDTO.
   - ListItemRow: nowy prop `onUpdate?: (id: string, data: { quantity?: string | null; note?: string | null }) => void`. W ActiveItemsList/lists.$listId przekazać z useListDetails.

**Kroki implementacyjne:**
- W useListDetails: dodać (jeśli brak) możliwość aktualizacji quantity/note bez zmiany is_bought – np. `updateItemFields(itemId, { quantity, note })` wywołujące updateItemMutation z `{ id, quantity, note }`.
- W ListItemRow: stan `editModalOpen`, ref timera long-press. onTouchStart → setTimeout(openEdit, 500); onTouchEnd/onTouchCancel → clearTimeout. onContextMenu (preventDefault) → openEdit. W DropdownMenu dodać pozycję „Edycja” obok „Usuń”. Modal edycji (Dialog) z polami ilość/notatka i Zapisz → onUpdate(item.id, { quantity, note }).
- W ActiveItemsList / lists.$listId: przekazać onUpdate z hooka do ListItemRow (przez SortableRow).

---

## 8. Zadania – StickyInputBar: walidacja i feedback

1. **Weryfikacja obecnej implementacji**
   - Niepusty tekst: już – `trimmed` przed dodaniem; przy pustym submit `setShowError(true)`.
   - Enter = submit: już – form onSubmit.
   - Feedback: już – `showError` → animate-pulse, ring-destructive, `aria-invalid`, komunikat „Wpisz nazwę produktu” (`role="alert"`).

2. **Ewentualne dopracowania**
   - Czas wyświetlania błędu: obecnie `setTimeout(() => setShowError(false), 600)` – OK.
   - Upewnić się, że placeholder lub aria-describedby odwołuje się do id komunikatu błędu (już jest `aria-describedby={showError ? errorId : undefined}` i `<p id={errorId}>`).
   - Opcjonalnie: przy pierwszym pustym Enter dodać focus na input (np. ref i inputRef.current?.focus()) aby użytkownik od razu mógł wpisać.

**Kroki implementacyjne:**
- Przejrzeć StickyInputBar pod kątem dostępności (focus po błędzie, kolejność tab). Jeśli wszystko zgodne z planem – brak zmian lub minimalne (np. auto-focus po pokazaniu błędu).

---

## 9. Zadania – Optimistic UI (dopracowanie)

1. **Obniżona opacity dla pending**
   - ListItemRow już ma `isPending` → `opacity-70`. ActiveItemsList przekazuje `pendingIds` z useListDetails. Po sukcesie/błędzie mutacji pendingIds jest aktualizowane w onSettled. Stan obecny zgodny z planem.

2. **Spójność z SyncStatusIndicator**
   - Gdy są elementy w pendingIds lub jakakolwiek mutacja isPending, SyncStatusIndicator powinien być w stanie „syncing” (pomarańczowy, pulsujący). Źródło stanu w useSyncStatus/useListDetails: agregacja isPending z mutacji + ewentualnie offline.

**Kroki implementacyjne:**
- Upewnić się, że SyncStatusIndicator korzysta z tej samej logiki co pendingIds / isSubmitting (np. wszystkie mutacje listy w scope `list-${listId}`). Brak dodatkowych zmian w ListItemRow poza ewentualnym doprecyzowaniem opacity (np. 0.7 jak teraz).

---

## 10. Typy i API

- **domain.types.ts:** UpdateListItemDTO już zawiera `quantity?`, `note?` – wystarczy do modala edycji.
- **useListDetails:** zwracać dodatkowo: `updateItemFields?: (itemId: string, data: { quantity?: string | null; note?: string | null }) => void` (lub użyć istniejącego updateItemMutation.mutate z payloadem), oraz na potrzeby SyncStatusIndicator: `isAnyMutationPending`, `lastMutationError`, `syncStatus` (obliczony) – lub to w useSyncStatus.
- **ListItemRow:** nowe opcjonalne prop: `onUpdate?: (id: string, data: { quantity?: string | null; note?: string | null }) => void` dla long-press/edycji.
- **ListDetailsHeader:** nowe props: `syncStatus: SyncStatus`, `syncError?: Error | null`, `onSyncRetry?: () => void` (lub tylko `listId` jeśli SyncStatusIndicator sam używa hooka).

---

## 11. Kryteria ukończenia i kolejność wdrożenia

**Kryteria ukończenia:**
- SyncStatusIndicator pokazuje trzy stany (synced / syncing / error) i jest widoczny w ListDetailsHeader; przy błędzie klik otwiera szczegóły/„Ponów”.
- ListItemRow: swipe-to-delete na mobile (czerwone tło + kosz); desktop: fallback (menu „Usuń” lub ikona).
- ListItemRow: long-press (i desktop: Edycja w menu / right-click) otwiera modal edycji ilości/notatki; Zapisz → updateItem.
- StickyInputBar: walidacja niepustego tekstu, Enter = submit, feedback przy błędzie (pulsowanie, „Wpisz nazwę produktu”) – zweryfikowane/dopracowane.
- Optimistic UI: pending z obniżoną opacity; SyncStatusIndicator w stanie „syncing” gdy są pending mutacje.

**Kolejność wdrożenia:**
1. SyncStatusIndicator + useSyncStatus (lub agregacja w useListDetails) i integracja w ListDetailsHeader.
2. ListItemRow: long-press + modal edycji (ilość, notatka) + onUpdate z useListDetails.
3. ListItemRow: swipe-to-delete (mobile) + fallback desktop.
4. StickyInputBar: weryfikacja/drobne poprawki dostępności i focus.
5. Testy ręczne: sync (online/offline), błąd i Ponów, swipe usuwanie, long-press edycja, walidacja pola dodawania.

---

*Koniec planu. Analiza wewnętrzna (implementation_breakdown) nie jest uwzględniona w tym dokumencie.*
