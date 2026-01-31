Jako starszy programista frontendu Twoim zadaniem jest stworzenie szczegółowego planu wdrożenia nowego widoku w aplikacji internetowej. Plan ten powinien być kompleksowy i wystarczająco jasny dla innego programisty frontendowego, aby mógł poprawnie i wydajnie wdrożyć widok.

Najpierw przejrzyj następujące informacje:

1. Product Requirements Document (PRD):
<prd>
@.ai/prd.md
</prd>

2. Opis widoku:
<view_description>
**Layout i nawigacja** (ui-plan.md §1, §4, §5.6). MainLayout: Header (kontekstowy), obszar treści w kontenerze max-w-md, Bottom Navigation Bar. Nawigacja główna: Listy (/lists), Zestawy (/sets), Historia (/history). Header wyświetla tytuł zależny od trasy (Listy / Zestawy / Historia); na trasach szczegółów (/lists/:id, /sets/:id) Header i Bottom Nav są ukryte – nagłówek to komponent widoku (np. ListDetailsHeader). Routing: / → redirect do /lists lub /auth; /auth; /lists, /lists/:id; /sets, /sets/:id; /history.
</view_description>

3. User Stories:
<user_stories>
Wymagania nawigacji i layoutu wspierają wszystkie widoki. US-004 (Tworzenie listy) wymaga widoku /lists z przyciskiem „Nowa lista”. US-013 (Zarządzanie zestawami) wymaga zakładki Zestawy. US-015 (Historia) wymaga zakładki Historia.
</user_stories>

4. Interface description:
<interface_description>
Layout i nawigacja nie wywołują bezpośrednio metod API z business-logic-plan. Supabase Auth (getSession) jest używany w __root/index do przekierowania niezalogowanych. Interfejsy list/sets/history są używane w poszczególnych widokach, nie w MainLayout.
</interface_description>

5. Interface implementation:
<interface_implementation>
@code/src/routes/__root.tsx, @code/src/routes/index.tsx, @code/src/components/layout/MainLayout.tsx, @code/src/components/layout/BottomNav.tsx, @code/src/components/Header.tsx, @code/src/db/supabase.client.ts
</interface_implementation>

6. Type Definitions:
<type_definitions>
@code/src/types/domain.types.ts, @code/src/db/database.types.ts – layout nie definiuje nowych DTO; wykorzystuje routing TanStack Router.
</type_definitions>

7. Tech Stack:
<tech_stack>
@.ai/tech-stack.md
</tech_stack>

8. Plan implementacji (istniejący):
<impl_plan>
@.ai/impl-plan-01-layout-navigation.md
</impl_plan>

9. Plan bazy danych:
<db_plan>
@.ai/db-plan.md
</db_plan>

Przed utworzeniem ostatecznego planu wdrożenia przeprowadź analizę i planowanie wewnątrz tagów <implementation_breakdown> w swoim bloku myślenia. Ta sekcja może być dość długa, ponieważ ważne jest, aby być dokładnym.

W swoim podziale implementacji wykonaj następujące kroki:
1. Dla każdej sekcji wejściowej (PRD, User Stories, Interface description, Interface implementation, Type Definitions, Tech Stack):
 - Podsumuj kluczowe punkty
 - Wymień wszelkie wymagania lub ograniczenia
 - Zwróć uwagę na wszelkie potencjalne wyzwania lub ważne kwestie
2. Wyodrębnienie i wypisanie kluczowych wymagań z PRD
3. Wypisanie wszystkich potrzebnych głównych komponentów, wraz z krótkim opisem ich opisu, potrzebnych typów, obsługiwanych zdarzeń i warunków walidacji
4. Stworzenie wysokopoziomowego diagramu drzewa komponentów
5. Zidentyfikuj wymagane DTO i niestandardowe typy ViewModel dla każdego komponentu widoku. Szczegółowo wyjaśnij te nowe typy, dzieląc ich pola i powiązane typy.
6. Zidentyfikuj potencjalne zmienne stanu i niestandardowe hooki, wyjaśniajając ich cel i sposób ich użycia
7. Wymień wymagane wywołania logiki biznesowej oraz backendu (supabase) i odpowiadające im akcje frontendowe
8. Zmapuj każdą historię użytkownika do konkretnych szczegółów implementacji, komponentów lub funkcji
9. Wymień interakcje użytkownika i ich oczekiwane wyniki
10. Wymień warunki wymagane przez metody i jak je weryfikować na poziomie komponentów
11. Zidentyfikuj potencjalne scenariusze błędów i zasugeruj, jak sobie z nimi poradzić
12. Wymień potencjalne wyzwania związane z wdrożeniem tego widoku i zasugeruj możliwe rozwiązania

Po przeprowadzeniu analizy dostarcz plan wdrożenia w formacie Markdown z następującymi sekcjami:

1. Przegląd: Krótkie podsumowanie widoku i jego celu.
2. Routing widoku: Określenie ścieżki, na której widok powinien być dostępny.
3. Struktura komponentów: Zarys głównych komponentów i ich hierarchii.
4. Szczegóły komponentu: Dla każdego komponentu należy opisać (opis, elementy, zdarzenia, walidacja, typy, propsy).
5. Typy: Szczegółowy opis typów wymaganych do implementacji widoku.
6. Zarządzanie stanem: Opis zarządzania stanem w widoku.
7. Integracja z interfejsami: Wyjaśnienie integracji z dostarczonymi interfejsami.
8. Interakcje użytkownika: Szczegółowy opis interakcji użytkownika i sposobu ich obsługi.
9. Warunki i walidacja: Opis warunków weryfikowanych przez interfejs.
10. Obsługa błędów: Opis obsługi potencjalnych błędów lub przypadków brzegowych.
11. Kroki implementacji: Przewodnik krok po kroku dotyczący implementacji widoku.

Upewnij się, że Twój plan jest zgodny z PRD, historyjkami użytkownika i uwzględnia dostarczony stack technologiczny.

Ostateczne wyniki powinny być w języku polskim i zapisane w pliku o nazwie **.ai/layout-navigation-view-implementation-plan.md**. Nie uwzględniaj żadnej analizy i planowania w końcowym wyniku.
