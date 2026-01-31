# Plan implementacji: Część 4 – Szczegóły listy

**Odniesienie:** ui-plan.md §2.3, §5.1, §5.2  
**Część:** 4 – Szczegóły listy

## Cel
Pełny widok szczegółów listy: nagłówek (Udostępnij, Menu – Archiwizuj, Zmień nazwę), SyncStatusIndicator, ListItemRow (checkbox, ilość, drag handle), StickyInput, sekcja Kupione; optional: optimistic UI, swipe-to-delete, long-press.

## Stan obecny
- ListDetailsHeader, ActiveItemsList, CompletedItemsSection, ListItemRow, StickyInputBar, ItemConflictDialog.
- useListDetails; onShare/onArchive/onCreateSet – placeholdery.

## Zadania

### 1. ListDetailsHeader
- [ ] Zachować: Wstecz, nazwa listy, Menu (Udostępnij, Utwórz zestaw, Zakończ zakupy/Archiwizuj).
- [ ] Dodać miejsce na SyncStatusIndicator (np. obok nazwy lub w prawym górnym rogu) – komponent z części 9; tymczasowo placeholder.
- [ ] Opcjonalnie: pozycja "Zmień nazwę" w menu (inline lub modal).

### 2. SyncStatusIndicator (placeholder)
- [ ] Zarezerwować miejsce w nagłówku; w części 9 pełna implementacja (zielony/pomarańczowy/czerwony).

### 3. ListItemRow
- [ ] Lewa: checkbox (lub placeholder w trybie szablonu – nie dotyczy widoku listy).
- [ ] Środek: nazwa produktu, ilość/notatka mniejszą czcionką.
- [ ] Prawa: drag handle (ikona); na razie bez faktycznego drag-and-drop jeśli nie ma biblioteki.
- [ ] Tap: zmiana stanu checkboxa (już prawdopodobnie).
- [ ] Long-press i swipe-to-delete – w części 9; tutaj ewentualnie szkielet (np. przycisk usuwania w menu kontekstowym).

### 4. StickyInputBar
- [ ] Przyklejony nad dolną nawigacją / do dołu ekranu.
- [ ] Walidacja: niepusty tekst; Enter = Dodaj; feedback przy błędzie (np. pulsowanie) – dopracowanie w części 9.

### 5. Sekcja Kupione
- [ ] CompletedItemsSection: wizualnie oddzielona (np. nagłówek "Kupione", wyszarzone pozycje).
- [ ] Zachowanie: toggle przenosi z powrotem do aktywnych.

### 6. Optimistic UI
- [ ] Po dodaniu/odznaczeniu: natychmiastowa aktualizacja UI; elementy niesynchronizowane z obniżoną opacity (np. 0.7) do czasu potwierdzenia z backendu.
- [ ] Wymaga koordynacji z useListDetails (mutations z optimistic update).

### 7. Integracja akcji nagłówka
- [ ] onShare → otwarcie ShareModal (komponent z części 8).
- [ ] onArchive → modal potwierdzenia + wywołanie archiwizacji (jeśli backend gotowy) + redirect na `/lists`.
- [ ] onCreateSet → nawigacja do flow "Utwórz zestaw z listy" lub modal (można odłożyć na po zestawach).

## Kryteria ukończenia
- Widok szczegółów listy ma nagłówek z miejscem na sync, listę aktywną, sekcję kupione, StickyInput.
- Optimistic UI dla dodawania/toggle (opacity dla niesynchronizowanych).
- Share/Archive podpięte do modali lub placeholderów z części 8.
