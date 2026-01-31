# Pełny plan wdrożenia: Pulpit Zestawów (Sets Dashboard)

**Odniesienie:** ui-plan.md §2.4; impl-plan-05-sets-dashboard  
**Ścieżka:** `/sets`  
**Część:** 5 – Pulpit Zestawów

---

## 1. Cel i zakres

**Cel:** Wdrożenie widoku pulpitu zestawów (szablonów zakupowych) umożliwiającego przegląd dostępnych zestawów oraz dodawanie zestawu do wybranej listy z obsługą konfliktów nazw.

**Zakres:**
- Widok `/sets`: lista kart zestawów (nazwa, liczba produktów), przycisk „Dodaj do listy” na każdej karcie.
- Nagłówek z tytułem „Zestawy” i wyróżnieniem wizualnym (np. inny kolor) względem widoku list.
- Opcjonalnie: przycisk „Nowy zestaw” (tworzenie pustego zestawu – US-013).
- „Dodaj do listy” → wybór listy (dropdown lub modal z listą aktywnych list) → dodanie pozycji zestawu do wybranej listy.
- Obsługa konfliktów: gdy na liście docelowej istnieją już produkty o tej samej nazwie – SetConflictResolutionDialog (zaznaczenie, dla których zsumować ilości; konkatenacja tekstowa).
- Stan pusty: komunikat + ewentualnie „Utwórz pierwszy zestaw”.
- Bottom Nav: zakładka „Zestawy” aktywna na `/sets`.

---

## 2. Wymagania (User Stories i kryteria akceptacji)

| Id   | User Story | Kryterium |
|------|------------|-----------|
| US-013 | Zarządzanie zestawami | Zakładka Zestawy; tworzenie nowego pustego zestawu; edycja produktów w zestawie (szczegóły zestawu – osobny widok `/sets/:setId`). |
| US-014 | Dodawanie zestawu do listy | Przycisk „Dodaj do listy” przy zestawie; wybór listy; produkty z zestawu trafiają na listę; przy konfliktach nazw – ConflictResolutionModal (zwiększenie ilości / konkatenacja). |

**Kryteria ukończenia (impl-plan-05):**
- Pulpit zestawów wyświetla karty zestawów z przyciskiem „Dodaj do listy”.
- Wybór listy i dodanie zestawu do listy działa (z obsługą konfliktów przez SetConflictResolutionDialog).
- Wyróżnienie wizualne nagłówka względem widoku list.

---

## 3. Architektura i zależności

- **Route:** TanStack Router; plik `sets.index.tsx` (ścieżka `/sets/`); layout `sets.tsx` z `<Outlet />`.
- **Dane:** TanStack Query; serwisy `setsService`, `listsService`, `listItemsService`.
- **UI:** React, Tailwind CSS, komponenty shadcn/ui (Button, Card, Dialog, Dropdown/Select).
- **Typy:** `domain.types.ts` (ShoppingSet, SetItem, CreateSetDTO, CreateListItemDTO, SetConflictItem, SetResolutionResult); `database.types.ts` (sets, set_items).
- **Zależności:** SetConflictResolutionDialog (już istnieje w `list-details`); listItemsService.bulkCreateItems, listItemsService.updateItem dla konfliktów; listsService.getAllLists dla wyboru listy.

---

## 4. Stan obecny (co już jest zaimplementowane)

