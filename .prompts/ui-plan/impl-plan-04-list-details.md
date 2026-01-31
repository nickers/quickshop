Jako starszy programista frontendu Twoim zadaniem jest stworzenie szczegółowego planu wdrożenia nowego widoku w aplikacji internetowej. Plan ten powinien być kompleksowy i wystarczająco jasny dla innego programisty frontendowego, aby mógł poprawnie i wydajnie wdrożyć widok.

Najpierw przejrzyj następujące informacje:

1. Product Requirements Document (PRD):
<prd>
@.ai/prd.md
</prd>

2. Opis widoku:
<view_description>
**Szczegóły Listy (Widok Zakupów)** (ui-plan.md §2.3, §5.1, §5.2). Ścieżka: /lists/:listId. Cel: zarządzanie produktami na liście, realizacja zakupów. Komponenty: ListItemRow (checkbox, nazwa, ilość, drag handle), StickyInput, sekcja Kupione, nagłówek z Udostępnij i Menu (Archiwizuj, Zmień nazwę). UX: Optimistic UI (opacity dla niesynchronizowanych), swipe-to-delete, long-press (edycja ilości/notatki).
</view_description>

3. User Stories:
<user_stories>
* US-007 Dodawanie produktu: pole tekstowe, opcjonalnie ilość/notatka, produkt pojawia się na liście.
* US-008 Optimistic UI: produkt pojawia się natychmiast; synchronizacja po odzyskaniu połączenia.
* US-009 Oznaczanie jako kupione: checkbox/swipe, produkt w sekcji Kupione/wyszarzony.
* US-010 Obsługa duplikatów: wykrywanie duplikatu nazwy, ConflictModal (edycja ilości), nadpisanie ilości.
* US-011 Sortowanie: drag & drop, zapis nowej kolejności.
</user_stories>

4. Interface description:
<interface_description>
ListItemsService: getItemsByListId(listId), createItem(CreateListItemDTO), updateItem(UpdateListItemDTO), deleteItem(itemId), reorderItems(items), bulkCreateItems(items). ListsService: getListById(listId), completeShoppingTrip(listId), shareListWithEmail(listId, email). Duplikaty: UI wykrywa duplikat → updateItem (merge quantity), nie createItem.
</interface_description>

5. Interface implementation:
<interface_implementation>
@code/src/services/items.service.ts, @code/src/services/lists.service.ts, @code/src/hooks/useListDetails.ts, @code/src/components/list-details/ListDetailsHeader.tsx, @code/src/components/list-details/ActiveItemsList.tsx, @code/src/components/list-details/CompletedItemsSection.tsx, @code/src/components/list-details/ListItemRow.tsx, @code/src/components/list-details/StickyInputBar.tsx, @code/src/components/list-details/ItemConflictDialog.tsx, @code/src/routes/lists.$listId.tsx
</interface_implementation>

6. Type Definitions:
<type_definitions>
@code/src/types/domain.types.ts (ShoppingList, ListItem, CreateListItemDTO, UpdateListItemDTO), @code/src/db/database.types.ts
</type_definitions>

7. Tech Stack:
<tech_stack>
@.ai/tech-stack.md
</tech_stack>

8. Plan implementacji (istniejący):
<impl_plan>
@.ai/impl-plan-04-list-details.md
</impl_plan>

9. Plan bazy danych:
<db_plan>
@.ai/db-plan.md
</db_plan>

Przed utworzeniem ostatecznego planu wdrożenia przeprowadź analizę i planowanie wewnątrz tagów <implementation_breakdown>. Wykonaj kroki 1–12 podziału implementacji.

Po analizie dostarcz plan wdrożenia w formacie Markdown (sekcje 1–11). Ostateczne wyniki w języku polskim, zapisane w pliku **.ai/full-impl-plan-04-list-details-view-implementation-plan.md**. Nie uwzględniaj analizy w końcowym wyniku.
