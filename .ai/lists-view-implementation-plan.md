# Plan implementacji widoku List (Pulpit List)

## 1. Przegląd

Widok List (Pulpit List) jest głównym widokiem aplikacji QuickShop, dostępnym pod ścieżką `/lists` (lub `/` po zalogowaniu). Jego celem jest prezentacja wszystkich aktywnych list zakupowych użytkownika oraz umożliwienie szybkiego przejścia do konkretnej listy lub utworzenia nowej. Widok wyświetla karty list zawierające nazwę listy, informację o właścicielu (jeśli lista jest współdzielona) oraz licznik produktów (kupione/wszystkie). Użytkownik może również usunąć listę bezpośrednio z tego widoku.

## 2. Routing widoku

**Ścieżka**: `/lists`

Widok jest już zdefiniowany w pliku `code/src/routes/lists.tsx` i wykorzystuje TanStack Router. Aktualnie zawiera tylko szkielet z weryfikacją uwierzytelnienia. Implementacja rozszerzy istniejący komponent `ListsView` o pełną funkcjonalność.

## 3. Struktura komponentów

```
ListsView (główny komponent widoku - route component)
├── ListsHeader (nagłówek z tytułem i przyciskiem "Nowa lista")
├── ListsGrid (kontener na karty list)
│   └── ListCard[] (pojedyncza karta listy - wielokrotnie renderowana)
│       ├── ListCardHeader (nazwa listy i menu akcji)
│       ├── ListCardContent (właściciel i licznik produktów)
│       └── ListCardFooter (opcjonalnie: data ostatniej modyfikacji)
├── CreateListDialog (dialog tworzenia nowej listy)
└── BottomNavigation (nawigacja dolna - globalna, nie część tego widoku)
```

**Uwaga**: Bottom Navigation jest komponentem globalnym renderowanym w `__root.tsx`, więc nie jest częścią struktury komponentów tego widoku, ale musi być uwzględniony w projekcie UI (margines dolny).

## 4. Szczegóły komponentów

### 4.1. ListsView (główny komponent route)

**Opis komponentu**: Główny komponent widoku, odpowiedzialny za pobieranie danych list z backendu, zarządzanie stanem widoku oraz koordynację działania komponentów potomnych.

**Główne elementy**:
- Kontener główny (`<div>`) z odpowiednimi klasami Tailwind dla layoutu
- Komponent `ListsHeader`
- Komponent `ListsGrid`
- Komponent `CreateListDialog`
- Obsługa stanów ładowania i błędów (loading spinner, error message)

**Obsługiwane zdarzenia**:
- `onCreateList`: Otwiera dialog tworzenia nowej listy
- `onDeleteList`: Usuwa listę po potwierdzeniu przez użytkownika
- `onNavigateToList`: Przekierowuje do widoku szczegółów listy (przyszła implementacja)

**Warunki walidacji**:
- Użytkownik musi być zalogowany (sprawdzane przez `useEffect` - już zaimplementowane)
- Lista musi istnieć przed próbą usunięcia
- Użytkownik musi być właścicielem listy lub mieć uprawnienia do usunięcia (weryfikowane przez backend RLS)

**Typy**:
- `ShoppingList[]` - tablica list pobranych z backendu
- `CreateListDTO` - dane do utworzenia nowej listy
- `ListViewModel` - rozszerzony model widoku z dodatkowymi polami (liczba produktów)

**Propsy**: Brak (komponent route)

### 4.2. ListsHeader

**Opis komponentu**: Nagłówek widoku zawierający tytuł strony oraz przycisk Floating Action Button (FAB) lub przycisk w nagłówku do tworzenia nowej listy.

**Główne elementy**:
- `<div>` kontener z flexbox layout
- `<h1>` tytuł "Moje Listy Zakupów"
- `<Button>` przycisk "Nowa lista" z ikoną Plus (z `lucide-react`)

**Obsługiwane zdarzenia**:
- `onClick` na przycisku "Nowa lista" - wywołuje callback `onCreateClick` przekazany przez rodzica

**Warunki walidacji**: Brak

**Typy**: Brak specyficznych typów domenowych

