# Podział ui-plan.md na części implementacji

Dokument dzieli **Architekturę UI dla QuickShop** (ui-plan.md) na logiczne części, dla których kolejno tworzone są plany implementacji i sama implementacja.

---

## Mapowanie: ui-plan → części

| Część | Nazwa | Odniesienie w ui-plan | Stan w kodzie |
|-------|--------|------------------------|----------------|
| **1** | Layout i nawigacja | §1 Przegląd struktury UI, §4 Układ i nawigacja, §5.6 MainLayout | Brak MainLayout (max-w-md), brak Bottom Nav, Header = menu boczne |
| **2** | Ekran Auth | §2.1 Ekran Logowania/Rejestracji | `/auth`, komponenty auth – istnieją; dopasowanie UX |
| **3** | Pulpit List | §2.2 Pulpit List | `/lists`, ListCard, CreateListDialog – istnieją; integracja z nowym layoutem |
| **4** | Szczegóły listy | §2.3 Szczegóły listy, §5.1 Sticky Input, §5.2 ListItemRow | Widok i komponenty w dużej mierze są; SyncStatusIndicator, UX (optimistic, swipe, long-press) |
| **5** | Pulpit Zestawów | §2.4 Pulpit Zestawów | Brak `/sets` i widoku |
| **6** | Szczegóły zestawu | §2.5 Szczegóły zestawu | Brak `/sets/:setId` |
| **7** | Historia zakupów | §2.6 Historia zakupów | Brak `/history`; history.service istnieje |
| **8** | Modale: konflikty i Share | §5.4 ConflictModal, §5.5 ShareModal, §3 Obsługa konfliktów | ItemConflictDialog, SetConflictResolutionDialog – są; ShareModal – brak |
| **9** | Wskaźnik sync i dopracowanie UX | §5.3 SyncStatusIndicator, §2.3 UX (optimistic, swipe, long-press) | SyncStatusIndicator brak; ListItemRow – bez swipe/long-press |

---

## Opis części

### Część 1: Layout i nawigacja
- **MainLayout**: Header (kontekstowy), `<main className="container mx-auto max-w-md ...">`, Bottom Navigation.
- **Bottom Navigation Bar**: Listy, Zestawy, Historia – widoczna na `/lists`, `/sets`, `/history`.
- **Routing**: `/` → redirect do `/lists` lub `/auth`; `/auth`; `/lists`, `/lists/:id`; `/sets`, `/sets/:id`; `/history`.
- **Header**: Tytuł/akcje zależne od trasy; przycisk Wstecz w szczegółach; bez pełnego menu bocznego jako głównej nawigacji (nawigacja główna = Bottom Nav).

### Część 2: Ekran Auth
- Ścieżka `/auth`, przełącznik Logowanie/Rejestracja, formularz (email, hasło), „Zaloguj z Google”.
- UX: czytelne komunikaty błędów walidacji, feedback podczas ładowania.

### Część 3: Pulpit List
- Ścieżka `/lists` (główny widok po zalogowaniu).
- Karty list (nazwa, właściciel/współdzielenie, liczba produktów kupione/wszystkie), przycisk „Nowa lista”, Bottom Nav.

### Część 4: Szczegóły listy
- Ścieżka `/lists/:listId`.
- ListDetailsHeader: Udostępnij, Menu (Archiwizuj, Zmień nazwę), SyncStatusIndicator.
- ListItemRow, StickyInput, sekcja Kupione.
- UX: optimistic UI, swipe-to-delete, long-press (edycja ilości/notatki).

### Część 5: Pulpit Zestawów
- Ścieżka `/sets`.
- Karty zestawów, przycisk „Dodaj do listy”, Bottom Nav.
- Wyróżnienie wizualne (np. inny kolor nagłówka) względem list.

### Część 6: Szczegóły zestawu
- Ścieżka `/sets/:setId`.
- Nagłówek z etykietą „TRYB SZABLONU”, lista produktów bez checkboxów „kupione”, Sticky Input.

### Część 7: Historia zakupów
- Ścieżka `/history`.
- Lista zarchiwizowanych list (accordion), Bottom Nav.

### Część 8: Modale konfliktów i Share
- **ConflictModal (pojedynczy duplikat)**: pole edycji ilości, Zatwierdź / Anuluj.
- **ConflictResolutionModal (import zestawu)**: lista konfliktów z checkboxami „Zaktualizuj ilość”, Zatwierdź / Anuluj.
- **ShareModal**: pole email, lista osób z dostępem, opcja usunięcia.

### Część 9: SyncStatusIndicator i dopracowanie UX
- **SyncStatusIndicator**: zielony/ukryty (zsync), pomarańczowy/pulsujący (sync/offline), czerwony (błąd + akcja ponów).
- **ListItemRow**: swipe-to-delete, long-press → modal edycji (ilość, notatka).
- **StickyInputBar**: walidacja (niepusty), Enter, feedback przy błędzie (np. pulsowanie).

---

## Kolejność realizacji

1. **Część 1** – bez niej Bottom Nav i MainLayout nie istnieją; wszystkie widoki muszą się w nie wpinać.
2. **Część 2** – Auth (dopasowanie do ui-plan); można równolegle z 1.
3. **Część 3** – Pulpit list (dopasowanie do nowego layoutu i Bottom Nav).
4. **Część 4** – Szczegóły listy (SyncStatusIndicator, optimistic, swipe, long-press można fazować).
5. **Część 5** – Pulpit zestawów.
6. **Część 6** – Szczegóły zestawu.
7. **Część 7** – Historia.
8. **Część 8** – Modale (konflikty + Share).
9. **Część 9** – SyncStatusIndicator i dopracowanie UX (można rozłożyć na iteracje po 4–8).

---

## Pliki planów implementacji

Dla każdej części w `.ai/` powstaje osobny plan implementacji:

- `impl-plan-01-layout-navigation.md`
- `impl-plan-02-auth.md`
- `impl-plan-03-lists-dashboard.md`
- `impl-plan-04-list-details.md`
- `impl-plan-05-sets-dashboard.md`
- `impl-plan-06-set-details.md`
- `impl-plan-07-history.md`
- `impl-plan-08-modals-share.md`
- `impl-plan-09-sync-ux.md`

Po zatwierdzeniu planu danej części wykonywana jest implementacja zgodnie z tym planem.