- **SetsService:** getAllSets(), getSetItems(setId), createSet(CreateSetDTO), createSetFromList(listId, CreateSetDTO), addSetItem, updateSetItem, deleteSetItem, deleteSet.
- **ListsService:** getAllLists() – zwraca listy użytkownika (przez list_members).
- **ListItemsService:** bulkCreateItems(items), updateItem(UpdateListItemDTO).
- **SetConflictResolutionDialog:** przyjmuje conflicts (SetConflictItem[]), nonConflictingItems (CreateListItemDTO[]), onResolve(SetResolutionResult), onCancel; checkboxy przy konfliktach (zsumować / nie); onResolve zwraca itemsToCreate i itemsToUpdate.
- **sets.index.tsx:** placeholder – auth check, tekst „Zestawy – wkrótce”.
- **sets.$setId.tsx:** placeholder – szczegóły zestawu (edycja) – osobny zakres; można zostawić placeholder lub zrealizować w części 6.
- **Header:** tytuł „Zestawy” dla `/sets` (ROUTE_TITLES).
- **BottomNav:** link do `/sets`, etykieta „Zestawy”.
- **MainLayout:** na ścieżkach `/sets` pokazywane są header i bottom nav (DASHBOARD_PATHS).

---

## 5. Szczegółowy podział zadań

### 5.1. Route i layout
- Trasa `/sets` i `/sets/` już istnieją (sets.tsx, sets.index.tsx).
- Zastąpić zawartość `sets.index.tsx` pełnym widokiem pulpitu zestawów (hook, nagłówek, siatka kart).

### 5.2. Hook useSetsView (lub odpowiednik)
- Zapytanie: getAllSets() – queryKey np. `["sets"]`; networkMode: "offlineFirst" (opcjonalnie).
- Dla każdego zestawu: opcjonalnie liczba produktów – getSetItems(setId) albo osobne zapytanie per zestaw, albo rozszerzenie API (np. zwracanie count). Wariant MVP: osobne getSetItems przy potrzebie (np. przy otwarciu „Dodaj do listy”) lub prefetch count w hooku (Promise.all sets + getSetItems dla każdego).
- Eksport: sets, isLoading, error, refetch. Opcjonalnie: createSet (mutacja), deleteSet (mutacja).

### 5.3. Komponenty
- **SetsHeader:** sekcja nad listą; tytuł „Zestawy” pochodzi z głównego Header (MainLayout); opcjonalnie przycisk „Nowy zestaw” (otwiera modal/dialog tworzenia zestawu lub nawigacja do flow tworzenia).
- **SetsGrid / lista kart:** komponent przyjmujący listę zestawów (z liczbą produktów jeśli dostępna); dla każdego zestawu karta z nazwą, ewentualnie liczba produktów, przycisk „Dodaj do listy”.
- **„Dodaj do listy”:**
  - Klik przycisku na karcie → otwarcie modalu/dropdownu z listą aktywnych list (listsService.getAllLists()).
  - Po wyborze listy: pobranie setItems (setsService.getSetItems(setId)); zmapowanie do CreateListItemDTO (list_id = wybrana lista, name, quantity, note, sort_order).
  - Wykrywanie konfliktów: porównanie nazw (case-insensitive) z aktualnymi pozycjami na liście (listItemsService.getItemsByListId(listId) – tylko aktywne lub wszystkie). Podział na conflicts (SetConflictItem[]) i nonConflictingItems (CreateListItemDTO[]). suggestedQuantity: np. konkatenacja `existing.quantity + "+" + newItem.quantity` lub podobna.
  - Jeśli brak konfliktów: listItemsService.bulkCreateItems(nonConflictingItems); invalidacja ["list-items", listId].
  - Jeśli są konflikty: otwarcie SetConflictResolutionDialog; onResolve: itemsToCreate → bulkCreateItems; itemsToUpdate → dla każdego updateItem({ id, quantity: newQuantity }); invalidacja zapytań.

### 5.4. Wyróżnienie wizualne
- Nagłówek sekcji zestawów: np. w MainLayout/Header dla pathname `/sets` zastosować inną klasę (np. bg-primary/10 lub border-primary) albo osobny komponent SetsHeader z tłem/ramką w innym kolorze – zgodnie z ui-plan §2.4 („inny kolor nagłówka”).

### 5.5. Bottom Nav
- Na `/sets` zakładka „Zestawy” aktywna – BottomNav prawdopodobnie już podświetla na podstawie pathname; zweryfikować.

