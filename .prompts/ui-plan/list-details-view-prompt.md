Jako starszy programista frontendu Twoim zadaniem jest stworzenie szczegółowego planu wdrożenia nowego widoku w aplikacji internetowej. Plan ten powinien być kompleksowy i wystarczająco jasny dla innego programisty frontendowego, aby mógł poprawnie i wydajnie wdrożyć widok.

Najpierw przejrzyj następujące informacje:

1. Product Requirements Document (PRD):
<prd>
@.ai/prd.md
</prd>

2. Opis widoku:
<view_description>
### 2.3. Szczegóły Listy (Widok Zakupów)
*   **Ścieżka**: `/lists/:listId`
*   **Cel**: Zarządzanie produktami na konkretnej liście, realizacja zakupów.
*   **Kluczowe informacje**: Nazwa listy, produkty (do kupienia vs kupione), status sync.
*   **Kluczowe komponenty**:
    *   `ListItemRow`: Checkbox, nazwa, ilość, uchwyt sortowania (drag handle).
    *   `StickyInput`: Pole dodawania produktu.
    *   Sekcja "Kupione" (oddzielona wizualnie).
    *   Nagłówek z akcją "Udostępnij" i Menu (Archiwizuj, Zmień nazwę).
*   **UX/Bezpieczeństwo**:
    *   **Optimistic UI**: Natychmiastowe dodanie/odznaczenie elementu (zmiana opacity dla elementów niesynchronizowanych).
    *   **Swipe-to-delete**: Szybkie usuwanie gestem.
    *   **Long-press**: Edycja szczegółów (ilość, notatka).

### Obsługa Konfliktów i Duplikatów (Sekcja 3 z UI Plan)
#### 1. Przypadek: Dodanie duplikatu pojedynczego produktu
*   **Akcja**: Użytkownik w widoku listy wpisuje w `StickyInput` nazwę produktu, który już znajduje się na liście (np. "Mleko", które ma już ilość "1 szt.") i klika "Dodaj".
*   **Reakcja Systemu**: Aplikacja wykrywa duplikat nazwy.
*   **UI**: Wyświetla się `ConflictModal` zawierający pole edycji wypełnione **obecną wartością ilości** z listy (np. "1 szt.").
*   **Decyzja Użytkownika**:
    *   **Edycja i "OK"**: Użytkownik ręcznie modyfikuje tekst w polu (np. zmieniając "1 szt." na "2 szt." lub dopisując "+ 1 karton" -> "1 szt. + 1 karton") i zatwierdza. Wartość "ilość" na liście zostaje nadpisana wprowadzonym tekstem.
    *   **"Anuluj"**: Modal znika. Produkt na liście pozostaje bez zmian.

#### 2. Przypadek: Dodanie zestawu z konfliktami
*   **Kontekst**: Na aktywnej liście znajdują się już "Jajka" (ilość: "6 szt") oraz "Masło". Użytkownik dodaje zestaw "Śniadanie", w którym są "Jajka" (ilość: "10 szt"), "Chleb" i "Mleko".
*   **Akcja**: Użytkownik klika "Dodaj do listy" przy zestawie.
*   **Reakcja Systemu**: Algorytm wykrywa kolizję nazwy "Jajka".
*   **UI**: Pojawia się `ConflictResolutionModal` wyświetlający listę wszystkich konfliktowych pozycji.
    *   Przy każdym konflikcie (np. "Jajka") widoczny jest przełącznik/checkbox (domyślnie zaznaczony) decydujący o dodaniu ilości z zestawu.
    *   System pokazuje podgląd zmiany: "6 szt" + "10 szt" -> "6 szt+10 szt".
*   **Decyzja Użytkownika**:
    *   **"OK" (Zatwierdź)**:
        *   **Zaznaczone konflikty**: System aktualizuje ilość poprzez konkatenację tekstu (np. "6 szt+10 szt").
        *   **Odznaczone konflikty**: System ignoruje pozycję z zestawu (ilość na liście pozostaje bez zmian).
        *   **Brak konfliktu** (Chleb, Mleko): System dodaje je jako nowe pozycje.
    *   **"Anuluj"**: Cała operacja zostaje przerwana. Żaden produkt (nawet te bez konfliktu) nie zostaje dodany do listy.

