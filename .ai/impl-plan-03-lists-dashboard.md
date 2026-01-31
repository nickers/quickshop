# Plan implementacji: Część 3 – Pulpit List

**Odniesienie:** ui-plan.md §2.2  
**Część:** 3 – Pulpit List

## Cel
Widok główny list zakupowych na `/lists`: karty list (nazwa, właściciel/współdzielenie, liczba produktów kupione/wszystkie), przycisk "Nowa lista", integracja z MainLayout i Bottom Nav.

## Stan obecny
- `lists.index.tsx` używa ListsHeader, ListsGrid, ListCard, CreateListDialog; `container mx-auto p-4 pb-20`.
- Hook useListsView, serwisy lists.

## Zadania

### 1. Integracja z MainLayout
- [ ] Upewnić się, że `/lists` renderuje się wewnątrz MainLayout (po wdrożeniu części 1).
- [ ] Usunąć lub dostosować zbędny wrapper (np. `container mx-auto` może być w MainLayout; w widoku tylko `p-4` lub brak jeśli MainLayout ma padding).
- [ ] Dół strony: `pb-24` lub odpowiedni padding, żeby treść nie była zasłonięta przez Bottom Nav.

### 2. ListsHeader
- [ ] Tytuł "Listy" lub pozostawiony z MainLayout/Header.
- [ ] Przycisk "Nowa lista" wyraźny (FAB lub w nagłówku) – zgodnie z ui-plan.

### 3. List Card
- [ ] Na karcie: nazwa listy, informacja o właścicielu/współdzieleniu (jeśli z backendu), liczba produktów (kupione / wszystkie), np. "3/10".
- [ ] Klik w kartę → nawigacja do `/lists/:listId`.

### 4. Bottom Navigation
- [ ] Na `/lists` zakładka "Listy" w Bottom Nav jest aktywna (wyróżniona).

### 5. Pusta lista
- [ ] Gdy brak list: komunikat zachęcający do utworzenia pierwszej listy + przycisk "Nowa lista".

## Kryteria ukończenia
- Pulpit list działa w nowym layoutcie z Bottom Nav.
- Karty pokazują wymagane informacje; "Nowa lista" i przejście do szczegółów działają.