### 5.6. Pusta lista
- Gdy sets.length === 0: komunikat (np. „Nie masz jeszcze żadnych zestawów”) + opcjonalnie przycisk „Utwórz pierwszy zestaw” (jeśli flow tworzenia jest w scope części 5).

---

## 6. Komponenty i zmiany w plikach

| Komponent / plik | Odpowiedzialność | Zmiany |
|------------------|------------------|--------|
| `hooks/useSetsView.ts` | Pobieranie zestawów; opcjonalnie liczba produktów per zestaw; opcjonalnie createSet/deleteSet | Nowy plik. |
| `components/sets/SetsHeader.tsx` | Sekcja nad siatką; opcjonalnie „Nowy zestaw” | Nowy plik. |
| `components/sets/SetCard.tsx` | Karta zestawu: nazwa, liczba produktów, przycisk „Dodaj do listy” | Nowy plik. |
| `components/sets/SetsGrid.tsx` | Kontener kart; stan pusty | Nowy plik. |
| `components/sets/AddSetToListDialog.tsx` (lub podobna nazwa) | Modal: wybór listy (lista przycisków lub select); po wyborze – logika konfliktów + SetConflictResolutionDialog lub bezpośrednie bulkCreateItems | Nowy plik. |
| `routes/sets.index.tsx` | Strona pulpitu zestawów | Zastąpić placeholder: useSetsView, SetsHeader, SetsGrid, auth check, loading/error, AddSetToListDialog (stan: która karta otwarta, która lista wybrana). |
| `components/Header.tsx` lub `MainLayout` | Wyróżnienie wizualne dla `/sets` | Opcjonalnie: dodatkowa klasa dla header gdy pathname === "/sets". |

---

## 7. Serwisy i API

- **setsService.getAllSets():** zwraca ShoppingSet[]; sortowanie po name.
- **setsService.getSetItems(setId):** zwraca SetItem[]; używane przy „Dodaj do listy” do zmapowania na CreateListItemDTO (list_id, name, quantity, note, sort_order).
- **listsService.getAllLists():** zwraca listy użytkownika; do wyboru listy docelowej.
- **listItemsService.getItemsByListId(listId):** pozycje na liście; do wykrywania konfliktów nazw (np. tylko !is_bought).
- **listItemsService.bulkCreateItems(items):** wstawienie nowych pozycji (nonConflictingItems).
- **listItemsService.updateItem({ id, quantity }):** aktualizacja ilości przy konfliktach (itemsToUpdate).

**Algorytm „Dodaj zestaw do listy”:**
1. Pobierz setItems = getSetItems(setId).
2. Pobierz listItems = getItemsByListId(selectedListId); aktywni = listItems.filter(i => !i.is_bought).
3. Dla każdego setItem: czy istnieje na liście (aktywni) pozycja o tej samej nazwie (case-insensitive)? Tak → conflict (existingItem, newItemCandidate, suggestedQuantity); Nie → do nonConflictingItems (CreateListItemDTO z list_id, name, quantity, note, sort_order).
4. Jeśli conflicts.length === 0: bulkCreateItems(nonConflictingItems). W przeciwnym razie: pokaż SetConflictResolutionDialog; onResolve: bulkCreateItems(itemsToCreate); dla każdego itemsToUpdate wywołaj updateItem; invalidacja ["list-items", listId], ["sets"] (opcjonalnie).

---

## 8. Stan i hook useSetsView

