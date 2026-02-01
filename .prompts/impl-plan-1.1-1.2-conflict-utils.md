# Plan implementacji: 1.1 Wykrywanie duplikatów + 1.2 suggestedQuantity (conflict utils)

Cel: wyodrębnienie czystej logiki wykrywania duplikatów i konfliktów zestawów do modułu z DTO, z możliwością pokrycia unit testami (find-unit-tests-candidates.md, punkty 1.1 i 1.2).

---

## 1. Architektura i lokalizacja

| Element | Lokalizacja | Uzasadnienie |
|--------|-------------|--------------|
| Moduł czystej logiki | `code/src/lib/conflictUtils.ts` | Spójne z `lib/utils.ts`; brak zależności od React/Supabase; jedna odpowiedzialność. |
| DTO wejścia/wyjścia | W tym samym pliku lub `types/domain.types.ts` | DTO używane tylko przez conflict utils → w `conflictUtils.ts`; jeśli używane w UI/serwisach → w `domain.types.ts`. |
| Testy | `code/src/lib/conflictUtils.test.ts` | Konwencja Vitest: plik obok modułu lub w `__tests__`. |

---

## 2. DTO (parametry i wyniki)

### 2.1 Wejście / wyjście dla listy (punkt 1.1 – pojedynczy item)

- **Wejście:** zwykłe parametry `(items, name)` – bez DTO (proste, czytelne).
- **Wyjście:** `ListItem | null` – już istniejący typ domenowy; nie wprowadzać nowego DTO.

Opcja rozszerzona (jeśli w przyszłości będzie potrzeba więcej danych):

```ts
// Opcjonalnie w domain.types.ts lub na końcu conflictUtils.ts
export interface FindDuplicateResult {
  existingItem: ListItem;
}
// Zwracać FindDuplicateResult | null zamiast ListItem | null
```

**Rekomendacja:** na start zwracać `ListItem | null`; DTO dodać tylko przy rozszerzeniu sygnatury.

### 2.2 Wejście dla konfliktów zestawu (punkt 1.1)

Potrzebne: lista aktywnych pozycji na liście, pozycje zestawu, `listId` (do budowy `CreateListItemDTO`).

```ts
// code/src/lib/conflictUtils.ts (lub types/domain.types.ts)

import type { CreateListItemDTO, ListItem, SetConflictItem } from "@/types/domain.types";
import type { Database } from "@/db/database.types";
type SetItem = Database["public"]["Tables"]["set_items"]["Row"];

/**
 * Parametry wywołania computeSetConflicts.
 * Umożliwia jasną sygnaturę i łatwe rozszerzenie (np. opcje normalizacji nazw).
 */
export interface ComputeSetConflictsInput {
  /** Aktywne pozycje na liście (np. listItems.filter(i => !i.is_bought)). */
  activeListItems: ListItem[];
  /** Pozycje zestawu do dodania. */
  setItems: SetItem[];
  /** ID listy docelowej (do pól list_id w CreateListItemDTO). */
  listId: string;
}
```

### 2.3 Wyjście dla konfliktów zestawu (punkt 1.1)

`SetConflictItem` i `CreateListItemDTO` są już w `domain.types.ts`. Wystarczy typ wyniku:

```ts
/**
 * Wynik podziału pozycji zestawu na konflikty i pozycje do utworzenia.
 */
export interface ComputeSetConflictsResult {
  conflicts: SetConflictItem[];
  nonConflicting: CreateListItemDTO[];
}
```

### 2.4 Punkt 1.2 – suggestedQuantity

Wejście/wyjście proste – dwa `string | null`, wynik `string`. DTO nie jest konieczne; ewentualnie dla czytelności testów:

```ts
/** Opcjonalnie – jeśli chcemy nazwać parametry w testach. */
export interface SuggestedQuantityInput {
  existingQuantity: string | null;
  newQuantity: string | null;
}
```

**Rekomendacja:** sygnatura `suggestedQuantityForConflict(existingQuantity: string | null, newQuantity: string | null): string` bez DTO.

---

## 3. API modułu `conflictUtils.ts`

### 3.1 Funkcje publiczne

| Funkcja | Sygnatura | Odpowiedzialność |
|---------|-----------|------------------|
| `findDuplicateOnList` | `(items: ListItem[], name: string) => ListItem \| null` | Szuka na liście pozycji o danej nazwie (case-insensitive), tylko **niekupione** (`!item.is_bought`). Zwraca znaleziony `ListItem` lub `null`. |
| `suggestedQuantityForConflict` | `(existingQuantity: string \| null, newQuantity: string \| null) => string` | Łączy ilości: `[existing, new].filter(Boolean).join("+")`; gdy brak wartości → `"—"`. |
| `computeSetConflicts` | `(input: ComputeSetConflictsInput) => ComputeSetConflictsResult` | Dla każdej pozycji zestawu: szuka duplikatu na liście (po nazwie); przy duplikacie buduje `SetConflictItem` z `suggestedQuantityForConflict`; bez duplikatu dodaje do `nonConflicting` jako `CreateListItemDTO`. |

### 3.2 Zależności między funkcjami

