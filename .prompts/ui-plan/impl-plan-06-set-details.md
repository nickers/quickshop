Jako starszy programista frontendu Twoim zadaniem jest stworzenie szczegółowego planu wdrożenia nowego widoku w aplikacji internetowej. Plan ten powinien być kompleksowy i wystarczająco jasny dla innego programisty frontendowego, aby mógł poprawnie i wydajnie wdrożyć widok.

Najpierw przejrzyj następujące informacje:

1. Product Requirements Document (PRD):
<prd>
@.ai/prd.md
</prd>

2. Opis widoku:
<view_description>
**Szczegóły Zestawu** (ui-plan.md §2.5). Ścieżka: /sets/:setId. Cel: edycja zawartości szablonu. Komponenty: nagłówek z etykietą „TRYB SZABLONU”, lista produktów w zestawie (bez checkboxów „kupione”), Sticky Input do dodawania pozycji. Powrót: przycisk Wstecz → /sets. Bottom Nav na tej trasie ukryty.
</view_description>

3. User Stories:
<user_stories>
* US-012 Tworzenie zestawu z listy: opcja „Zapisz jako zestaw” z poziomu listy (integracja z ListDetailsHeader).
* US-013 Zarządzanie zestawami: edycja produktów wewnątrz zestawu (dodawanie, edycja ilości/notatki, usuwanie, ewentualnie sortowanie).
</user_stories>

4. Interface description:
<interface_description>
SetsService: getSetItems(setId), addSetItem(CreateSetItemDTO), updateSetItem(itemId, data), deleteSetItem(itemId), getListById / getAllSets (dla nawigacji). CreateSetItemDTO: set_id, name, quantity?, note?, sort_order?.
</interface_description>

5. Interface implementation:
<interface_implementation>
@code/src/services/sets.service.ts, @code/src/components/list-details/StickyInputBar.tsx (wariant dla zestawu), @code/src/routes/sets.$setId.tsx (obecny placeholder). Hook useSetDetails do utworzenia.
</interface_implementation>

6. Type Definitions:
<type_definitions>
@code/src/types/domain.types.ts (ShoppingSet, SetItem, CreateSetItemDTO), @code/src/db/database.types.ts
</type_definitions>

7. Tech Stack:
<tech_stack>
@.ai/tech-stack.md
</tech_stack>

8. Plan implementacji (istniejący):
<impl_plan>
@.ai/impl-plan-06-set-details.md
</impl_plan>

9. Plan bazy danych:
<db_plan>
@.ai/db-plan.md
</db_plan>

Przed utworzeniem ostatecznego planu wdrożenia przeprowadź analizę i planowanie wewnątrz tagów <implementation_breakdown>. Wykonaj kroki 1–12 podziału implementacji.

Po analizie dostarcz plan wdrożenia w formacie Markdown (sekcje 1–11). Ostateczne wyniki w języku polskim, zapisane w pliku **.ai/set-details-view-implementation-plan.md**. Nie uwzględniaj analizy w końcowym wyniku.
