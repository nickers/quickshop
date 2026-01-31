Jako starszy programista frontendu Twoim zadaniem jest stworzenie szczegółowego planu wdrożenia nowego widoku w aplikacji internetowej. Plan ten powinien być kompleksowy i wystarczająco jasny dla innego programisty frontendowego, aby mógł poprawnie i wydajnie wdrożyć widok.

Najpierw przejrzyj następujące informacje:

1. Product Requirements Document (PRD):
<prd>
@.ai/prd.md
</prd>

2. Opis widoku:
<view_description>
**Pulpit Zestawów (Szablony)** (ui-plan.md §2.4). Ścieżka: /sets. Cel: zarządzanie szablonami zakupowymi (np. Śniadanie, Impreza). Kluczowe komponenty: karty zestawów z przyciskiem „Dodaj do listy”, Bottom Navigation. UX: wyróżnienie wizualne (np. inny kolor nagłówka) względem zwykłych list.
</view_description>

3. User Stories:
<user_stories>
* US-013 Zarządzanie zestawami: zakładka Zestawy, tworzenie nowego pustego zestawu, edycja produktów w zestawie.
* US-014 Dodawanie zestawu do listy: przycisk „Dodaj do listy” przy zestawie; wybór listy; produkty z zestawu trafiają na listę; przy konfliktach nazw – ConflictResolutionModal (zwiększenie ilości / konkatenacja).
</user_stories>

4. Interface description:
<interface_description>
SetsService: getAllSets(), getSetItems(setId), createSet(CreateSetDTO), createSetFromList(listId, CreateSetDTO), addSetItem, updateSetItem, deleteSetItem, deleteSet. ListItemsService: bulkCreateItems(items) – przy dodawaniu zestawu do listy; konflikty rozwiązywane w UI (updateItem dla duplikatów z konkatenacją ilości).
</interface_description>

5. Interface implementation:
<interface_implementation>
@code/src/services/sets.service.ts, @code/src/services/lists.service.ts, @code/src/services/items.service.ts, @code/src/components/list-details/SetConflictResolutionDialog.tsx, @code/src/routes/sets.index.tsx (obecny placeholder)
</interface_implementation>

6. Type Definitions:
<type_definitions>
@code/src/types/domain.types.ts (ShoppingSet, SetItem, CreateSetDTO, CreateSetItemDTO, CreateListItemDTO), @code/src/db/database.types.ts
</type_definitions>

7. Tech Stack:
<tech_stack>
@.ai/tech-stack.md
</tech_stack>

8. Plan implementacji (istniejący):
<impl_plan>
@.ai/impl-plan-05-sets-dashboard.md
</impl_plan>

9. Plan bazy danych:
<db_plan>
@.ai/db-plan.md
</db_plan>

Przed utworzeniem ostatecznego planu wdrożenia przeprowadź analizę i planowanie wewnątrz tagów <implementation_breakdown>. Wykonaj kroki 1–12 podziału implementacji.

Po analizie dostarcz plan wdrożenia w formacie Markdown (sekcje 1–11). Ostateczne wyniki w języku polskim, zapisane w pliku **.ai/sets-dashboard-view-implementation-plan.md**. Nie uwzględniaj analizy w końcowym wyniku.
