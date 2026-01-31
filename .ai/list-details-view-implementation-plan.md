# Plan implementacji widoku Szczegóły Listy (List Details)

## 1. Przegląd
Widok ten służy do zarządzania zawartością konkretnej listy zakupowej. Jest to główny ekran operacyjny aplikacji, na którym użytkownik dodaje produkty, odznacza je jako kupione ("skreśla"), edytuje ilości oraz zarządza cyklem życia listy (udostępnianie, archiwizacja, tworzenie zestawów). Kluczowym aspektem jest "Optimistic UI" zapewniające płynność działania oraz zaawansowana obsługa duplikatów przy dodawaniu produktów pojedynczo lub z zestawów.

## 2. Routing widoku
*   **Ścieżka:** `/lists/$listId` (zgodnie z konwencją TanStack Router)
*   **Plik:** `src/routes/lists.$listId.tsx` (lub odpowiednik w strukturze `routes/`)

## 3. Struktura komponentów
*   `ListDetailsPage` (Główny kontener strony)
    *   `ListHeader` (Nawigacja i akcje globalne)
        *   `SyncStatusIndicator` (Wskaźnik stanu synchronizacji)
        *   `ListActionsMenu` (Dropdown: Udostępnij, Archiwizuj, Utwórz Zestaw, Zmień nazwę)
            *   `ShareListDialog` (Modal udostępniania)
            *   `CreateSetDialog` (Modal tworzenia zestawu z listy)
            *   `ArchiveConfirmationDialog`
    *   `ShoppingListContainer` (Scrollowalny obszar)
        *   `ActiveItemsList` (Lista produktów do kupienia - Sortowalna)
            *   `ListItemRow` (Pojedynczy wiersz produktu)
        *   `CompletedItemsSection` (Sekcja "Kupione")
            *   `SectionDivider` (Nagłówek sekcji z licznikiem)
            *   `ListItemRow` (Wiersz produktu kupionego - wyszarzony)
    *   `StickyInputBar` (Pasek dodawania przyklejony do dołu)
    *   `ItemConflictDialog` (Modal rozwiązywania konfliktu pojedynczego produktu)
    *   `SetConflictResolutionDialog` (Modal rozwiązywania konfliktów przy dodawaniu zestawu)

## 4. Szczegóły komponentów

### 1. `ListDetailsPage`
*   **Opis:** Główny wrapper pobierający dane listy i produktów na podstawie `listId` z URL. Zarządza głównym stanem ładowania i błędów.
*   **Główne elementy:** `div` (layout), Hooks data-fetching.
*   **Obsługiwane interakcje:** Inicjalizacja pobierania danych.
*   **Typy:** `ListDetailsViewModel`.

### 2. `StickyInputBar`
*   **Opis:** Formularz "przyklejony" do dołu ekranu (position: sticky/fixed), służący do szybkiego dodawania produktów.
*   **Główne elementy:** `Input` (shadcn), `Button` (Ikona Plus/Send).
*   **Obsługiwane interakcje:**
    *   `onSubmit`: Próba dodania produktu.
    *   `onFocus`: Ewentualne dostosowanie widoku (mobile keyboard).
*   **Obsługiwana walidacja:**
    *   Nazwa produktu nie może być pusta.
    *   Maksymalna długość nazwy (np. 100 znaków).
*   **Propsy:**
    *   `onAddItem: (name: string) => void`
    *   `isSubmitting: boolean`

### 3. `ListItemRow`
*   **Opis:** Wiersz reprezentujący produkt. Obsługuje gesty (swipe), zaznaczanie i edycję.
*   **Główne elementy:** `Checkbox`, `Text` (Nazwa, Ilość), `DragHandle` (ikona), `Swipeable` wrapper (opcjonalnie dla gestów mobilnych).
*   **Obsługiwane interakcje:**
    *   `onToggle`: Kliknięcie w checkbox/wiersz -> zmiana statusu `is_completed`.
    *   `onSwipeLeft`: Wyzwala akcję usuwania.
    *   `onLongPress`: Wyzwala tryb edycji (lub otwiera modal edycji).
*   **Propsy:**
    *   `item: ListItem`
    *   `onToggle: (id: UUID) => void`
    *   `onDelete: (id: UUID) => void`
    *   `onEdit: (item: ListItem) => void`

