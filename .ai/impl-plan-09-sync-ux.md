# Plan implementacji: Część 9 – SyncStatusIndicator i dopracowanie UX

**Odniesienie:** ui-plan.md §5.3, §2.3 (optimistic, swipe, long-press), §5.1 (StickyInput)  
**Część:** 9 – SyncStatusIndicator i dopracowanie UX

## Cel
SyncStatusIndicator w nagłówku (stany: zsynchronizowano / synchronizacja-offline / błąd); ListItemRow: swipe-to-delete, long-press → edycja; StickyInputBar: walidacja, Enter, feedback przy błędzie.

## Zadania

### 1. SyncStatusIndicator
- [ ] Komponent `SyncStatusIndicator.tsx` (np. w `src/components/layout/` lub `list-details/`).
- [ ] Stany: zielony/ukryty (zsync), pomarańczowy/pulsujący (sync w toku / offline), czerwony (błąd – klik otwiera szczegóły lub "Ponów").
- [ ] Źródło stanu: kontekst lub hook (np. useSyncStatus) pobierający stan z TanStack Query (pending mutations), Supabase realtime lub offline detector.
- [ ] Umieścić w ListDetailsHeader (i ewentualnie w innych widokach z mutacjami).

### 2. ListItemRow – Swipe-to-delete
- [ ] Na mobile: swipe w lewo odsłania czerwone tło + ikona kosza; potwierdzenie lub natychmiastowe usunięcie.
- [ ] Implementacja: CSS transform + touch events lub biblioteka (np. react-swipeable).
- [ ] Desktop: fallback – przycisk/usuwanie z menu kontekstowego lub ikona kosza przy hover.

### 3. ListItemRow – Long-press
- [ ] Long-press otwiera modal edycji: ilość, notatka (pole tekstowe).
- [ ] Zatwierdzenie → updateItem w useListDetails.
- [ ] Touch: onTouchStart/onTouchEnd + timer (~500 ms); desktop: ewentualnie right-click lub osobny przycisk "Edycja".

### 4. StickyInputBar – walidacja i feedback
- [ ] Niepusty tekst przed dodaniem; przy pustym Enter/submit: krótki feedback (np. pulsowanie obramowania, aria-invalid).
- [ ] Enter w polu = submit (już może być).
- [ ] Komunikat lub wizualny stan błędu (np. "Wpisz nazwę produktu").

### 5. Optimistic UI (dopracowanie)
- [ ] Elementy w trakcie synchronizacji (pending mutation) z obniżoną opacity; po sukcesie/błędzie aktualizacja.
- [ ] Spójne z SyncStatusIndicator (np. gdy są pending items, wskaźnik w stanie "synchronizacja").

## Kryteria ukończenia
- SyncStatusIndicator pokazuje trzy stany i jest widoczny w nagłówku szczegółów listy.
- ListItemRow obsługuje swipe-to-delete i long-press → edycja.
- StickyInputBar ma walidację i czytelny feedback przy błędzie.
