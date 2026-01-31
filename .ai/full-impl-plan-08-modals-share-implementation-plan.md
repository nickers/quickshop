# Szczegółowy plan wdrożenia: Część 8 – Modale konfliktów i Share

**Odniesienie:** ui-plan.md §5.4, §5.5, §3 Obsługa konfliktów  
**Część:** 8 – Modale konfliktów i Share  
**Dokument:** Plan implementacji dla programisty frontendowego

---

## 1. Cel i zakres

Wdrożenie trzech komponentów modalnych oraz ich integracji z widokami:

- **ConflictModal (pojedynczy duplikat)** – `ItemConflictDialog`: użytkownik dodaje produkt o nazwie już istniejącej na liście; modal umożliwia edycję ilości i zatwierdzenie (nadpisanie) lub anulowanie.
- **ConflictResolutionModal (import zestawu)** – `SetConflictResolutionDialog`: przy dodawaniu zestawu do listy występują konflikty nazw; modal pokazuje listę konfliktów z checkboxem „Zaktualizuj ilość”, podglądem konkatenacji ilości oraz akcjami Zatwierdź/Anuluj.
- **ShareModal** – udostępnianie listy: pole e-mail do zaproszenia, przycisk Zaproś/Udostępnij, lista osób z dostępem (z opcją usunięcia, jeśli backend to udostępnia).

Integracja: `ListDetailsHeader` → onShare otwiera ShareModal; widok listy → duplikat pojedynczy → ItemConflictDialog; „Dodaj do listy” (zestaw) z konfliktami → SetConflictResolutionDialog.

---

## 2. Odniesienia

- **PRD:** `.ai/prd.md` – US-005 (współdzielenie), US-010 (duplikaty), US-014 (dodawanie zestawu do listy).
- **ui-plan:** §3 (obsługa konfliktów), §5.4 (zestawy), §5.5 (udostępnianie).
- **Plan bazowy:** `.ai/impl-plan-08-modals-share.md`.
- **Typy:** `code/src/types/domain.types.ts` (ListItem, UpdateListItemDTO, CreateListItemDTO, SetConflictItem, SetResolutionResult, SingleItemConflictState), `code/src/db/database.types.ts` (list_members, profiles).
- **Tech stack:** React + Vite, Tailwind, shadcn/ui (Dialog, Input, Button, Checkbox), TanStack Query, Supabase.

---

## 3. Stan obecny

- **ItemConflictDialog** – istnieje w `code/src/components/list-details/ItemConflictDialog.tsx`. Ma: pole ilości wypełnione z `existingItem.quantity`, onConfirm(combinedQuantity), onCancel. Używany w `lists.$listId.tsx` z `useListDetails` (conflictState, resolveConflict, cancelConflict).
- **SetConflictResolutionDialog** – istnieje w `code/src/components/list-details/SetConflictResolutionDialog.tsx`. Lista konfliktów, checkbox „Zaktualizuj” (po nazwie), podgląd „Obecnie / Dodawane / Po złączeniu”. onResolve(SetResolutionResult), onCancel. Używany w `AddSetToListDialog.tsx` przy konfliktach po wyborze listy.
- **ShareModal** – brak. W `lists.$listId.tsx` jest placeholder: `onShare` ustawia `sharePlaceholderOpen` i pokazuje prosty Dialog z tekstem „Udostępnianie listy – wkrótce”.
- **ListsService:** `shareListWithEmail(listId, email)` – zaimplementowane (lookup profilu po email, RPC `invite_member_to_list`). Brak dedykowanego API do listy członków w MVP – ewentualnie `select` z `list_members` (+ join z `profiles`) po `list_id`.
- **ListItemsService:** `updateItem`, `bulkCreateItems` – używane przy konfliktach; logika w AddSetToListDialog i useListDetails jest zgodna z planem.

---

## 4. Wymagania funkcjonalne (User Stories)

