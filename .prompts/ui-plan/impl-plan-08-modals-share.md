Jako starszy programista frontendu Twoim zadaniem jest stworzenie szczegółowego planu wdrożenia komponentów modalnych i integracji z widokami. Plan ten powinien być kompleksowy i wystarczająco jasny dla innego programisty frontendowego, aby mógł poprawnie i wydajnie wdrożyć widok.

Najpierw przejrzyj następujące informacje:

1. Product Requirements Document (PRD):
<prd>
@.ai/prd.md
</prd>

2. Opis widoku / komponentów:
<view_description>
**Modale konfliktów i Share** (ui-plan.md §5.4, §5.5, §3). ConflictModal (pojedynczy duplikat): pole edycji ilości wypełnione obecną wartością z listy; Zatwierdź → nadpisanie ilości; Anuluj → bez zmian. ConflictResolutionModal (import zestawu): lista konfliktowych pozycji z checkboxem „Zaktualizuj ilość”; podgląd konkatenacji (np. „6 szt”+„10 szt”→„6 szt+10 szt”); Zatwierdź/Anuluj. ShareModal: pole email do zaproszenia, lista osób z dostępem (z opcją usunięcia). Integracja: ListDetailsHeader onShare → ShareModal; widok listy – duplikat → ItemConflictDialog; „Dodaj do listy” (zestaw) z konfliktami → SetConflictResolutionDialog.
</view_description>

3. User Stories:
<user_stories>
* US-005 Współdzielenie listy: opcja Udostępnij, pole e-mail, zaproszona osoba widzi listę.
* US-010 Obsługa duplikatów: zduplikowana nazwa → jedna pozycja z możliwością zsumowania ilości (ConflictModal pojedynczy).
* US-014 Dodawanie zestawu do listy: przy konfliktach nazw – ConflictResolutionModal (zaznaczone = konkatenacja ilości, odznaczone = ignoruj; nowe produkty dodane).
</user_stories>

4. Interface description:
<interface_description>
ListsService: shareListWithEmail(listId, email) – US-005; lookup profile by email, insert list_members. ListItemsService: updateItem (nadpisanie quantity przy pojedynczym duplikacie), bulkCreateItems + updateItem dla zaznaczonych konfliktów przy imporcie zestawu. Brak dedykowanego API „list members” w MVP – ewentualnie select z list_members po list_id.
</interface_description>

5. Interface implementation:
<interface_implementation>
@code/src/components/list-details/ItemConflictDialog.tsx, @code/src/components/list-details/SetConflictResolutionDialog.tsx, @code/src/services/lists.service.ts, @code/src/services/items.service.ts, @code/src/hooks/useListDetails.ts. ShareModal – nowy komponent (np. src/components/list-details/ShareModal.tsx lub src/components/modals/ShareModal.tsx).
</interface_implementation>

6. Type Definitions:
<type_definitions>
@code/src/types/domain.types.ts (ListItem, UpdateListItemDTO, CreateListItemDTO, ShoppingList), @code/src/db/database.types.ts (list_members jeśli dostępne)
</type_definitions>

7. Tech Stack:
<tech_stack>
@.ai/tech-stack.md
</tech_stack>

8. Plan implementacji (istniejący):
<impl_plan>
@.ai/impl-plan-08-modals-share.md
</impl_plan>

9. Plan bazy danych:
<db_plan>
@.ai/db-plan.md
</db_plan>

Przed utworzeniem ostatecznego planu wdrożenia przeprowadź analizę i planowanie wewnątrz tagów <implementation_breakdown>. Wykonaj kroki 1–12 podziału implementacji.

Po analizie dostarcz plan wdrożenia w formacie Markdown (sekcje 1–11). Ostateczne wyniki w języku polskim, zapisane w pliku **.ai/modals-share-implementation-plan.md**. Nie uwzględniaj analizy w końcowym wyniku.
