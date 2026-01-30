Jako starszy programista frontendu Twoim zadaniem jest stworzenie szczegółowego planu wdrożenia nowego widoku w aplikacji internetowej. Plan ten powinien być kompleksowy i wystarczająco jasny dla innego programisty frontendowego, aby mógł poprawnie i wydajnie wdrożyć widok.

Najpierw przejrzyj następujące informacje:

1. Product Requirements Document (PRD):
<prd>
@.ai/prd.md
</prd>

2. Opis widoku:
<view_description>
### 2.2. Pulpit List (Widok Główny)
*   **Ścieżka**: `/lists` (lub `/`)
*   **Cel**: Przegląd aktywnych list zakupowych i szybkie przejście do konkretnej listy.
*   **Kluczowe informacje**: Nazwy list, właściciel (jeśli współdzielona), liczba produktów (kupione/wszystkie).
*   **Kluczowe komponenty**:
    *   Karty list (List Card).
    *   Przycisk "Nowa lista" (FAB lub w nagłówku).
    *   Bottom Navigation.

## 2. Lista widoków (kontekst)
*   **Nawigacja Główna (Globalna)**:
    *   Realizowana przez **Bottom Navigation Bar**.
    *   Dostępna w widokach głównych (`/lists`, `/sets`, `/history`).
</view_description>

3. User Stories:
<user_stories>
* US-004 Tworzenie nowej listy
  * Opis: Jako użytkownik chcę utworzyć nową listę zakupów, aby zacząć planować zakupy.
  * Kryteria akceptacji:
    1. Przycisk Nowa lista jest dostępny w widoku list.
    2. Użytkownik musi podać nazwę listy.
    3. Nowa lista pojawia się na liście dostępnych list.

* US-015 Przeglądanie historii (Kontekst nawigacji)
  * Opis: Jako użytkownik chcę zobaczyć moje zakończone zakupy.
  * (Ten widok zawiera nawigację do Historii)

* US-013 Zarządzanie zestawami (Kontekst nawigacji)
  * (Ten widok zawiera nawigację do Zestawów)
</user_stories>

4. Interface description:
<interface_description>
export interface IListService {
	/**
	 * Fetches all lists the current user has access to (own + shared).
	 */
	getAllLists(): Promise<ShoppingList[]>;

	/**
	 * Creates a new shopping list.
	 */
	createList(data: CreateListDTO): Promise<ShoppingList>;

	/**
	 * Deletes a list permanently.
	 */
	deleteList(listId: UUID): Promise<void>;
}
</interface_description>

5. Interface implementation:
<interface_implementation>
@code/src/services/lists.service.ts
</interface_implementation>

6. Type Definitions:
<type_definitions>
@code/src/types/domain.types.ts
</type_definitions>

7. Tech Stack:
<tech_stack>
@.ai/tech-stack.md
</tech_stack>

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
6. Zidentyfikuj potencjalne zmienne stanu i niestandardowe hooki, wyjaśniając ich cel i sposób ich użycia
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
4. Szczegóły komponentu: Dla każdego komponentu należy opisać:
 - Opis komponentu, jego przeznaczenie i z czego się składa
 - Główne elementy HTML i komponenty dzieci, które budują komponent
 - Obsługiwane zdarzenia
 - Warunki walidacji (szczegółowe warunki, zgodnie z API)
 - Typy (DTO i ViewModel) wymagane przez komponent
 - Propsy, które komponent przyjmuje od rodzica (interfejs komponentu)
5. Typy: Szczegółowy opis typów wymaganych do implementacji widoku, w tym dokładny podział wszelkich nowych typów lub modeli widoku według pól i typów.
6. Zarządzanie stanem: Szczegółowy opis sposobu zarządzania stanem w widoku, określenie, czy wymagany jest customowy hook.
7. Integracja z interfejsami: Wyjaśnienie sposobu integracji z dostarczonymi interfejsami. Precyzyjnie wskazuje typy żądania i odpowiedzi.
8. Interakcje użytkownika: Szczegółowy opis interakcji użytkownika i sposobu ich obsługi.
9. Warunki i walidacja: Opisz jakie warunki są weryfikowane przez interfejs, których komponentów dotyczą i jak wpływają one na stan interfejsu
10. Obsługa błędów: Opis sposobu obsługi potencjalnych błędów lub przypadków brzegowych.
11. Kroki implementacji: Przewodnik krok po kroku dotyczący implementacji widoku.

Upewnij się, że Twój plan jest zgodny z PRD, historyjkami użytkownika i uwzględnia dostarczony stack technologiczny.

Ostateczne wyniki powinny być w języku polskim i zapisane w pliku o nazwie .ai/{view-name}-view-implementation-plan.md. Nie uwzględniaj żadnej analizy i planowania w końcowym wyniku.

Oto przykład tego, jak powinien wyglądać plik wyjściowy (treść jest do zastąpienia):

```markdown
# Plan implementacji widoku [Nazwa widoku]

## 1. Przegląd
[Krótki opis widoku i jego celu]

## 2. Routing widoku
[Ścieżka, na której widok powinien być dostępny]

## 3. Struktura komponentów
[Zarys głównych komponentów i ich hierarchii]

## 4. Szczegóły komponentów
### [Nazwa komponentu 1]
- Opis komponentu [opis]
- Główne elementy: [opis]
- Obsługiwane interakcje: [lista]
- Obsługiwana walidacja: [lista, szczegółowa]
- Typy: [lista]
- Propsy: [lista]

### [Nazwa komponentu 2]
[...]

## 5. Typy
[Szczegółowy opis wymaganych typów]

## 6. Zarządzanie stanem
[Opis zarządzania stanem w widoku]

## 7. Integracja z interfejsami
[Wyjaśnienie integracji z dostarczonymi interfejsami, wskazanie typów parametrów, wyników i zdarzeń]

## 8. Interakcje użytkownika
[Szczegółowy opis interakcji użytkownika]

## 9. Warunki i walidacja
[Szczegółowy opis warunków i ich walidacji]

## 10. Obsługa błędów
[Opis obsługi potencjalnych błędów]

## 11. Kroki implementacji
1. [Krok 1]
2. [Krok 2]
3. [...]
```

Rozpocznij analizę i planowanie już teraz. Twój ostateczny wynik powinien składać się wyłącznie z planu wdrożenia w języku polskim w formacie markdown, który zapiszesz w pliku .ai/{view-name}-view-implementation-plan.md i nie powinien powielać ani powtarzać żadnej pracy wykonanej w podziale implementacji.