- **US-005** – Współdzielenie listy: opcja Udostępnij, pole e-mail, zaproszona osoba widzi listę.
- **US-010** – Obsługa duplikatów: zduplikowana nazwa → jedna pozycja z możliwością zsumowania/aktualizacji ilości (ConflictModal pojedynczy).
- **US-014** – Dodawanie zestawu do listy: przy konfliktach nazw – ConflictResolutionModal (zaznaczone = konkatenacja ilości, odznaczone = ignoruj; nowe produkty dodane).

---

## 5. Zadania – ConflictModal / ItemConflictDialog (pojedynczy duplikat)

1. **Weryfikacja UI**
   - Upewnić się, że pole „Ilość” jest wypełnione **obecną wartością z listy** przy otwarciu (obecnie: `useEffect` ustawia `quantity` z `existingItem.quantity` – **OK**).
   - Etykieta przycisku potwierdzenia: „Zaktualizuj” (zgodne z planem; można rozważyć „Zatwierdź” jeśli wymagane w ui-plan – w opisie jest „Zatwierdź → nadpisanie ilości”).

2. **Akcje**
   - **Zatwierdź:** wywołanie `onConfirm(quantity)` → w `useListDetails` już jest `resolveConflict(combinedQuantity)` wywołujące `updateItemMutation` z `{ id, quantity }` – **nadpisanie ilości na liście**.
   - **Anuluj:** `onCancel()` → `setConflictState({ isOpen: false })` – bez zmian na liście.

3. **Zgodność z ui-plan §3**
   - Jedna pozycja przy duplikacie nazwy, wyróżnienie (obsługa w widoku listy), decyzja użytkownika w modalu – obecna implementacja to spełnia.

**Kroki implementacyjne (jeśli zmiany):**
- Opcjonalnie: zmiana etykiety przycisku na „Zatwierdź” w `ItemConflictDialog.tsx` dla zgodności z opisem w ui-plan.
- Brak zmian w `useListDetails` ani w `lists.$listId.tsx` – integracja już poprawna.

---

## 6. Zadania – ConflictResolutionModal / SetConflictResolutionDialog (import zestawu)

1. **Checkbox „Zaktualizuj ilość”**
   - Domyślnie **zaznaczony** dla każdej konfliktowej pozycji. Obecnie stan `selectedConflicts` jest inicjalizowany jako `new Set()` – czyli **wszystkie odznaczone**. Należy zmienić na: przy pierwszym otwarciu (gdy `conflicts.length > 0`) ustawić `selectedConflicts` na zbiór wszystkich `conflict.existingItem.name` (lub `id`), tak aby domyślnie wszystkie były zaznaczone.

2. **Podgląd zmiany**
   - Format: np. „6 szt” + „10 szt” → „6 szt+10 szt”. Obecnie w komponencie: „Obecnie”, „Dodawane”, „Po złączeniu: {suggestedQuantity}". W `AddSetToListDialog` `suggestedQuantity` jest liczone jako `[existing.quantity, setItem.quantity].filter(Boolean).join("+")` – **zgodne** z wymaganym podglądem. Ewentualnie doprecyzować tekst (np. „Po złączeniu: 6 szt+10 szt”) jeśli w ui-plan wymagana jest explicite konkatenacja z „+”.

3. **Zatwierdź**
   - Dla **zaznaczonych** – `updateItem` z `newQuantity: suggestedQuantity` (konkatenacja).
   - Dla **odznaczonych** – brak wywołania update (ignorowane).
   - **Nowe produkty** (bez konfliktu) – `bulkCreateItems(nonConflictingItems)`. Obecna logika w `handleConflictResolve` w AddSetToListDialog to realizuje.

4. **Anuluj**
   - Zamknięcie modala, wyczyszczenie stanu (`setConflictDialogOpen(false)`, `setTargetListIdForConflict(null)` itd.) – **bez** dodawania/aktualizacji. Obecna `handleConflictCancel` to spełnia.