### 4. `ItemConflictDialog`
*   **Opis:** Modal wyświetlany, gdy użytkownik dodaje produkt, który już istnieje na liście. Pozwala połączyć ilości.
*   **Główne elementy:** `Dialog` (shadcn), `Input` (edycja ilości).
*   **Logika:** Wyświetla obecną ilość i pozwala użytkownikowi wpisać nową, łączną wartość (np. "1 szt + 2 op").
*   **Propsy:**
    *   `isOpen: boolean`
    *   `existingItem: ListItem`
    *   `newItemName: string`
    *   `onConfirm: (combinedQuantity: string) => void`
    *   `onCancel: () => void`

### 5. `SetConflictResolutionDialog`
*   **Opis:** Zaawansowany modal do rozwiązywania konfliktów przy dodawaniu wielu produktów naraz (z zestawu).
*   **Główne elementy:** `Table`/`List`, `Checkbox` przy konfliktach, Podgląd zmian (Before -> After).
*   **Propsy:**
    *   `conflicts: SetConflictItem[]`
    *   `nonConflictingItems: CreateListItemDTO[]`
    *   `onResolve: (resolution: SetResolutionResult) => void`

### 6. `ListHeader` & `ListActionsMenu`
*   **Opis:** Nagłówek z nazwą listy i menu akcji.
*   **Elementy:** `EditableText` (tytuł), `DropdownMenu` (shadcn).
*   **Akcje:** "Udostępnij" (otwiera `ShareListDialog`), "Archiwizuj", "Utwórz zestaw z listy".

## 5. Typy

### Modele Domenowe (z `domain.types.ts`)
*   `ShoppingList`, `ListItem`, `CreateListItemDTO`, `UpdateListItemDTO`.

### Modele Widoku (View Models)
```typescript
// Reprezentacja stanu konfliktu przy dodawaniu zestawu
export interface SetConflictItem {
  existingItem: ListItem;
  newItemCandidate: CreateListItemDTO;
  // Sugerowana nowa ilość (np. konkatenacja stringów)
  suggestedQuantity: string;
}

// Wynik rozwiązania konfliktu zestawu
export interface SetResolutionResult {
  itemsToCreate: CreateListItemDTO[]; // Produkty bez konfliktów + zaakceptowane nowe
  itemsToUpdate: { itemId: string; newQuantity: string }[]; // Produkty zaktualizowane
}

// Stan modala konfliktu pojedynczego
export interface SingleItemConflictState {
  isOpen: boolean;
  conflictingItem?: ListItem;
  pendingName?: string; // Nazwa którą użytkownik próbował dodać
}
```

## 6. Zarządzanie stanem
Wykorzystanie custom hooka `useListDetails(listId)`:
1.  **Server State (TanStack Query):**
    *   `['list', listId]` - dane listy.
    *   `['list-items', listId]` - lista produktów.
2.  **Local State (React `useState`):**
    *   `isConflictModalOpen`: boolean (dla pojedynczego itemu).
    *   `conflictData`: `SingleItemConflictState`.
    *   `setConflictData`: Dane do modala zestawów (jeśli zaimplementowane w tym widoku).
3.  **Mutacje (Optimistic Updates):**
    *   `useCreateItemMutation`: Aktualizuje cache `['list-items', listId]` dodając tymczasowy item przed odpowiedzią serwera.
    *   `useUpdateItemMutation`: Natychmiast zmienia status checkboxa w UI.
    *   `useDeleteItemMutation`: Usuwa item z UI natychmiastowo.

## 7. Integracja z interfejsami

### `IListService`
*   `getListById(listId)` -> Pobranie nagłówka listy.
*   `shareListWithEmail(listId, email)` -> Obsługa w `ShareListDialog`.
*   `completeShoppingTrip(listId)` -> Obsługa przycisku "Archiwizuj" / "Zakończ zakupy".

### `IListItemsService`
*   `getItemsByListId(listId)` -> Pobranie produktów.
*   `createItem(dto)` -> Dodanie nowego produktu (gdy brak konfliktu).
*   `updateItem(dto)` -> Zmiana statusu `completed`, zmiana ilości przy konflikcie.
*   `deleteItem(itemId)` -> Swipe-to-delete.
*   `reorderItems(items)` -> Obsługa Drag & Drop.
*   `bulkCreateItems(items)` -> Dodawanie produktów z zestawu (tych bez konfliktów).

## 8. Interakcje użytkownika

### Dodawanie produktu (Scenariusz z konfliktem)
1.  Użytkownik wpisuje nazwę w `StickyInput` i wciska Enter.
2.  Frontend sprawdza listę `activeItems` (case-insensitive).
3.  **Brak duplikatu:** Wywołanie `createItem`.
4.  **Znaleziono duplikat:**
    *   Otwarcie `ItemConflictDialog`.
    *   Input w modalu ma wartość: `${existingItem.quantity}`.
    *   Użytkownik dopisuje tekst: `${existingItem.quantity} + nowa ilosc`.
    *   Zatwierdzenie -> Wywołanie `updateItem` z nową ilością.

