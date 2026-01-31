# Plan implementacji: Część 7 – Historia zakupów

**Odniesienie:** ui-plan.md §2.6  
**Część:** 7 – Historia zakupów

## Cel
Widok `/history`: zarchiwizowane listy posortowane chronologicznie, prezentacja w formie accordion (rozwiń → szczegóły listy), Bottom Nav.

## Zadania

### 1. Route
- [ ] Trasa `/history` utworzona w części 1; zastąpić placeholder w `history.tsx`.

### 2. Dane
- [ ] historyService.getHistory() zwraca wpisy (np. shopping_history); typ HistoryEntry w domain.types.
- [ ] Sprawdzić strukturę API/RLS: czy zwracane są listy z nazwą, datą, pozycjami (dla rozwijanego szczegółu).

### 3. Hook useHistory
- [ ] Hook useHistory(): entries, isLoading, error, refetch.
- [ ] Mapowanie danych do komponentu (np. lista nagłówków + szczegóły po rozwinięciu).

### 4. Komponent listy
- [ ] Accordion: każdy wpis = nagłówek (np. nazwa listy + data zakończenia) + po rozwinięciu szczegóły (np. lista kupionych produktów lub podsumowanie).
- [ ] Użyć komponentu Tabs/Accordion z UI (jeśli jest) lub prosty stan rozwijania (useState per item lub jeden otwarty).

### 5. Styl i Bottom Nav
- [ ] Spójny z resztą aplikacji; na `/history` zakładka "Historia" w Bottom Nav aktywna.

### 6. Pusta historia
- [ ] Gdy brak wpisów: komunikat "Brak zakończonych zakupów".

## Kryteria ukończenia
- Historia wyświetla zarchiwizowane listy w formie accordion z możliwością rozwinięcia szczegółów.
- Bottom Nav działa na tej trasie.
