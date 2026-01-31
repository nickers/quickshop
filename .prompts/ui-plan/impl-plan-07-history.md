Jako starszy programista frontendu Twoim zadaniem jest stworzenie szczegółowego planu wdrożenia nowego widoku w aplikacji internetowej. Plan ten powinien być kompleksowy i wystarczająco jasny dla innego programisty frontendowego, aby mógł poprawnie i wydajnie wdrożyć widok.

Najpierw przejrzyj następujące informacje:

1. Product Requirements Document (PRD):
<prd>
@.ai/prd.md
</prd>

2. Opis widoku:
<view_description>
**Historia Zakupów** (ui-plan.md §2.6). Ścieżka: /history. Cel: przegląd zakończonych zakupów. Kluczowe informacje: zarchiwizowane listy posortowane chronologicznie. Komponenty: lista typu Accordion (rozwiń → szczegóły listy), Bottom Navigation. Pusta historia: komunikat „Brak zakończonych zakupów”.
</view_description>

3. User Stories:
<user_stories>
* US-015 Przeglądanie historii: zakładka Historia; lista archiwalnych zakupów posortowana chronologicznie; możliwość podglądu szczegółów zakończonej listy (items_snapshot).
* US-006 Archiwizacja listy: lista znika z aktywnych i trafia do historii (completeShoppingTrip → RPC archive_list_items).
</user_stories>

4. Interface description:
<interface_description>
HistoryService: getHistory() → Promise<HistoryEntry[]>. Tabela shopping_history: user_id, list_name, items_snapshot (jsonb), completed_at. US-015. Brak mutacji – tylko odczyt.
</interface_description>

5. Interface implementation:
<interface_implementation>
@code/src/services/history.service.ts, @code/src/routes/history.tsx (obecny placeholder). Hook useHistory do utworzenia. Komponenty: lista accordion (np. rozwijane wiersze z list_name, completed_at, items_snapshot).
</interface_implementation>

6. Type Definitions:
<type_definitions>
@code/src/types/domain.types.ts (HistoryEntry), @code/src/db/database.types.ts (shopping_history Row)
</type_definitions>

7. Tech Stack:
<tech_stack>
@.ai/tech-stack.md
</tech_stack>

8. Plan implementacji (istniejący):
<impl_plan>
@.ai/impl-plan-07-history.md
</impl_plan>

9. Plan bazy danych:
<db_plan>
@.ai/db-plan.md
</db_plan>

Przed utworzeniem ostatecznego planu wdrożenia przeprowadź analizę i planowanie wewnątrz tagów <implementation_breakdown>. Wykonaj kroki 1–12 podziału implementacji.

Po analizie dostarcz plan wdrożenia w formacie Markdown (sekcje 1–11). Ostateczne wyniki w języku polskim, zapisane w pliku **.ai/history-view-implementation-plan.md**. Nie uwzględniaj analizy w końcowym wyniku.
