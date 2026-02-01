Które elementy tego fragmentu projektu warto przetestować z wykorzystaniem unit testów i dlaczego?
Weź pod uwagę załączone dokumenty:
@.ai/prd.md @.ai/test-plan.md @.ai/tech-stack.md @.ai/ui-plan-parts.md @.ai/ui-plan.md 

===

response:

Mając pełny obraz projektu, poniżej rekomendacje co warto objąć unit testami i dlaczego.

---

# Co warto testować unit testami w QuickShop (i dlaczego)

Rekomendacje są spójne z **test-plan.md**, **PRD** i **ui-plan**: priorytetem jest logika biznesowa i stanowa, która łatwo się wyizolować i która ma duży wpływ na zachowanie aplikacji.

---

## 1. **Logika czysta (pure functions) – najwyższy priorytet**

### 1.1 Wykrywanie duplikatów (lista / zestaw)

- **Gdzie:** `useListDetails.ts` – `handleAddItem` (porównanie nazw case-insensitive); `AddSetToListDialog.tsx` – pętla budująca `conflictsOut` / `nonConflictingOut` i `suggestedQuantity`.
- **Dlaczego:** PRD (US-010) i ui-plan wymagają, żeby duplikaty były traktowane jako jedna pozycja; decyzje użytkownika (np. zsumowanie ilości) zależą od poprawnego wykrycia.
- **Rekomendacja:** Wyciągnąć do modułu typu `conflictUtils.ts` lub `duplicateUtils.ts`:
  - `findDuplicateOnList(items, name)` → istniejący item lub `null`
  - `computeSetConflicts(activeListItems, setItems)` → `{ conflicts: SetConflictItem[], nonConflicting: CreateListItemDTO[] }`, w tym `suggestedQuantity` jako `[existing.quantity, setItem.quantity].filter(Boolean).join("+") || "—"`.
- **Testy:** Różne kombinacje: brak duplikatu, duplikat z tą samą / inną wielkością liter, puste/`null` ilości, wiele konfliktów. To daje największą wartość przy minimalnym koszcie (brak React, brak Supabase).

### 1.2 Obliczanie `suggestedQuantity` przy konflikcie zestawu

- **Gdzie:** `AddSetToListDialog.tsx` (linie 89–91).
- **Dlaczego:** ui-plan i PRD (US-014) definiują konkatenację ilości przy ponownym dodaniu zestawu; błąd tutaj to zła ilość na liście.
- **Rekomendacja:** Jedna funkcja, np. `suggestedQuantityForConflict(existingQuantity, newQuantity)` i unit testy dla: oba puste → `"—"`, jedno puste, oba wypełnione, wartości z spacjami itd.

### 1.3 Klasyfikacja błędu sieciowego (`isNetworkError`)

- **Gdzie:** `useListDetails.ts` i `useSetDetails.ts` – prawie identyczna funkcja.
- **Dlaczego:** Od tego zależy rollback optimistic update (test-plan, ITEM-02): przy błędzie sieci nie cofamy cache’u, przy innych błędach – tak.
- **Rekomendacja:** Jedna funkcja w np. `networkUtils.ts`: `isNetworkError(error: unknown): boolean`. Testy: `TypeError`, `message === "Failed to fetch"`, brak `status`, `navigator.onLine === false`, błąd z `status: 500` (nie traktowany jako sieciowy).

### 1.4 Stan synchronizacji (`syncStatus`)

- **Gdzie:** `useListDetails.ts` – `syncStatus` złożony z `lastMutationError`, `isOnline`, `pendingIds`, `isAnyMutationPending`.
- **Dlaczego:** ui-plan §5.3 (SyncStatusIndicator) i UX offline: użytkownik musi widzieć poprawne stany „zsync”, „syncing”, „error”.
- **Rekomendacja:** Wyciągnąć do `computeSyncStatus({ lastMutationError, isOnline, pendingIdsSize, isAnyMutationPending }): SyncStatus` i testować wszystkie kombinacje (np. offline + pending → syncing; online + error → error; brak pending i błędu → synced).

---

## 2. **Mapowanie danych / ViewModels**

### 2.1 Lista → `ListViewModel`

