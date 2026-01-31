Jako starszy programista frontendu Twoim zadaniem jest stworzenie szczegółowego planu wdrożenia nowego widoku w aplikacji internetowej. Plan ten powinien być kompleksowy i wystarczająco jasny dla innego programisty frontendowego, aby mógł poprawnie i wydajnie wdrożyć widok.

Najpierw przejrzyj następujące informacje:

1. Product Requirements Document (PRD):
<prd>
@.ai/prd.md
</prd>

2. Opis widoku:
<view_description>
**Pulpit List (Widok Główny)** (ui-plan.md §2.2). Ścieżka: /lists (lub / po redirect). Cel: przegląd aktywnych list zakupowych i szybkie przejście do konkretnej listy. Kluczowe informacje: nazwy list, właściciel (jeśli współdzielona), liczba produktów (kupione/wszystkie). Komponenty: karty list (List Card), przycisk „Nowa lista” (FAB lub w nagłówku), Bottom Navigation.
</view_description>

3. User Stories:
<user_stories>
* US-004 Tworzenie nowej listy: przycisk „Nowa lista” w widoku list; użytkownik podaje nazwę; nowa lista pojawia się na liście.
* US-005 Współdzielenie listy: opcja Udostępnij w ustawieniach listy (integracja z widokiem szczegółów).
* US-006 Archiwizacja listy: przycisk Zakończ zakupy/Archiwizuj (widok szczegółów).
</user_stories>

4. Interface description:
<interface_description>
ListsService (business-logic-plan): getAllLists() – pobiera listy użytkownika (RLS); createList(data: CreateListDTO) – US-004; getListById(listId); updateList(listId, data); deleteList(listId); shareListWithEmail(listId, email) – US-005; completeShoppingTrip(listId) – US-006.
</interface_description>

5. Interface implementation:
<interface_implementation>
@code/src/services/lists.service.ts, @code/src/hooks/useListsView.ts, @code/src/components/lists/ListsHeader.tsx, @code/src/components/lists/ListsGrid.tsx, @code/src/components/lists/ListCard.tsx, @code/src/components/lists/CreateListDialog.tsx, @code/src/routes/lists.index.tsx
</interface_implementation>

6. Type Definitions:
<type_definitions>
@code/src/types/domain.types.ts (ShoppingList, CreateListDTO, ListViewModel), @code/src/db/database.types.ts
</type_definitions>

7. Tech Stack:
<tech_stack>
@.ai/tech-stack.md
</tech_stack>

8. Plan implementacji (istniejący):
<impl_plan>
@.ai/impl-plan-03-lists-dashboard.md
</impl_plan>

9. Plan bazy danych:
<db_plan>
@.ai/db-plan.md
</db_plan>

Przed utworzeniem ostatecznego planu wdrożenia przeprowadź analizę i planowanie wewnątrz tagów <implementation_breakdown> w swoim bloku myślenia. W swoim podziale wykonaj kroki 1–12 (podsumowanie sekcji, wymagania, komponenty, drzewo, typy, stan, wywołania backendu, mapowanie user stories, interakcje, warunki, błędy, wyzwania).

Po przeprowadzeniu analizy dostarcz plan wdrożenia w formacie Markdown z sekcjami: 1. Przegląd, 2. Routing, 3. Struktura komponentów, 4. Szczegóły komponentów, 5. Typy, 6. Zarządzanie stanem, 7. Integracja z interfejsami, 8. Interakcje użytkownika, 9. Warunki i walidacja, 10. Obsługa błędów, 11. Kroki implementacji.

Ostateczne wyniki w języku polskim, zapisane w pliku **.ai/full-impl-plan-03-lists-dashboard-view-implementation-plan.md**. Nie uwzględniaj analizy w końcowym wyniku.
