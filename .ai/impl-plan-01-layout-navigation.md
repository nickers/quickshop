# Plan implementacji: Część 1 – Layout i nawigacja

**Odniesienie:** ui-plan.md §1, §4, §5.6  
**Część:** 1 – Layout i nawigacja

## Cel
Wprowadzenie MainLayout (Header + main w kontenerze max-w-md + Bottom Nav) oraz routingu dla `/sets` i `/history`. Nawigacja główna = Bottom Navigation Bar (Listy, Zestawy, Historia); Header kontekstowy (tytuł/akcje z trasy).

## Zadania

### 1. MainLayout
- [x] Utworzyć komponent `MainLayout` w `src/components/layout/MainLayout.tsx`.
- [x] Struktura: `<Header />` (kontekstowy), `<main className="container mx-auto max-w-md px-4 pb-24 min-h-screen"> {children} </main>`, `<BottomNav />`.
- [x] Header czyta `useRouterState().location.pathname` i wyświetla tytuł (Listy / Zestawy / Historia).

### 2. Bottom Navigation Bar
- [x] Utworzyć `src/components/layout/BottomNav.tsx`.
- [x] Trzy linki: **Listy** (`/lists`), **Zestawy** (`/sets`), **Historia** (`/history`).
- [x] Ikony: ListTodo, Layers, History z lucide-react; fixed bottom, safe-area; wyróżnienie aktywnej trasy.
- [x] Widoczność: tylko na `/lists`, `/sets`, `/history` (w MainLayout).

### 3. Header kontekstowy
- [x] Header: tytuł z trasy (Listy / Zestawy / Historia), dropdown użytkownika z "Wyloguj się" (bez bocznego menu).
- [x] Na `/lists/:listId` i `/sets/:id` Header i Bottom Nav nie są renderowane – pełny nagłówek w widoku (ListDetailsHeader).

### 4. Integracja __root z MainLayout
- [x] W `__root.tsx`: dla tras app (`/lists*`, `/sets*`, `/history`) renderować `<MainLayout><Outlet /></MainLayout>`.

### 5. Routing – nowe ścieżki
- [x] Dodane: `sets.tsx`, `sets.index.tsx`, `sets.$setId.tsx`, `history.tsx` z placeholderami.

### 6. Redirect i ochrona
- [x] Zachowany `/` → redirect do `/lists` lub `/auth`. Auth w komponentach (useEffect).

## Kryteria ukończenia
- MainLayout z Headerem i Bottom Nav jest używany na `/lists`, `/sets`, `/history`.
- Na `/lists/:id` i `/sets/:id` Bottom Nav jest ukryty; nagłówek to komponent szczegółów (ListDetailsHeader / przyszły SetDetailsHeader).
- Trasy `/sets`, `/sets/:setId`, `/history` istnieją i wyświetlają placeholdery.
- Widok list (`/lists`) i szczegóły listy (`/lists/:listId`) działają jak wcześniej, w nowym layoutcie.

## Uwagi
- ListDetailsHeader już ma Wstecz i tytuł – na trasie listy szczegóły nie trzeba drugiego Header w root; upewnić się, że __root nie renderuje głównego Header na `/lists/:listId` albo Header na tej trasie jest minimalny (np. tylko Bottom Nav nie jest pokazywany).
- Spójność: jeśli Header w __root ma być jeden dla wszystkich, to na list-details może być tylko ListDetailsHeader wewnątrz strony (bez drugiego paska z "QuickShop"). Obecnie showHeader = path !== "/auth" && path !== "/" – więc na /lists/:listId jest Header. Do ustalenia: albo na /lists/:listId nie pokazywać głównego Header, tylko treść strony z ListDetailsHeader, albo główny Header zawsze z tytułem kontekstowym (wtedy ListDetailsHeader bez powielania tytułu). Zalecenie: na trasach szczegółów (/lists/:id, /sets/:id) nie renderować górnego Header z __root – tylko MainLayout z main + BottomNav ukryty; wewnątrz strony pełny nagłówek (ListDetailsHeader).