- **Gdzie:** `useListsView.ts` – w `queryFn` dla każdej listy: `totalItems`, `boughtItems`, `isShared: list.created_by !== currentUserId`.
- **Dlaczego:** test-plan mówi o „przeliczaniu statusu listy”; błędne `boughtItems`/`totalItems` psuje UI kart list.
- **Rekomendacja:** Funkcja `toListViewModel(list, items, currentUserId): ListViewModel`. Unit testy: lista bez itemów, tylko kupione, tylko do kupienia, mieszane; `isShared` true/false w zależności od `currentUserId`.

### 2.2 Mapowanie członków listy (`getListMembers`)

- **Gdzie:** `lists.service.ts` – `.map` z `row.profiles` na `email`, `full_name`.
- **Dlaczego:** Niepoprawne mapowanie = błędne dane w ShareModal (ui-plan §5.5).
- **Rekomendacja:** Albo test jednostkowy z mockowaną odpowiedzią Supabase (tylko weryfikacja transformacji), albo krótki test integracyjny; priorytet niższy niż konflikty/sync.

---

## 3. **Serwisy (`items`, `lists`, `sets`, `history`)**

- **Dlaczego w planie:** test-plan wymienia je w „Unit Tests – Pokrycie”.
- **W praktyce:** Serwisy to głównie wywołania Supabase (CRUD). Same w sobie nie zawierają skomplikowanej logiki; ewentualne edge case’y to np. `listsService.createList` (kolejność: insert list → RPC `invite_member_to_list`) i obsługa błędów.
- **Rekomendacja:**
  - **Unit z mockiem Supabase:** weryfikacja, że wywoływane są właściwe tabele, filtry i że błędy są propagowane; sensowne dla krytycznych ścieżek (np. `createList`, `shareListWithEmail`).
  - **Priorytet niższy** niż logika z punktu 1; lepiej najpierw wyekstrahować i przetestować pure functions (konflikty, sync, duplikaty).

---

## 4. **Hooki (`useListDetails`, `useListsView`)**

- **useListDetails:** Dużo logiki (optimistic updates, mutacje, `handleAddItem`, `resolveConflict`, `syncStatus`). Pełne unit testy hooka wymagają `QueryClientProvider`, mocków serwisów i są bliżej testów integracyjnych (test-plan §3.2).
- **Rekomendacja:** Nie pisać od razu wielkich unit testów hooków. Zamiast tego:
  - Wyciągnąć z hooków czyste funkcje (duplikaty, sync status, ewentualnie kształt optimistic item) i testować je jako unit (punkt 1).
  - Hooki testować testami integracyjnymi (Vitest + RTL) z mockowanymi serwisami, jak w test-plan §3.2.

---

## 5. **`lib/utils.ts` (`cn`)**

- **Dlaczego:** test-plan wymienia „Funkcje pomocnicze w lib/utils.ts”.
- **W praktyce:** `cn` to opakowanie na `clsx` + `twMerge`; ryzyko regresji niskie.
- **Rekomendacja:** Opcjonalnie jeden prosty test (np. łączenie klas, nadpisywanie konfliktów Tailwind). Niski priorytet.

---

## 6. **Podsumowanie priorytetów**

| Priorytet | Element | Powód |
|-----------|--------|--------|
| **Krytyczny** | Pure functions: wykrywanie duplikatów + konflikty zestawów + `suggestedQuantity` | Bezpośrednio US-010, US-014 i ui-plan; łatwe do wyizolowania, wysokie ryzyko błędu. |
| **Wysoki** | `isNetworkError` + `computeSyncStatus` | Decydują o rollbacku optimistic UI i SyncStatusIndicator (offline/sync). |
| **Średni** | `toListViewModel` (totalItems, boughtItems, isShared) | Poprawność widoku list; łatwa do wyekstrahowania. |
| **Średni** | Serwisy z mockiem Supabase (wybrane ścieżki) | Pewność, że wywołania API i obsługa błędów są poprawne. |
| **Niski** | `cn()` | Wymóg z planu, mała wartość biznesowa. |

Największy zysk daje **wyciągnięcie logiki konfliktów/duplikatów i syncu do małych modułów z czystymi funkcjami** i pokrycie ich unit testami; serwisy i hooki można dalej testować zgodnie z test-planem (unit z mockami / integracja z RTL).





===============


Jesteś doświadocznym programistą typescript. Przenalizuje dokładnie kod projektu. Zaproponuj plan implementacji dla punktów 1.1 i 1.2. Pamiętaj o zachowaniu najlepszych praktyk programowania i archtektury. Gdzie to konieczne wyodrębnij modele DTO dla parametrów oraz wartości zwracanych.