# Plan implementacji: Część 6 – Szczegóły zestawu

**Odniesienie:** ui-plan.md §2.5  
**Część:** 6 – Szczegóły zestawu

## Cel
Widok `/sets/:setId`: nagłówek z etykietą "TRYB SZABLONU", lista produktów w zestawie (bez checkboxów "kupione"), Sticky Input do dodawania pozycji do zestawu.

## Zadania

### 1. Route
- [ ] Trasa `/sets/:setId` już w części 1; zastąpić placeholder w `sets.$setId.tsx`.

### 2. Hook useSetDetails
- [ ] Hook `useSetDetails(setId)`: set, items, isLoading, error, addItem, updateItem, deleteItem, refetch.
- [ ] Wywołania: setsService.getSetItems, addSetItem, updateSetItem, deleteSetItem.

### 3. SetDetailsHeader
- [ ] Przycisk Wstecz → `/sets`.
- [ ] Etykieta "TRYB SZABLONU" (np. badge lub drugi wiersz).
- [ ] Nazwa zestawu; opcjonalnie menu (Zmień nazwę, Usuń zestaw).

### 4. Lista produktów
- [ ] Komponent listy pozycji zestawu: bez checkboxa "kupione" (tylko nazwa + ilość/notatka + akcje edycja/usuń).
- [ ] Można użyć wariantu ListItemRow bez checkboxa lub osobnego SetItemRow.
- [ ] Sortowanie: opcjonalnie drag handle (jak na liście zakupów).

### 5. Sticky Input
- [ ] To samo zachowanie co na liście: pole + "Dodaj", Enter, walidacja; dodaje pozycję do zestawu (addSetItem).

### 6. Bottom Nav
- [ ] Na `/sets/:setId` Bottom Nav ukryty (jak na `/lists/:listId`).

## Kryteria ukończenia
- Widok szczegółów zestawu pokazuje nagłówek "TRYB SZABLONU", listę pozycji i Sticky Input.
- Dodawanie, edycja, usuwanie pozycji w zestawie działa.