**Propsy**:
```typescript
interface ListsHeaderProps {
  onCreateClick: () => void;
}
```

### 4.3. ListsGrid

**Opis komponentu**: Kontener responsywny wyświetlający karty list w układzie grid. Obsługuje stan pustej listy (brak list) oraz wyświetla odpowiedni komunikat.

**Główne elementy**:
- `<div>` kontener z grid layout (Tailwind: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4`)
- Wielokrotnie renderowane komponenty `ListCard`
- Komunikat "Brak list" gdy tablica jest pusta (z ikoną i sugestią utworzenia pierwszej listy)

**Obsługiwane zdarzenia**:
- `onListClick`: Przekazywane do `ListCard` - obsługuje kliknięcie w kartę
- `onDeleteClick`: Przekazywane do `ListCard` - obsługuje usunięcie listy

**Warunki walidacji**: Brak

**Typy**:
- `ListViewModel[]` - tablica modeli widoku list

**Propsy**:
```typescript
interface ListsGridProps {
  lists: ListViewModel[];
  onListClick: (listId: string) => void;
  onDeleteClick: (listId: string) => void;
}
```

### 4.4. ListCard

**Opis komponentu**: Pojedyncza karta reprezentująca listę zakupową. Wyświetla nazwę listy, właściciela (jeśli współdzielona), licznik produktów (kupione/wszystkie) oraz menu akcji (usuwanie).

**Główne elementy**:
- Komponent `Card` z biblioteki UI (shadcn/ui)
- `CardHeader` z nazwą listy i przyciskiem menu (trzech kropek)
- `CardContent` z informacjami:
  - Ikona użytkownika + nazwa właściciela (jeśli `created_by !== current_user_id`)
  - Ikona koszyka + licznik "X/Y produktów" lub "X kupionych z Y"
- `CardFooter` opcjonalnie z datą ostatniej modyfikacji
- Dropdown menu (z `lucide-react` i własnego komponentu lub headlessui) z opcją "Usuń listę"

**Obsługiwane zdarzenia**:
- `onClick` na karcie - nawigacja do szczegółów listy
- `onClick` na "Usuń listę" w menu - wywołuje callback `onDeleteClick`

**Warunki walidacji**: Brak (walidacja po stronie rodzica)

**Typy**:
- `ListViewModel` - model widoku pojedynczej listy

**Propsy**:
```typescript
interface ListCardProps {
  list: ListViewModel;
  currentUserId: string;
  onClick: (listId: string) => void;
  onDeleteClick: (listId: string) => void;
}
```

### 4.5. CreateListDialog

**Opis komponentu**: Dialog/modal do tworzenia nowej listy. Zawiera formularz z polem tekstowym na nazwę listy oraz przyciski "Anuluj" i "Utwórz".

**Główne elementy**:
- Komponent `Dialog` z biblioteki UI (shadcn/ui lub headlessui)
- `DialogHeader` z tytułem "Nowa lista zakupów"
- `DialogContent` z formularzem:
  - `<Label>` "Nazwa listy"
  - `<Input>` pole tekstowe (wymagane, min 1 znak, max 100 znaków)
  - Komunikat błędu walidacji (jeśli nazwa pusta)
- `DialogFooter` z przyciskami:
  - `<Button variant="outline">` "Anuluj"
  - `<Button variant="default">` "Utwórz" (disabled jeśli nazwa pusta lub trwa zapisywanie)

**Obsługiwane zdarzenia**:
- `onChange` w polu input - aktualizuje lokalny stan nazwy
- `onSubmit` formularza - wywołuje callback `onCreateList` z danymi `CreateListDTO`
- `onCancel` - zamyka dialog

**Warunki walidacji**:
- Nazwa listy jest wymagana (min 1 znak)
- Nazwa listy nie może przekraczać 100 znaków
- Walidacja po stronie klienta przed wysłaniem (disabled button)
- Walidacja po stronie backendu (Supabase RLS + constraints)

**Typy**:
- `CreateListDTO` - dane do utworzenia listy

**Propsy**:
```typescript
interface CreateListDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateList: (data: CreateListDTO) => Promise<void>;
  isCreating: boolean; // stan ładowania podczas tworzenia
}
```

## 5. Typy

### 5.1. Typy domenowe (już zdefiniowane)

```typescript
// z domain.types.ts
export type ShoppingList = {
  id: string;
  name: string;
  created_by: string;
  created_at: string | null;
  updated_at: string | null;
};

