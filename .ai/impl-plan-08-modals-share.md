# Plan implementacji: Część 8 – Modale konfliktów i Share

**Odniesienie:** ui-plan.md §5.4, §5.5, §3 Obsługa konfliktów  
**Część:** 8 – Modale konfliktów i Share

## Cel
ConflictModal (pojedynczy duplikat), ConflictResolutionModal (import zestawu), ShareModal (udostępnianie listy); integracja z widokami list i zestawów.

## Stan obecny
- ItemConflictDialog – pojedynczy duplikat (prawdopodobnie).
- SetConflictResolutionDialog – konflikty przy dodawaniu zestawu do listy.

## Zadania

### 1. ConflictModal – pojedynczy duplikat (ItemConflictDialog)
- [ ] Sprawdzić ItemConflictDialog: czy ma pole edycji ilości wypełnione obecną wartością z listy.
- [ ] Akcje: "Zatwierdź" → nadpisanie ilości na liście wartością z pola; "Anuluj" → zamknięcie bez zmian.
- [ ] Zgodność z ui-plan §3 (przypadek pojedynczego duplikatu).

### 2. ConflictResolutionModal – import zestawu (SetConflictResolutionDialog)
- [ ] Lista konfliktowych pozycji; przy każdej checkbox "Zaktualizuj ilość" (domyślnie zaznaczony).
- [ ] Podgląd zmiany: np. "6 szt" + "10 szt" → "6 szt+10 szt".
- [ ] "Zatwierdź": dla zaznaczonych – konkatenacja ilości; odznaczone – ignorowane; nowe produkty (bez konfliktu) dodane.
- [ ] "Anuluj": cała operacja przerwana, nic nie dodane.

### 3. ShareModal
- [ ] Nowy komponent `ShareModal.tsx` (np. w `src/components/list-details/` lub `src/components/modals/`).
- [ ] Props: isOpen, onClose, listId (lub list).
- [ ] Zawartość: pole input (email) do zaproszenia, przycisk "Zaproś"/"Udostępnij"; lista osób mających dostęp z opcją usunięcia (jeśli backend udostępnia).
- [ ] Wywołanie: z ListDetailsHeader onShare → otwarcie ShareModal; wysyłka zaproszenia przez API (np. invite_member).

### 4. Integracja
- [ ] ListDetailsHeader: onShare otwiera ShareModal z listId.
- [ ] Pulpit zestawów / "Dodaj do listy": po wyborze listy, jeśli są konflikty → SetConflictResolutionDialog; po zatwierdzeniu dodanie pozycji (w tym konkatenacja ilości dla zaznaczonych).
- [ ] Widok listy: dodanie duplikatu pojedynczego → ItemConflictDialog (już podpięty w useListDetails).

## Kryteria ukończenia
- Oba modale konfliktów działają zgodnie z ui-plan; ShareModal otwiera się z nagłówka listy i pozwala na zaproszenie po emailu oraz pokazuje listę osób z dostępem (jeśli API gotowe).