**Kroki implementacyjne:**
- W `SetConflictResolutionDialog.tsx`: inicjalizacja `selectedConflicts` tak, aby przy `isOpen && conflicts.length > 0` domyślnie zawierała wszystkie klucze (np. `conflicts.map(c => c.existingItem.name)`). Użyć `useEffect` z zależnościami `[isOpen, conflicts]`, aby przy każdym otwarciu ustawić domyślne zaznaczenie wszystkich.
- Opcjonalnie: ujednolicić etykietę checkboxa (np. „Zaktualizuj ilość”) jeśli w UI jest inna treść.

---

## 7. Zadania – ShareModal

1. **Nowy komponent**
   - Ścieżka: `code/src/components/list-details/ShareModal.tsx` (alternatywnie `code/src/components/modals/ShareModal.tsx` – zgodnie z impl-plan).
   - **Props:** `isOpen: boolean`, `onClose: () => void`, `listId: string` (lub `list: ShoppingList` – wystarczy `listId` do wywołań API).

2. **Zawartość modala**
   - **Pole input (e-mail):** do wpisania adresu zapraszanej osoby; walidacja formatu e-mail (opcjonalnie, zalecane).
   - **Przycisk „Zaproś” / „Udostępnij”:** wywołanie `listsService.shareListWithEmail(listId, email)`. Obsługa błędów (np. „Użytkownik nie znaleziony”, „Już ma dostęp”) – wyświetlenie komunikatu w modalu (toast lub inline).
   - **Lista osób mających dostęp:** jeśli w MVP backend udostępnia dane – `list_members` dla danego `list_id` z joinem do `profiles` (email, full_name). Wyświetlenie listy z opcją usunięcia (usunięcie z `list_members`). W planie: „Brak dedykowanego API list members w MVP – ewentualnie select z list_members po list_id.” Zatem:
     - Dodać w `ListsService` metodę np. `getListMembers(listId): Promise<ListMemberViewModel[]>` – `from('list_members').select('*, profiles(email, full_name)').eq('list_id', listId)` (lub osobny select do profiles po user_id). Typ: rozszerzenie Row list_members o email/full_name z profiles.
     - W ShareModal: przy otwarciu pobrać członków (useQuery), wyświetlić listę; przy każdym wierszu przycisk „Usuń” wywołujący usunięcie z `list_members` (delete gdzie list_id + user_id). Uwaga: RLS – tylko członek listy może usuwać innych (wg db-plan).
     - Jeśli w MVP rezygnujemy z listy członków: tylko pole e-mail + Zaproś; lista „wkrótce” lub pominięta.

3. **Wywołanie z nagłówka listy**
   - W `lists.$listId.tsx`: zamiast `setSharePlaceholderOpen(true)` przekazać otwarcie ShareModal z `listId={list.id}`. Stan: np. `shareModalOpen` (boolean). Render: `<ShareModal isOpen={shareModalOpen} onClose={() => setShareModalOpen(false)} listId={list.id} />`.

**Kroki implementacyjne:**
- Dodać typ dla członka listy z profilem (np. w `domain.types.ts` lub lokalnie w serwisie): `ListMemberWithProfile` (list_id, user_id, created_at, email?, full_name?).
- W `lists.service.ts`: zaimplementować `getListMembers(listId)` oraz ewentualnie `removeListMember(listId, userId)` (delete z list_members). Sprawdzić RLS dla DELETE na list_members.
- Utworzyć `ShareModal.tsx`: stan lokalny dla email input, obsługa submit (shareListWithEmail), invalidate zapytania list members po udanym zaproszeniu; sekcja „Osoby z dostępem” z useQuery getListMembers i listą + przyciskiem Usuń.
- W `lists.$listId.tsx`: usunąć placeholderowy Dialog udostępniania; dodać `<ShareModal isOpen={shareModalOpen} onClose={...} listId={list.id} />` i `onShare={() => setShareModalOpen(true)}`.