- **Zapytanie:** queryKey `["sets"]`, queryFn: setsService.getAllSets().
- **Opcjonalnie – liczba produktów:** dla każdego zestawu getSetItems(set.id).length; można wykonać w queryFn (Promise.all(sets.map(s => getSetItems(s.id)))) i zwrócić zestawy z polem itemCount, albo osobne zapytania per zestaw (może być wolne). Wariant uproszczony: bez liczby na kartach w MVP; albo jedno zapytanie getSetItems dla wszystkich (jeśli API pozwala) – nie ma; więc albo N+1 zapytań, albo pominięcie liczby w pierwszej wersji.
- **Eksport:** sets, isLoading, error, refetch. sets może być typu ShoppingSet[] lub rozszerzony o itemCount jeśli zaimplementowano.
- **Logika „Dodaj do listy”:** może być w komponencie modalu (AddSetToListDialog): wewnętrzny stan wybranej listy, setId zestawu; pobranie lists (getAllLists), setItems (getSetItems); wybór listy → obliczenie konfliktów → wyświetlenie SetConflictResolutionDialog lub od razu bulkCreateItems + updateItem.

---

## 9. Kryteria akceptacji i testy

- Wejście na `/sets` pokazuje nagłówek „Zestawy” (wyróżniony wizualnie), listę kart zestawów (nazwa, ewentualnie liczba produktów), przycisk „Dodaj do listy” na każdej karcie.
- Klik „Dodaj do listy” otwiera modal z listą aktywnych list; wybór listy i potwierdzenie dodaje produkty z zestawu na listę (bez konfliktów – wszystkie jako nowe pozycje).
- Gdy na liście docelowej są już produkty o tych samych nazwach: pojawia się SetConflictResolutionDialog; użytkownik zaznacza, dla których zsumować ilości; zatwierdzenie: nowe pozycje (bulkCreateItems), zaktualizowane ilości (updateItem).
- Stan pusty: brak zestawów → komunikat; opcjonalnie przycisk „Utwórz pierwszy zestaw”.
- Bottom Nav: zakładka Zestawy aktywna na `/sets`.

---

## 10. Kolejność wdrożenia

1. Hook useSetsView: getAllSets, sets, isLoading, error, refetch; opcjonalnie rozszerzenie o itemCount (getSetItems per zestaw lub bez w MVP).
2. Komponenty SetsHeader, SetCard, SetsGrid (karty z przyciskiem „Dodaj do listy” bez jeszcze logiki).
3. Zastąpienie placeholdera w sets.index.tsx: useSetsView, SetsHeader, SetsGrid; loading/error/empty.
4. AddSetToListDialog: wybór listy (getAllLists), po wyborze – getSetItems(setId), mapowanie na CreateListItemDTO; getItemsByListId(listId); wykrywanie konfliktów; jeśli brak konfliktów – bulkCreateItems, zamknięcie, invalidacja; jeśli konflikty – SetConflictResolutionDialog, onResolve – bulkCreateItems + updateItem, invalidacja.
5. Wyróżnienie wizualne nagłówka dla `/sets` (Header lub MainLayout).
6. Opcjonalnie: „Nowy zestaw” (createSet + nawigacja do `/sets/:setId` lub modal) i stan pusty z przyciskiem „Utwórz pierwszy zestaw”.

---

## 11. Uwagi i ryzyka

- **RLS zestawów:** W db-plan zestawy i set_members mają RLS; getAllSets obecnie zwraca wszystkie zestawy z bazy – jeśli RLS na `sets` ogranicza do członków (set_members), trzeba upewnić się, że użytkownik widzi tylko swoje zestawy. W przeciwnym razie dodać filtrowanie po set_members (analogicznie do list_members).
- **Liczba produktów w zestawie:** N+1 zapytań (getSetItems dla każdego zestawu) może być kosztowne; w MVP można pominąć liczbę na kartach lub dodać później endpoint agregujący.
- **SetConflictResolutionDialog:** Używa suggestedQuantity jako tekst (np. konkatenacja); logika konkatenacji po stronie UI (np. existing.quantity + "+" + newItem.quantity) – zgodnie z ui-plan §5.4 (tryb zestawu).
- **Szczegóły zestawu (/sets/:setId):** Edycja produktów w zestawie to US-013 i osobny widok; w części 5 można zostawić placeholder lub link z karty do `/sets/:setId` (np. klik w nazwę zestawu).