### Dodawanie Zestawu (Scenariusz masowy)
1.  Użytkownik wybiera opcję "Dodaj zestaw" (np. z menu lub osobnego przycisku - flow zależy od implementacji wyboru zestawu, tu zakładamy, że otrzymujemy listę produktów zestawu).
2.  Frontend porównuje przychodzące produkty z obecnymi.
3.  Otwiera `SetConflictResolutionDialog` z listą kolizji.
4.  Po zatwierdzeniu generuje serię żądań: `bulkCreateItems` dla nowych i `Promise.all(updateItem)` dla konfliktów.

### Zarządzanie produktami
*   **Kliknięcie wiersza/checkboxa:** Natychmiastowa wizualna zmiana (`opacity` dla `completed`), wywołanie API w tle.
*   **Swipe (Gest):** Pokazuje akcję usuwania (czerwone tło). Przeciągnięcie > 50% szerokości usuwa element.
*   **Drag & Drop:** Przytrzymanie "uchwytu" pozwala zmienić kolejność. Upuszczenie wysyła nowe `sort_order` do API.

## 9. Warunki i walidacja

*   **Unikalność nazw:** Weryfikowana na poziomie UI przed wysłaniem żądania `create` (triggeruje flow konfliktów).
*   **Ilość:** Pole tekstowe, opcjonalne, ale w przypadku konfliktu musi zawierać sensowną wartość (nie puste, jeśli użytkownik decyduje się łączyć).
*   **Permissions:** Sprawdzenie, czy użytkownik ma prawo edycji listy (chociaż w MVP zakładamy, że dostęp do URL = dostęp do listy, ew. RLS to blokuje).

## 10. Obsługa błędów
*   **Błąd sieci (Offline):**
    *   Zapisanie akcji w kolejce (jeśli obsługiwane przez service worker/local storage) lub komunikat "Brak połączenia, spróbuj ponownie".
    *   W przypadku Optimistic UI: Jeśli mutacja zawiedzie, UI cofa zmianę (rollback) i wyświetla `Toast` z błędem.
*   **Błąd synchronizacji:** Ikona `SyncStatusIndicator` zmienia kolor na czerwony.
*   **Usunięta lista:** Jeśli `getListById` zwróci 404, przekierowanie na dashboard (`/`).

## 11. Kroki implementacji

1.  **Setup routingu i szkieletu:**
    *   Utworzenie pliku `src/routes/lists.$listId.tsx`.
    *   Zdefiniowanie pustych komponentów-placeholderów (`StickyInputBar`, `ListItemRow`).
2.  **Integracja danych (Read):**
    *   Użycie `useQuery` do pobrania listy i elementów.
    *   Wyświetlenie surowej listy elementów.
3.  **Implementacja `StickyInputBar` i Dodawania:**
    *   Oprogramowanie formularza.
    *   Implementacja logiki wykrywania duplikatów (na razie prosty `alert` lub console.log).
    *   Podpięcie mutacji `createItem`.
4.  **Implementacja `ItemConflictDialog`:**
    *   Stworzenie modala.
    *   Połączenie z logiką wykrywania duplikatów z punktu 3.
    *   Obsługa edycji ilości i wywołania `updateItem`.
5.  **Rozbudowa `ListItemRow`:**
    *   Stylowanie stanów (active/completed).
    *   Obsługa Checkboxa (Optimistic Update).
    *   Obsługa usuwania.
6.  **Sortowanie i Sekcje:**
    *   Podział listy na "Do kupienia" i "Kupione".
    *   Opcjonalnie: Implementacja Drag & Drop dla sekcji aktywnej.
7.  **Nagłówek i Akcje:**
    *   Dodanie Menu z opcjami (Udostępnij, Archiwizuj).
    *   Implementacja prostych dialogów dla tych akcji.
8.  **Obsługa Zestawów (Advanced):**
    *   Implementacja logiki porównywania produktów z zestawu (jeśli widok wyboru zestawu jest gotowy).
    *   Implementacja `SetConflictResolutionDialog`.
9.  **Szlify UI/UX:**
    *   Animacje przejścia (np. przy przenoszeniu do "Kupionych").
    *   Loading states (Skeletons).
    *   Obsługa błędów (Toasty).