### Kluczowe Komponenty (Sekcja 5 z UI Plan)
*   **Sticky Input Bar**: Komponent zawierający pole tekstowe i przycisk "Dodaj". Przyklejony do dołu ekranu. Walidacja, obsługa Enter, wizualny feedback.
*   **ListItemRow**: Pojedynczy wiersz. Checkbox, Nazwa, Ilość/Notatka, Drag Handle. Interakcje: Tap (checkbox), Long Press (edycja), Swipe Left (usuwanie).
*   **SyncStatusIndicator**: Ikona/kropka w nagłówku. Stany: Zsynchronizowano, Trwa synchronizacja/Offline, Błąd.
*   **ConflictModal**: Modal duplikatów (pojedynczy i zestaw).
*   **ShareModal**: Modal do wprowadzania e-maila do współdzielenia.
</view_description>

3. User Stories:
<user_stories>
* US-005 Współdzielenie listy
  * Opis: Jako użytkownik chcę zaprosić inną osobę do mojej listy, abyśmy mogli wspólnie robić zakupy.
* US-006 Archiwizacja listy
  * Opis: Jako użytkownik chcę zarchiwizować listę po zakończeniu zakupów, aby zachować porządek.
* US-007 Dodawanie produktu
  * Opis: Jako użytkownik chcę dodać produkt do listy, aby pamiętać o jego kupnie.
* US-008 Optimistic UI (Dodawanie offline)
  * Opis: Jako użytkownik chcę dodać produkt mimo braku internetu, aby nie czekać na odzyskanie zasięgu.
* US-009 Oznaczanie jako kupione
  * Opis: Jako użytkownik chcę oznaczyć produkt jako kupiony, aby wiedzieć, co zostało już włożone do koszyka.
* US-010 Obsługa duplikatów
  * Opis: Jako użytkownik chcę widzieć zduplikowane produkty jako jedną pozycję z informacją, aby uniknąć pomyłek.
* US-011 Sortowanie produktów
  * Opis: Jako użytkownik chcę zmienić kolejność produktów na liście, aby ułożyć je według alejki w sklepie.
* US-012 Tworzenie zestawu z listy
  * Opis: Jako użytkownik chcę zapisać obecną listę produktów jako zestaw, aby móc szybko dodać je w przyszłości.
* US-014 Dodawanie zestawu do listy
  * Opis: Jako użytkownik chcę dodać wszystkie produkty z zestawu do aktualnej listy jednym kliknięciem, aby zaoszczędzić czas.
* US-016 Synchronizacja zmian po odzyskaniu połączenia (Upload)
* US-017 Pobieranie zmian po odzyskaniu połączenia (Download)
* US-018 Synchronizacja w czasie rzeczywistym (Online)
</user_stories>

4. Interface description:
<interface_description>
export interface IListService {
  getListById(listId: UUID): Promise<ShoppingList>;
  updateList(listId: UUID, data: Partial<CreateListDTO>): Promise<ShoppingList>;
  shareListWithEmail(listId: UUID, email: string): Promise<void>;
  completeShoppingTrip(listId: UUID): Promise<void>;
}

export interface IListItemsService {
  getItemsByListId(listId: UUID): Promise<ListItem[]>;
  createItem(data: CreateListItemDTO): Promise<ListItem>;
  updateItem(data: UpdateListItemDTO): Promise<ListItem>;
  deleteItem(itemId: UUID): Promise<void>;
  reorderItems(items: { id: UUID; sort_order: number }[]): Promise<void>;
  bulkCreateItems(items: CreateListItemDTO[]): Promise<ListItem[]>;
}

export interface ISetsService {
  createSetFromList(listId: UUID, data: CreateSetDTO): Promise<ShoppingSet>;
}
</interface_description>

5. Interface implementation:
<interface_implementation>
@code/src/services/lists.service.ts
@code/src/services/items.service.ts
@code/src/services/sets.service.ts
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