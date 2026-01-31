Jako starszy programista frontendu Twoim zadaniem jest stworzenie szczegółowego planu wdrożenia komponentów UX i wskaźnika synchronizacji. Plan ten powinien być kompleksowy i wystarczająco jasny dla innego programisty frontendowego, aby mógł poprawnie i wydajnie wdrożyć widok.

Najpierw przejrzyj następujące informacje:

1. Product Requirements Document (PRD):
<prd>
@.ai/prd.md
</prd>

2. Opis widoku / komponentów:
<view_description>
**SyncStatusIndicator i dopracowanie UX** (ui-plan.md §5.3, §2.3, §5.1). SyncStatusIndicator: stany – zielony/ukryty (zsync), pomarańczowy/pulsujący (sync w toku / offline), czerwony (błąd – klik: szczegóły/ponów). Źródło stanu: TanStack Query (pending mutations), offline detector. ListItemRow: swipe-to-delete (mobile: czerwone tło + kosz; desktop: fallback), long-press → modal edycji (ilość, notatka). StickyInputBar: walidacja niepustego tekstu, Enter = submit, feedback przy błędzie (pulsowanie, „Wpisz nazwę produktu”). Optimistic UI: elementy pending z obniżoną opacity; spójne z SyncStatusIndicator.
</view_description>

3. User Stories:
<user_stories>
* US-008 Optimistic UI: pozycje dodane offline synchronizowane po odzyskaniu połączenia; stan sync w UI.
* US-016 Synchronizacja po odzyskaniu połączenia: wykrywanie powrotu łączności, wysyłka lokalnych zmian, odzwierciedlenie stanu w UI.
* US-009 Oznaczanie jako kupione: swipe zmienia status (swipe-to-delete dla usuwania).
* US-007/US-010: edycja ilości/notatki (long-press), walidacja pola dodawania produktu.
</user_stories>

4. Interface description:
<interface_description>
TanStack Query: useMutation (isPending, isError) – źródło stanu SyncStatusIndicator. ListItemsService: updateItem (long-press edycja), deleteItem (swipe-to-delete). Offline: navigator.onLine lub event listener; retry mutations po reconnect. Walidacja: niepusty string przed createItem (StickyInputBar).
</interface_description>

5. Interface implementation:
<interface_implementation>
@code/src/components/list-details/ListItemRow.tsx, @code/src/components/list-details/StickyInputBar.tsx, @code/src/hooks/useListDetails.ts, @code/src/components/list-details/ListDetailsHeader.tsx (miejsce na SyncStatusIndicator). Nowy: SyncStatusIndicator (np. src/components/layout/SyncStatusIndicator.tsx lub list-details/). Opcjonalnie: useSyncStatus hook, react-swipeable lub touch events.
</interface_implementation>

6. Type Definitions:
<type_definitions>
@code/src/types/domain.types.ts (ListItem, UpdateListItemDTO), @code/src/db/database.types.ts
</type_definitions>

7. Tech Stack:
<tech_stack>
@.ai/tech-stack.md
</tech_stack>

8. Plan implementacji (istniejący):
<impl_plan>
@.ai/impl-plan-09-sync-ux.md
</impl_plan>

9. Plan bazy danych:
<db_plan>
@.ai/db-plan.md
</db_plan>

Przed utworzeniem ostatecznego planu wdrożenia przeprowadź analizę i planowanie wewnątrz tagów <implementation_breakdown>. Wykonaj kroki 1–12 podziału implementacji.

Po analizie dostarcz plan wdrożenia w formacie Markdown (sekcje 1–11). Ostateczne wyniki w języku polskim, zapisane w pliku **.ai/sync-ux-implementation-plan.md**. Nie uwzględniaj analizy w końcowym wyniku.