export interface CreateListDTO {
  name: string;
}
```

### 5.2. Nowe typy ViewModel

```typescript
// Nowy typ do utworzenia w domain.types.ts lub w pliku widoku

/**
 * ViewModel dla pojedynczej listy w widoku List.
 * Rozszerza ShoppingList o dodatkowe pola potrzebne do wyświetlenia.
 */
export interface ListViewModel extends ShoppingList {
  /**
   * Liczba wszystkich produktów na liście (kupione + niekupione)
   */
  totalItems: number;
  
  /**
   * Liczba produktów oznaczonych jako kupione
   */
  boughtItems: number;
  
  /**
   * Informacja czy lista jest współdzielona z innymi użytkownikami
   * (true jeśli created_by !== current_user_id)
   */
  isShared: boolean;
  
  /**
   * Opcjonalnie: nazwa właściciela listy (do wyświetlenia jeśli isShared === true)
   * Wymaga joina z tabelą profiles
   */
  ownerName?: string;
}
```

### 5.3. Typy stanu lokalnego

```typescript
// Typy dla stanu komponentu ListsView

interface ListsViewState {
  isCreateDialogOpen: boolean;
  isCreating: boolean;
  deletingListId: string | null; // ID listy aktualnie usuwanej (dla loading state)
}
```

## 6. Zarządzanie stanem

### 6.1. Stan globalny (TanStack Query)

Widok wykorzystuje **TanStack Query** do zarządzania stanem asynchronicznym (pobieranie, tworzenie, usuwanie list). Zapewnia to:
- Automatyczne cache'owanie danych
- Optimistic updates
- Refetching po zmianie focus
- Persist cache w localStorage (zgodnie z PRD)

**Query keys**:
```typescript
const listQueryKeys = {
  all: ['lists'] as const,
  detail: (id: string) => ['lists', id] as const,
};
```

**Główne queries i mutations**:

1. **useListsQuery** - pobieranie wszystkich list:
```typescript
const { data: lists, isLoading, error, refetch } = useQuery({
  queryKey: listQueryKeys.all,
  queryFn: async () => {
    const lists = await listsService.getAllLists();
    // Pobierz liczniki produktów dla każdej listy
    const listsWithCounts = await Promise.all(
      lists.map(async (list) => {
        const items = await listItemsService.getItemsByListId(list.id);
        return {
          ...list,
          totalItems: items.length,
          boughtItems: items.filter(item => item.is_bought).length,
          isShared: list.created_by !== currentUserId,
        };
      })
    );
    return listsWithCounts as ListViewModel[];
  },
  staleTime: 30000, // 30 sekund
});
```

2. **useCreateListMutation** - tworzenie nowej listy:
```typescript
const createListMutation = useMutation({
  mutationFn: (data: CreateListDTO) => listsService.createList(data),
  onSuccess: (newList) => {
    // Invalidate queries aby odświeżyć listę
    queryClient.invalidateQueries({ queryKey: listQueryKeys.all });
    // Zamknij dialog
    setIsCreateDialogOpen(false);
    // Opcjonalnie: nawiguj do nowo utworzonej listy
    // navigate({ to: `/lists/${newList.id}` });
  },
  onError: (error) => {
    // Wyświetl toast z błędem
    console.error('Błąd tworzenia listy:', error);
  },
});
```

3. **useDeleteListMutation** - usuwanie listy:
```typescript
const deleteListMutation = useMutation({
  mutationFn: (listId: string) => listsService.deleteList(listId),
  onMutate: async (listId) => {
    // Optimistic update - usuń listę z cache przed potwierdzeniem
    await queryClient.cancelQueries({ queryKey: listQueryKeys.all });
    const previousLists = queryClient.getQueryData<ListViewModel[]>(listQueryKeys.all);
    
    queryClient.setQueryData<ListViewModel[]>(
      listQueryKeys.all,
      (old) => old?.filter(list => list.id !== listId) ?? []
    );
    
    return { previousLists };
  },
  onError: (error, listId, context) => {
    // Rollback w przypadku błędu
    if (context?.previousLists) {
      queryClient.setQueryData(listQueryKeys.all, context.previousLists);
    }
    console.error('Błąd usuwania listy:', error);
  },
  onSettled: () => {
    // Refetch aby zsynchronizować stan
    queryClient.invalidateQueries({ queryKey: listQueryKeys.all });
  },
});
```

### 6.2. Stan lokalny (React useState)

Lokalny stan komponentu `ListsView`:
```typescript
const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
const [currentUserId, setCurrentUserId] = useState<string | null>(null);
```

### 6.3. Custom Hook (opcjonalnie)

Dla lepszej organizacji można stworzyć custom hook `useListsView`:

```typescript
// hooks/useListsView.ts
export function useListsView() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Pobierz ID zalogowanego użytkownika
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabaseClient.auth.getUser();
      setCurrentUserId(user?.id ?? null);
    };
    fetchUser();
  }, []);

  // Queries i mutations
  const listsQuery = useQuery({ /* ... */ });
  const createListMutation = useMutation({ /* ... */ });
  const deleteListMutation = useMutation({ /* ... */ });

  // Handlers
  const handleCreateList = async (data: CreateListDTO) => {
    await createListMutation.mutateAsync(data);
  };

  const handleDeleteList = async (listId: string) => {
    if (window.confirm('Czy na pewno chcesz usunąć tę listę?')) {
      await deleteListMutation.mutateAsync(listId);
    }
  };

  const handleListClick = (listId: string) => {
    navigate({ to: `/lists/${listId}` });
  };

  return {
    lists: listsQuery.data ?? [],
    isLoading: listsQuery.isLoading,
    error: listsQuery.error,
    currentUserId,
    isCreateDialogOpen,
    setIsCreateDialogOpen,
    handleCreateList,
    handleDeleteList,
    handleListClick,
    isCreating: createListMutation.isPending,
    isDeleting: deleteListMutation.isPending,
  };
}
```

## 7. Integracja z interfejsami

### 7.1. IListService

**Metoda**: `getAllLists()`
- **Typ żądania**: Brak parametrów
- **Typ odpowiedzi**: `Promise<ShoppingList[]>`
- **Kiedy wywoływana**: Przy montowaniu komponentu oraz po każdej mutacji (create, delete)
- **Obsługa błędów**: Wyświetlenie komunikatu błędu w UI, logowanie do konsoli

**Metoda**: `createList(data: CreateListDTO)`
- **Typ żądania**: `CreateListDTO` - obiekt z polem `name: string`
- **Typ odpowiedzi**: `Promise<ShoppingList>`
- **Kiedy wywoływana**: Po zatwierdzeniu formularza w `CreateListDialog`
- **Warunki**: Nazwa listy musi być niepusta (walidowane przed wysłaniem)
- **Obsługa błędów**: 
  - Błąd uwierzytelnienia (401) - przekierowanie do `/auth`
  - Błąd walidacji (400) - wyświetlenie komunikatu w formularzu
  - Błąd sieciowy (500) - wyświetlenie ogólnego komunikatu błędu

**Metoda**: `deleteList(listId: UUID)`
- **Typ żądania**: `string` (UUID listy)
- **Typ odpowiedzi**: `Promise<void>`
- **Kiedy wywoływana**: Po potwierdzeniu usunięcia przez użytkownika (window.confirm lub custom dialog)
- **Warunki**: 
  - Lista musi istnieć
  - Użytkownik musi mieć uprawnienia do usunięcia (weryfikowane przez Supabase RLS)
- **Obsługa błędów**:
  - Błąd uprawnień (403) - komunikat "Nie masz uprawnień do usunięcia tej listy"
  - Błąd "not found" (404) - komunikat "Lista nie została znaleziona"
  - Rollback optimistic update w przypadku błędu

### 7.2. IListItemsService

**Metoda**: `getItemsByListId(listId: UUID)`
- **Typ żądania**: `string` (UUID listy)
- **Typ odpowiedzi**: `Promise<ListItem[]>`
- **Kiedy wywoływana**: Dla każdej listy podczas pobierania danych w `useListsQuery`, aby obliczyć liczniki produktów
- **Obsługa błędów**: Jeśli pobieranie liczników się nie powiedzie, wyświetl listę z licznikami 0/0

**Optymalizacja**: W przyszłości można rozważyć stworzenie dedykowanego endpointa/widoku w Supabase, który zwróci listy z zagregowanymi licznikami w jednym zapytaniu (JOIN + COUNT), aby uniknąć N+1 queries.

## 8. Interakcje użytkownika

### 8.1. Tworzenie nowej listy (US-004)

**Przepływ**:
1. Użytkownik klika przycisk "Nowa lista" w nagłówku
2. Otwiera się dialog `CreateListDialog`
3. Użytkownik wpisuje nazwę listy w pole tekstowe
4. Przycisk "Utwórz" jest aktywny tylko gdy nazwa nie jest pusta
5. Użytkownik klika "Utwórz"
6. Wyświetla się loading state na przycisku (spinner + disabled)
7. Wysyłane jest żądanie `createList` do backendu
8. Po sukcesie:
   - Dialog się zamyka
   - Nowa lista pojawia się na górze listy (dzięki invalidateQueries)
   - Opcjonalnie: wyświetlany jest toast "Lista utworzona pomyślnie"
9. Po błędzie:
   - Wyświetlany jest komunikat błędu w dialogu
   - Dialog pozostaje otwarty
   - Użytkownik może spróbować ponownie lub anulować

**Walidacja**:
- Nazwa listy: wymagana, min 1 znak, max 100 znaków
- Walidacja w czasie rzeczywistym (onChange) - wyświetlanie komunikatu błędu pod polem
- Przycisk "Utwórz" disabled jeśli walidacja nie przechodzi

### 8.2. Przeglądanie list

**Przepływ**:
1. Użytkownik wchodzi na widok `/lists`
2. Wyświetlany jest loading spinner podczas pobierania danych
3. Po załadowaniu wyświetlane są karty list w układzie grid
4. Każda karta pokazuje:
   - Nazwę listy
   - Ikonę użytkownika + "Właściciel: [nazwa]" (jeśli lista współdzielona)
   - Ikonę koszyka + "X/Y produktów" lub "X kupionych z Y"
   - Przycisk menu (trzech kropek) z opcją "Usuń"
5. Jeśli brak list, wyświetlany jest komunikat:
   - Ikona pustego koszyka
   - Tekst "Nie masz jeszcze żadnych list"
   - Sugestia "Kliknij przycisk 'Nowa lista', aby utworzyć pierwszą listę"

**Stany**:
- Loading: Spinner w centrum ekranu
- Error: Komunikat błędu z przyciskiem "Spróbuj ponownie" (wywołuje refetch)
- Empty: Komunikat o braku list
- Success: Grid z kartami list

### 8.3. Usuwanie listy

**Przepływ**:
1. Użytkownik klika przycisk menu (trzech kropek) na karcie listy
2. Otwiera się dropdown menu z opcją "Usuń listę"
3. Użytkownik klika "Usuń listę"
4. Wyświetla się dialog potwierdzenia (window.confirm lub custom dialog):
   - Tytuł: "Usuń listę"
   - Treść: "Czy na pewno chcesz usunąć listę '[nazwa listy]'? Ta operacja jest nieodwracalna."
   - Przyciski: "Anuluj" i "Usuń"
5. Jeśli użytkownik kliknie "Usuń":
   - Karta listy natychmiast znika z UI (optimistic update)
   - Wysyłane jest żądanie `deleteList` do backendu
   - Po sukcesie: lista pozostaje usunięta
   - Po błędzie: lista wraca do UI, wyświetlany jest toast z błędem
6. Jeśli użytkownik kliknie "Anuluj":
   - Dialog się zamyka, nic się nie dzieje

**Optimistic UI**:
- Lista znika natychmiast po kliknięciu "Usuń" (przed odpowiedzią z serwera)
- W przypadku błędu lista wraca na swoje miejsce
- Podczas usuwania można wyświetlić subtelny loading indicator na karcie

### 8.4. Nawigacja do szczegółów listy (przyszła implementacja)

**Przepływ**:
1. Użytkownik klika na kartę listy (poza przyciskiem menu)
2. Aplikacja nawiguje do `/lists/[listId]`
3. Otwiera się widok szczegółów listy z produktami

**Uwaga**: Ten widok nie jest częścią obecnej implementacji, ale należy przygotować handler `onListClick` w komponencie.

## 9. Warunki i walidacja

### 9.1. Warunki weryfikowane przez interfejs (backend)

**IListService.createList**:
- **Warunek**: Użytkownik musi być zalogowany
  - **Weryfikacja**: Supabase Auth + RLS policy
  - **Komponent**: `CreateListDialog`
  - **Wpływ na UI**: Jeśli użytkownik nie jest zalogowany (błąd 401), przekierowanie do `/auth`

- **Warunek**: Nazwa listy jest wymagana
  - **Weryfikacja**: NOT NULL constraint w bazie danych
  - **Komponent**: `CreateListDialog`
  - **Wpływ na UI**: Przycisk "Utwórz" disabled jeśli pole puste, komunikat błędu pod polem

- **Warunek**: Nazwa listy nie może być pusta (po trim)
  - **Weryfikacja**: Backend validation (jeśli zaimplementowana)
  - **Komponent**: `CreateListDialog`
  - **Wpływ na UI**: Wyświetlenie komunikatu błędu "Nazwa listy nie może być pusta"

**IListService.deleteList**:
- **Warunek**: Lista musi istnieć
  - **Weryfikacja**: Foreign key constraint
  - **Komponent**: `ListCard`
  - **Wpływ na UI**: Jeśli lista nie istnieje (404), wyświetl toast "Lista nie została znaleziona" i usuń z cache

- **Warunek**: Użytkownik musi mieć uprawnienia do usunięcia listy
  - **Weryfikacja**: Supabase RLS policy (tylko created_by lub członkowie z uprawnieniami)
  - **Komponent**: `ListCard`
  - **Wpływ na UI**: Jeśli brak uprawnień (403), wyświetl toast "Nie masz uprawnień do usunięcia tej listy" i przywróć listę w UI

### 9.2. Walidacja po stronie klienta

**Formularz tworzenia listy**:
- **Pole**: Nazwa listy
  - **Reguły**: 
    - Wymagane (min 1 znak po trim)
    - Maksymalnie 100 znaków
  - **Walidacja**: onChange + onSubmit
  - **Komunikaty błędów**:
    - Puste pole: "Nazwa listy jest wymagana"
    - Za długa nazwa: "Nazwa listy może mieć maksymalnie 100 znaków"
  - **Wpływ na UI**: 
    - Komunikat błędu wyświetlany pod polem (czerwony tekst)
    - Przycisk "Utwórz" disabled jeśli walidacja nie przechodzi
    - Pole input z czerwoną obwódką jeśli błąd

## 10. Obsługa błędów

### 10.1. Błędy sieciowe

**Scenariusz**: Brak połączenia z internetem podczas pobierania list
- **Obsługa**: 
  - Wyświetl komunikat "Nie udało się pobrać list. Sprawdź połączenie z internetem."
  - Przycisk "Spróbuj ponownie" wywołujący `refetch`
  - Jeśli dane są w cache (TanStack Query), wyświetl je z informacją "Dane mogą być nieaktualne"

**Scenariusz**: Brak połączenia podczas tworzenia listy
- **Obsługa**:
  - Wyświetl komunikat błędu w dialogu: "Nie udało się utworzyć listy. Sprawdź połączenie z internetem."
  - Przycisk "Spróbuj ponownie" w dialogu
  - Dialog pozostaje otwarty z wypełnionymi danymi

**Scenariusz**: Brak połączenia podczas usuwania listy
- **Obsługa**:
  - Rollback optimistic update (lista wraca do UI)
  - Toast: "Nie udało się usunąć listy. Sprawdź połączenie z internetem."
  - Użytkownik może spróbować ponownie

### 10.2. Błędy uwierzytelnienia (401)

**Scenariusz**: Token wygasł podczas operacji
- **Obsługa**:
  - Automatyczne wylogowanie użytkownika
  - Przekierowanie do `/auth`
  - Toast: "Sesja wygasła. Zaloguj się ponownie."

### 10.3. Błędy uprawnień (403)

**Scenariusz**: Użytkownik próbuje usunąć listę, do której nie ma uprawnień
- **Obsługa**:
  - Rollback optimistic update
  - Toast: "Nie masz uprawnień do usunięcia tej listy"
  - Lista pozostaje w UI

### 10.4. Błędy walidacji (400)

**Scenariusz**: Backend odrzuca żądanie createList z powodu nieprawidłowych danych
- **Obsługa**:
  - Wyświetl komunikat błędu w dialogu pod polem input
  - Dialog pozostaje otwarty
  - Użytkownik może poprawić dane i spróbować ponownie

### 10.5. Błędy serwera (500)

**Scenariusz**: Błąd wewnętrzny serwera podczas operacji
- **Obsługa**:
  - Toast: "Wystąpił błąd serwera. Spróbuj ponownie później."
  - Logowanie błędu do konsoli (dla debugowania)
  - Rollback optimistic updates jeśli dotyczy

### 10.6. Przypadki brzegowe

**Scenariusz**: Użytkownik nie ma żadnych list (nowy użytkownik)
- **Obsługa**:
  - Wyświetl przyjazny komunikat z ikoną
  - Tekst: "Nie masz jeszcze żadnych list"
  - Sugestia: "Kliknij przycisk 'Nowa lista', aby utworzyć pierwszą listę"
  - Przycisk "Utwórz pierwszą listę" (opcjonalnie)

**Scenariusz**: Wszystkie listy zostały usunięte
- **Obsługa**: Jak wyżej (stan pusty)

**Scenariusz**: Pobieranie liczników produktów nie powiodło się dla niektórych list
- **Obsługa**:
  - Wyświetl listę z licznikami "0/0" lub "—" (placeholder)
  - Nie blokuj wyświetlania całego widoku
  - Loguj błąd do konsoli

**Scenariusz**: Użytkownik próbuje utworzyć listę z nazwą składającą się tylko ze spacji
- **Obsługa**:
  - Walidacja po stronie klienta: trim nazwy przed wysłaniem
  - Jeśli po trim nazwa jest pusta, wyświetl błąd "Nazwa listy jest wymagana"

## 11. Kroki implementacji

### Krok 1: Przygotowanie typów i interfejsów
1. Dodaj typ `ListViewModel` do `domain.types.ts`
2. Dodaj interfejsy props dla wszystkich komponentów do osobnego pliku `lists-view.types.ts` (opcjonalnie)

### Krok 2: Implementacja custom hooka `useListsView`
1. Utwórz plik `hooks/useListsView.ts`
2. Zaimplementuj logikę pobierania ID użytkownika
3. Zaimplementuj `useQuery` dla pobierania list z licznikami produktów
4. Zaimplementuj `useMutation` dla tworzenia listy
5. Zaimplementuj `useMutation` dla usuwania listy z optimistic updates
6. Zaimplementuj handlery: `handleCreateList`, `handleDeleteList`, `handleListClick`
7. Zwróć wszystkie potrzebne wartości i funkcje

### Krok 3: Implementacja komponentu `CreateListDialog`
1. Utwórz plik `components/lists/CreateListDialog.tsx`
2. Zaimplementuj strukturę dialogu z użyciem komponentów UI (Dialog, Input, Button)
3. Dodaj lokalny stan dla nazwy listy
4. Zaimplementuj walidację w czasie rzeczywistym (onChange)
5. Zaimplementuj obsługę submit formularza
6. Dodaj obsługę stanu ładowania (disabled button, spinner)
7. Dodaj obsługę błędów (wyświetlanie komunikatów)

### Krok 4: Implementacja komponentu `ListCard`
1. Utwórz plik `components/lists/ListCard.tsx`
2. Zaimplementuj strukturę karty z użyciem komponentów UI (Card, CardHeader, CardContent)
3. Dodaj wyświetlanie nazwy listy
4. Dodaj warunkowe wyświetlanie informacji o właścicielu (jeśli `isShared`)
5. Dodaj wyświetlanie liczników produktów z ikonami
6. Zaimplementuj dropdown menu z opcją "Usuń" (użyj lucide-react i headlessui lub własny komponent)
7. Dodaj obsługę kliknięcia w kartę (onClick na całej karcie, z wykluczeniem menu)
8. Dodaj obsługę usuwania (onClick w menu)

### Krok 5: Implementacja komponentu `ListsGrid`
1. Utwórz plik `components/lists/ListsGrid.tsx`
2. Zaimplementuj kontener grid z responsywnym layoutem (Tailwind)
3. Dodaj mapowanie listy `ListViewModel[]` na komponenty `ListCard`
4. Dodaj obsługę stanu pustego (brak list) - wyświetl komunikat z ikoną
5. Przekaż propsy `onListClick` i `onDeleteClick` do każdego `ListCard`

### Krok 6: Implementacja komponentu `ListsHeader`
1. Utwórz plik `components/lists/ListsHeader.tsx`
2. Zaimplementuj strukturę nagłówka z flexbox layout
3. Dodaj tytuł "Moje Listy Zakupów"
4. Dodaj przycisk "Nowa lista" z ikoną Plus (z lucide-react)
5. Podłącz callback `onCreateClick`

### Krok 7: Aktualizacja głównego komponentu `ListsView`
1. Otwórz plik `routes/lists.tsx`
2. Zaimportuj custom hook `useListsView`
3. Zaimportuj wszystkie komponenty potomne
4. Wywołaj hook i destrukturyzuj potrzebne wartości
5. Zaimplementuj obsługę stanów: loading (spinner), error (komunikat + retry), success (grid)
6. Zrenderuj `ListsHeader` z przekazaniem `onCreateClick`
7. Zrenderuj `ListsGrid` z przekazaniem list i handlerów
8. Zrenderuj `CreateListDialog` z przekazaniem stanu i handlerów
9. Dodaj margines dolny dla Bottom Navigation (np. `pb-20`)

### Krok 8: Stylowanie i responsywność
1. Upewnij się, że grid jest responsywny (1 kolumna na mobile, 2-3 na desktop)
2. Dodaj odpowiednie paddingi i marginesy
3. Upewnij się, że dialog jest responsywny i dobrze wygląda na mobile
4. Przetestuj na różnych rozdzielczościach

### Krok 9: Obsługa błędów i edge cases
1. Dodaj obsługę błędów sieciowych (try-catch, toast notifications)
2. Dodaj obsługę błędów uwierzytelnienia (redirect do /auth)
3. Dodaj obsługę stanu pustego (brak list)
4. Dodaj obsługę błędów walidacji w formularzu
5. Przetestuj wszystkie scenariusze błędów

### Krok 10: Optymalizacja i testy
1. Zoptymalizuj pobieranie liczników produktów (rozważ dedykowany endpoint)
2. Dodaj debouncing do walidacji formularza (jeśli potrzebne)
3. Przetestuj optimistic updates (usuwanie listy)
4. Przetestuj działanie offline (cache w TanStack Query)
5. Przetestuj na różnych przeglądarkach

### Krok 11: Integracja z Bottom Navigation (jeśli jeszcze nie istnieje)
1. Utwórz komponent `BottomNavigation` w `components/BottomNavigation.tsx`
2. Dodaj linki do `/lists`, `/sets`, `/history`
3. Dodaj aktywny stan dla bieżącej ścieżki
4. Zintegruj w `__root.tsx` (renderuj warunkowo, nie na /auth)
5. Upewnij się, że widok List ma odpowiedni margines dolny

### Krok 12: Finalizacja i dokumentacja
1. Dodaj komentarze JSDoc do wszystkich komponentów i funkcji
2. Upewnij się, że wszystkie typy są poprawnie zdefiniowane
3. Przetestuj całą funkcjonalność end-to-end
4. Zaktualizuj dokumentację projektu (jeśli istnieje)
