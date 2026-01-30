# Architektura UI dla QuickShop

## 1. Przegląd struktury UI

Interfejs QuickShop został zaprojektowany zgodnie z zasadą **Mobile First**, kładąc nacisk na ergonomię obsługi jedną ręką (dolny pasek nawigacji, elementy interaktywne w zasięgu kciuka). Aplikacja działa jako PWA (Progressive Web App).

Główny układ (Layout) składa się z:
1.  **Nagłówka (Header)**: Zawiera kontekstowe akcje (udostępnianie, menu), tytuł widoku, wskaźnik statusu synchronizacji oraz awatar użytkownika.
2.  **Obszaru treści (Main Content)**: Dynamiczna zawartość widoku. Na desktopach treść jest wycentrowana w kontenerze o szerokości zbliżonej do tabletu/mobile, aby zachować spójność doświadczenia.
3.  **Dolnego paska nawigacyjnego (Bottom Navigation)**: Zapewnia szybki dostęp do głównych sekcji: Listy, Zestawy, Historia.
4.  **Sticky Input (Warunkowo)**: W widokach edycji (Lista, Zestaw) pole dodawania produktu jest "przyklejone" nad dolną nawigacją (lub na dole ekranu).

## 2. Lista widoków

### 2.1. Ekran Logowania / Rejestracji
*   **Ścieżka**: `/auth`
*   **Cel**: Uwierzytelnienie użytkownika (dostęp do danych prywatnych).
*   **Kluczowe informacje**: Formularz logowania/rejestracji.
*   **Kluczowe komponenty**:
    *   Przełącznik "Logowanie / Rejestracja".
    *   Formularz (Email, Hasło).
    *   Przycisk "Zaloguj z Google".
*   **UX/Bezpieczeństwo**: Jasne komunikaty błędów walidacji. Feedback wizualny podczas ładowania.

### 2.2. Pulpit List (Widok Główny)
*   **Ścieżka**: `/lists` (lub `/`)
*   **Cel**: Przegląd aktywnych list zakupowych i szybkie przejście do konkretnej listy.
*   **Kluczowe informacje**: Nazwy list, właściciel (jeśli współdzielona), liczba produktów (kupione/wszystkie).
*   **Kluczowe komponenty**:
    *   Karty list (List Card).
    *   Przycisk "Nowa lista" (FAB lub w nagłówku).
    *   Bottom Navigation.

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

### 2.4. Pulpit Zestawów (Szablony)
*   **Ścieżka**: `/sets`
*   **Cel**: Zarządzanie szablonami zakupowymi (np. "Śniadanie", "Impreza").
*   **Kluczowe informacje**: Lista dostępnych zestawów.
*   **Kluczowe komponenty**:
    *   Karty zestawów z przyciskiem "Dodaj do listy".
    *   Bottom Navigation.
*   **UX**: Wyróżnienie wizualne (np. inny kolor nagłówka), aby odróżnić od zwykłych list.

### 2.5. Szczegóły Zestawu
*   **Ścieżka**: `/sets/:setId`
*   **Cel**: Edycja zawartości szablonu.
*   **Kluczowe informacje**: Produkty w zestawie.
*   **Kluczowe komponenty**:
    *   Nagłówek z etykietą "TRYB SZABLONU".
    *   Lista produktów (bez checkboxów "kupione", tylko lista).
    *   Sticky Input.

### 2.6. Historia Zakupów
*   **Ścieżka**: `/history`
*   **Cel**: Przegląd zakończonych zakupów.
*   **Kluczowe informacje**: Zarchiwizowane listy posortowane chronologicznie.
*   **Kluczowe komponenty**:
    *   Lista typu Accordion (rozwiń szczegóły listy).
    *   Bottom Navigation.

## 3. Mapa podróży użytkownika (User Journey)

### Główny Przypadek Użycia: "Tygodniowe Zakupy"

1.  **Start**: Użytkownik otwiera aplikację.
    *   *Jeśli niezalogowany*: Widzi `/auth`. Loguje się.
    *   *Jeśli zalogowany*: Trafia na `/lists`.
2.  **Tworzenie**: Użytkownik klika "Nowa lista", wpisuje nazwę "Dom" -> Przekierowanie do `/lists/:id`.
3.  **Planowanie**:
    *   Użytkownik wpisuje "Mleko" w `StickyInput`, klika "Dodaj" (Enter).
    *   Użytkownik wpisuje "Chleb", klika "Dodaj".
    *   **Alternatywna ścieżka**: Użytkownik przechodzi do zakładki `/sets`, wybiera zestaw "Śniadanie", klika "Dodaj do listy", wybiera "Dom". Wraca do `/lists/:id`.