- `computeSetConflicts` wewnętrznie używa:
  - porównania nazw case-insensitive (ta sama reguła co `findDuplicateOnList`);
  - `suggestedQuantityForConflict(existing.quantity, setItem.quantity)` do pola `suggestedQuantity` w `SetConflictItem`.

- `findDuplicateOnList` jest niezależna (użycie w `useListDetails.handleAddItem`).

---

## 4. Kolejność implementacji

1. **DTO**  
   - Dodać `ComputeSetConflictsInput` i `ComputeSetConflictsResult` w `conflictUtils.ts` (albo w `domain.types.ts` jeśli uznasz, że są częścią kontraktu domenowego).

2. **suggestedQuantityForConflict (punkt 1.2)**  
   - Implementacja w `conflictUtils.ts`.  
   - Zachowanie:  
     - oba puste / null → `"—"`;  
     - jedno puste → drugie (po `.filter(Boolean)`);  
     - oba wypełnione → `existing + "+" + new`;  
     - opcjonalnie: trim wartości przed join (zgodnie z wymaganiami biznesowymi).

3. **findDuplicateOnList (punkt 1.1 – lista)**  
   - Implementacja w `conflictUtils.ts`.  
   - Logika: `items.find(item => item.name.toLowerCase() === name.toLowerCase() && !item.is_bought)`.

4. **computeSetConflicts (punkt 1.1 – zestaw)**  
   - Implementacja w `conflictUtils.ts`.  
   - Dla każdego `setItem`:  
     - szukaj w `activeListItems` po `name.toLowerCase()`;  
     - jeśli znaleziono: buduj `SetConflictItem` z `suggestedQuantity: suggestedQuantityForConflict(existing.quantity, setItem.quantity)`;  
     - jeśli nie: buduj `CreateListItemDTO` (list_id, name, quantity, note, is_bought: false, sort_order) i dodaj do `nonConflicting`.

5. **Refaktor miejsc użycia**  
   - `useListDetails.ts`: w `handleAddItem` wywołać `findDuplicateOnList(items, name)` zamiast inline `items.find(...)`.  
   - `AddSetToListDialog.tsx`: w `handleSelectList` zastąpić pętlę budującą `conflictsOut` / `nonConflictingOut` wywołaniem `computeSetConflicts({ activeListItems: activeOnList, setItems, listId })` i ustawieniem stanu z wyniku.

6. **Unit testy**  
   - `conflictUtils.test.ts`:  
     - **suggestedQuantityForConflict:** oba null, oba puste string, jedno puste, oba wypełnione, ze spacjami (jeśli trim), kilka wartości brzegowych.  
     - **findDuplicateOnList:** brak duplikatu, duplikat ta sama wielkość liter, inna wielkość, tylko niekupione, kupiony pomijany.  
     - **computeSetConflicts:** zero konfliktów, wszystkie konflikty, mieszanka; w konfliktach sprawdzić `suggestedQuantity` (np. "—", "1+2").

---

## 5. Najlepsze praktyki uwzględnione w planie

- **Single Responsibility:** jeden moduł = logika konfliktów/duplikatów.  
- **Czyste funkcje:** brak side-effectów, łatwe testy bez React/Supabase.  
- **Jawne DTO tam, gdzie sygnatura się rozrasta:** `ComputeSetConflictsInput`/`Result` zamiast wielu pozycyjnych argumentów.  
- **Brak nadmiarowych DTO:** `suggestedQuantityForConflict` i `findDuplicateOnList` z prostymi typami.  
- **Wykorzystanie istniejących typów:** `ListItem`, `SetItem`, `SetConflictItem`, `CreateListItemDTO` z `domain.types` / `database.types`.  
- **Spójna konwencja nazewnictwa:** `findDuplicateOnList`, `computeSetConflicts`, `suggestedQuantityForConflict` – czasownik + kontekst.  
- **Testowalność:** każda funkcja osobno; `computeSetConflicts` testowany z gotowymi tablicami.

---

## 6. Pliki do utworzenia / zmiany

| Akcja | Plik |
|-------|------|
| Utworzyć | `code/src/lib/conflictUtils.ts` (funkcje + ewent. DTO input/result) |
| Utworzyć | `code/src/lib/conflictUtils.test.ts` |
| Modyfikacja | `code/src/hooks/useListDetails.ts` – użycie `findDuplicateOnList` |
| Modyfikacja | `code/src/components/sets/AddSetToListDialog.tsx` – użycie `computeSetConflicts` |
| Opcjonalnie | `code/src/types/domain.types.ts` – przeniesienie `ComputeSetConflictsInput`/`Result` jeśli uznane za część kontraktu domenowego |

---

## 7. Kryteria ukończenia

- [ ] `suggestedQuantityForConflict` zaimplementowana i przetestowana (w tym "—", jedno puste, oba wypełnione).  
- [ ] `findDuplicateOnList` zaimplementowana i przetestowana (case-insensitive, tylko niekupione).  
- [ ] `computeSetConflicts` zaimplementowana, używa `suggestedQuantityForConflict`, testy dla 0 / wszystkie / mieszanka konfliktów.  
- [ ] `useListDetails.handleAddItem` korzysta z `findDuplicateOnList`.  
- [ ] `AddSetToListDialog.handleSelectList` korzysta z `computeSetConflicts`; zachowanie UI i rezultatów bez zmian.