---

## 8. Integracja

1. **ListDetailsHeader → ShareModal**
   - `onShare` wywołuje otwarcie ShareModal (stan w rodzicu – `lists.$listId.tsx`). ListDetailsHeader nie zmienia się (już przyjmuje onShare).

2. **Widok listy – duplikat pojedynczy → ItemConflictDialog**
   - Już zintegrowane: useListDetails wykrywa duplikat przy addItem, ustawia conflictState; lists.$listId renderuje ItemConflictDialog z conflictState, resolveConflict, cancelConflict.

3. **Pulpit zestawów / „Dodaj do listy” → SetConflictResolutionDialog**
   - Już zintegrowane w AddSetToListDialog: po wyborze listy wykrywane są konflikty; przy konfliktach otwierany jest SetConflictResolutionDialog; po zatwierdzeniu – bulkCreateItems + updateItem dla zaznaczonych. Jedyna zmiana: domyślne zaznaczenie wszystkich konfliktów (patrz sekcja 6).

---

## 9. Typy i API

- **domain.types.ts:** ewentualnie dodać `ListMemberWithProfile` jeśli używane w ShareModal (list_id, user_id, email?, full_name?).
- **database.types.ts:** `list_members` i `profiles` już dostępne; zapytanie z joinem może wymagać sprawdzenia typów generowanych przez Supabase dla `.select('*, profiles(...)')`.
- **ListsService:**  
  - `shareListWithEmail(listId, email)` – istnieje.  
  - `getListMembers(listId)` – dodać (select list_members + profiles).  
  - `removeListMember(listId, userId)` – dodać jeśli lista członków z usuwaniem jest w zakresie.
- **ListItemsService:** brak zmian (updateItem, bulkCreateItems używane jak dotąd).

---

## 10. Kryteria ukończenia

- **ItemConflictDialog:** pole ilości wypełnione wartością z listy; Zatwierdź → nadpisanie ilości; Anuluj → zamknięcie bez zmian. Zgodność z ui-plan §3.
- **SetConflictResolutionDialog:** lista konfliktów z checkboxem „Zaktualizuj ilość” **domyślnie zaznaczonym**; podgląd w formacie np. „6 szt+10 szt”; Zatwierdź → dla zaznaczonych update ilości (konkatenacja), dla odznaczonych brak zmian, nowe produkty dodane; Anuluj → cała operacja przerwana.
- **ShareModal:** otwiera się z nagłówka listy (onShare); pole e-mail i przycisk Zaproś/Udostępnij; wywołanie shareListWithEmail; obsługa błędów; lista osób z dostępem z opcją usunięcia – jeśli API/RLS gotowe w MVP.
- **Integracja:** ListDetailsHeader onShare → ShareModal; widok listy duplikat → ItemConflictDialog; Dodaj do listy (zestaw) z konfliktami → SetConflictResolutionDialog – wszystkie ścieżki działają zgodnie z opisem.

---

## 11. Kolejność wdrożenia

1. **ItemConflictDialog** – ewentualna drobna zmiana etykiety (Zatwierdź) i weryfikacja działania (bez zmian w logice).
2. **SetConflictResolutionDialog** – domyślne zaznaczenie wszystkich konfliktów (useEffect + stan początkowy).
3. **ShareModal** – nowy komponent; opcjonalnie getListMembers + removeListMember w ListsService; integracja w lists.$listId (zastąpienie placeholdera).
4. **Testy ręczne:** pojedynczy duplikat, dodanie zestawu z konfliktami (zaznaczone/odznaczone), udostępnienie listy e-mailem i – jeśli zaimplementowano – lista członków i usunięcie.

---

*Koniec planu. Analiza wewnętrzna (implementation_breakdown) nie jest uwzględniona w tym dokumencie.*