4.  **Zakupy (W sklepie)**:
    *   Użytkownik klika checkbox przy "Mleko". Produkt spada do sekcji "Kupione", staje się wyszarzony.
    *   *Utrata zasięgu*: Użytkownik dodaje "Baterie". Element pojawia się (lekko przezroczysty).
    *   *Powrót zasięgu*: Element "Baterie" staje się w pełni widoczny (sync success).
5.  **Finalizacja**:
    *   Wszystkie produkty kupione.
    *   Użytkownik klika Menu -> "Zakończ zakupy / Archiwizuj".
    *   Potwierdza w modalu (opcjonalnie wpisuje liczbę dodatkowych produktów).
    *   Lista znika z aktywnych, użytkownik wraca na `/lists`.

## 4. Układ i struktura nawigacji

System nawigacji opiera się na dwóch poziomach:

1.  **Nawigacja Główna (Globalna)**:
    *   Realizowana przez **Bottom Navigation Bar**.
    *   Dostępna w widokach głównych (`/lists`, `/sets`, `/history`).
    *   Umożliwia szybkie przełączanie kontekstu bez utraty stanu (w miarę możliwości).

2.  **Nawigacja Wewnątrz Widoku (Szczegółowa)**:
    *   Wejście w szczegóły (np. kliknięcie w kartę Listy) przenosi do widoku dedykowanego (`/lists/123`).
    *   Powrót realizowany przez przycisk "Wstecz" (Back Arrow) w nagłówku lub systemowy przycisk wstecz.

**Routing**:
*   `/` -> Redirect do `/lists`
*   `/auth` (Publiczny)
*   `/lists` (Chroniony)
    *   `/lists/:id` (Chroniony)
*   `/sets` (Chroniony)
    *   `/sets/:id` (Chroniony)
*   `/history` (Chroniony)

## 5. Kluczowe komponenty

### 5.1. Sticky Input Bar
*   **Opis**: Komponent zawierający pole tekstowe i przycisk "Dodaj". Przyklejony do dołu ekranu (nad paskiem nawigacji).
*   **Funkcje**: Walidacja (niepusty tekst), obsługa klawisza Enter, wizualny feedback (pulsowanie przy błędzie).

### 5.2. ListItemRow (Wiersz Produktu)
*   **Opis**: Pojedynczy wiersz na liście zakupów.
*   **Elementy**:
    *   *Lewa strona*: Checkbox (lub pusty placeholder w trybie szablonu).
    *   *Środek*: Nazwa produktu, Ilość/Notatka (mniejszym drukiem).
    *   *Prawa strona*: Drag Handle (ikona chwytania).
*   **Interakcje**:
    *   **Tap**: Zmiana stanu checkboxa.
    *   **Long Press**: Otwarcie modalu edycji (ilość, notatka).
    *   **Swipe Left**: Odsłonięcie czerwonego tła z ikoną kosza (usuwanie).

### 5.3. SyncStatusIndicator
*   **Opis**: Mała ikona lub kropka w nagłówku.
*   **Stany**:
    *   *Zielony/Ukryty*: Zsynchronizowano.
    *   *Pomarańczowy/Pulsujący*: Trwa synchronizacja / Oczekiwanie (Offline).
    *   *Czerwony*: Błąd synchronizacji (kliknięcie otwiera szczegóły/ponów).

### 5.4. ConflictModal (Modal Duplikatów)
*   **Opis**: Pojawia się, gdy dodawany produkt już istnieje na liście.
*   **Opcje**:
    *   "Zsumuj ilości" (np. masz 1, dodajesz 2 -> wynik 3).
    *   "Pomiń" (anuluj dodawanie).
    *   "Dodaj jako nową pozycję" (rzadziej, ale możliwe).

### 5.5. ShareModal
*   **Opis**: Modal do wprowadzania adresu e-mail osoby, z którą chcemy współdzielić listę.
*   **Elementy**: Pole input (email), lista osób już mających dostęp (z opcją usunięcia).

### 5.6. MainLayout
*   **Opis**: Wrapper dla wszystkich widoków po zalogowaniu.
*   **Struktura**:
    *   `<Header />` (zmienna zawartość w zależności od Route).
    *   `<main className="container mx-auto max-w-md ..."> {children} </main>`
    *   `<BottomNav />`
