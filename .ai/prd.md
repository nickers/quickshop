# Dokument wymagań produktu (PRD) - QuickShop

## 1. Przegląd produktu

### 1.1 Opis ogólny
QuickShop to aplikacja typu Progressive Web App (PWA) stworzona w podejściu Mobile First, której głównym celem jest usprawnienie procesu planowania i realizacji zakupów spożywczych. Aplikacja rozwiązuje problem zapominania o regularnie kupowanych produktach (np. artykułach śniadaniowych) poprzez zastosowanie mechanizmu szablonów (zestawów) oraz synchronizacji list w czasie rzeczywistym.

### 1.2 Cele biznesowe i wizja
Celem produktu jest dostarczenie prostego, intuicyjnego narzędzia, które zminimalizuje czas poświęcany na tworzenie list zakupowych i zwiększy kompletność realizowanych zakupów. Wizualnie aplikacja opiera się na minimalistycznym designie z logotypem bazującym na ikonie koszyka.

### 1.3 Architektura i technologia
* Frontend: React + Vite, Tailwind CSS + Material Design components.
* Backend (BaaS): Supabase (PostgreSQL).
* Komunikacja: Realtime via WebSockets (PostgreSQL CDC) dla synchronizacji list.
* Uwierzytelnianie: Supabase Auth (Email/Hasło + Google OAuth).
* Hosting: Vercel.
* Model danych: Optimistic UI (zakładamy sukces operacji) + Persist Cache (np. TanStack Query zapisujący stan w localStorage).
* Strategia rozwiązywania konfliktów: Last Write Wins.

## 2. Problem użytkownika

### 2.1 Zidentyfikowane problemy
* Czasochłonność planowania: Przygotowanie listy zakupów na cały tydzień wymaga znacznego nakładu czasu.
* Zapominanie o produktach stałych: Użytkownicy często zapominają dodać do listy produkty kupowane regularnie (np. mleko, owoce, musli), co wymusza dodatkowe wizyty w sklepie.
* Brak synchronizacji: Tradycyjne listy papierowe lub proste notatki nie pozwalają na współdzielenie i aktualizację w czasie rzeczywistym między domownikami.
* Problemy z zasięgiem: Brak możliwości edycji listy w sklepach z słabym zasięgiem internetu.

## 3. Wymagania funkcjonalne

### 3.1 Uwierzytelnianie i zarządzanie kontem
* Rejestracja i logowanie za pomocą adresu e-mail oraz hasła.
* Logowanie za pomocą Google OAuth.
* Automatyczne tworzenie Pierwszej listy z przykładową pozycją po założeniu konta.
* Utrzymanie sesji użytkownika.

### 3.2 Zarządzanie listami zakupów
* Tworzenie, edycja nazw i archiwizowanie list zakupów.
* Współdzielenie list z innymi użytkownikami poprzez adres e-mail lub system zaproszeń.
* Synchronizacja zmian w czasie rzeczywistym (dodanie produktu przez jedną osobę jest natychmiast widoczne u innej).
* Działanie w trybie offline (Optimistic UI) z synchronizacją po odzyskaniu połączenia.

### 3.3 Zarządzanie produktami na liście
* Dodawanie produktów (nazwa wymagana, ilość/notatka opcjonalna).
* Wykrywanie duplikatów: produkty o tej samej nazwie na jednej liście są wyświetlane jako jedna pozycja z wyróżnieniem (decyzja o sumowaniu należy do użytkownika).
* Oznaczanie produktów jako kupione (checkbox/swipe), co przenosi je do sekcji Kupione lub wyszarza.
* Sortowanie produktów metodą przeciągnij i upuść (drag-and-drop).
* Wyszukiwanie produktów na liście.
* Czyszczenie listy z zakupionych produktów.

### 3.4 Zestawy (Szablony)
* Tworzenie zestawów produktów (szablonów), np. Śniadania, Na rosół.
* Zestawy są niezależne od list (edycja zestawu nie zmienia aktywnej listy).
* Możliwość dodania całego zestawu do listy jednym kliknięciem.
* Opcja zapisu istniejącej listy zakupów jako nowy zestaw.
* W przypadku ponownego dodania tego samego zestawu, aplikacja pyta użytkownika o zwiększenie ilości produktów.

### 3.5 Historia zakupów
* Archiwizacja zakończonych list zakupów.
* Przechowywanie historii przez 365 dni.
* Opcjonalne wprowadzanie liczby produktów kupionych spoza listy przy zamykaniu zakupów (do celów statystycznych).

## 4. Granice produktu

### 4.1 Wyłączenia z zakresu MVP
W wersji MVP (Minimum Viable Product) aplikacja NIE będzie zawierać:
* Skanowania kodów kreskowych produktów.
* Integracji z zewnętrznymi bazami przepisów kulinarnych.
* Systemu analizy i porównywania cen w sklepach.
* Wielopoziomowego systemu uprawnień (wszyscy użytkownicy współdzielący listę mają prawa edycji).
* Trybu ciemnego (Dark Mode).
* Kategoryzowania produktów wewnątrz zestawów.
* Wirtualizacji list (zakładamy rozsądną liczbę elementów).
* Powiadomień Push (zamiast tego subtelne sygnały wizualne w aplikacji).
* Pełnej bazy danych offline (zamiast tego cache w LocalStorage).

## 5. Historyjki użytkowników

### Uwierzytelnianie
* US-001 Logowanie przez e-mail
  * Opis: Jako użytkownik chcę móc zalogować się za pomocą adresu e-mail i hasła, aby uzyskać dostęp do moich list.
  * Kryteria akceptacji:
    1. Formularz logowania przyjmuje e-mail i hasło.
    2. Poprawne dane przekierowują do widoku głównego.
    3. Błędne dane wyświetlają komunikat o błędzie.

* US-002 Logowanie przez Google
  * Opis: Jako użytkownik chcę logować się kontem Google, aby przyspieszyć proces uwierzytelniania.
  * Kryteria akceptacji:
    1. Przycisk Zaloguj z Google jest widoczny na ekranie logowania.
    2. Kliknięcie inicjuje proces OAuth.
    3. Po sukcesie użytkownik jest zalogowany w aplikacji.

* US-003 Rejestracja konta
  * Opis: Jako nowy użytkownik chcę założyć konto, aby móc zapisywać swoje listy.
  * Kryteria akceptacji:
    1. Formularz rejestracji przyjmuje e-mail i hasło.
    2. Po rejestracji tworzona jest automatycznie domyślna lista startowa.
    3. Użytkownik jest automatycznie logowany.

### Zarządzanie Listami
* US-004 Tworzenie nowej listy
  * Opis: Jako użytkownik chcę utworzyć nową listę zakupów, aby zacząć planować zakupy.
  * Kryteria akceptacji:
    1. Przycisk Nowa lista jest dostępny w widoku list.
    2. Użytkownik musi podać nazwę listy.
    3. Nowa lista pojawia się na liście dostępnych list.

* US-005 Współdzielenie listy
  * Opis: Jako użytkownik chcę zaprosić inną osobę do mojej listy, abyśmy mogli wspólnie robić zakupy.
  * Kryteria akceptacji:
    1. Opcja Udostępnij dostępna w ustawieniach listy.
    2. Możliwość wpisania adresu e-mail osoby zapraszanej.
    3. Zaproszona osoba widzi listę w swojej aplikacji.
    4. Obie osoby mogą edytować zawartość listy.

* US-006 Archiwizacja listy
  * Opis: Jako użytkownik chcę zarchiwizować listę po zakończeniu zakupów, aby zachować porządek.
  * Kryteria akceptacji:
    1. Przycisk Zakończ zakupy/Archiwizuj dostępny w widoku listy.
    2. Lista znika z widoku aktywnych i trafia do historii.
    3. Użytkownik może opcjonalnie podać liczbę produktów kupionych spoza listy.

### Zarządzanie Produktami
* US-007 Dodawanie produktu
  * Opis: Jako użytkownik chcę dodać produkt do listy, aby pamiętać o jego kupnie.
  * Kryteria akceptacji:
    1. Pole tekstowe umożliwia wpisanie nazwy produktu.
    2. Możliwość dodania ilości lub notatki (opcjonalnie).
    3. Produkt pojawia się na liście po zatwierdzeniu.

* US-008 Optimistic UI (Dodawanie offline)
  * Opis: Jako użytkownik chcę dodać produkt mimo braku internetu, aby nie czekać na odzyskanie zasięgu.
  * Kryteria akceptacji:
    1. Produkt pojawia się na liście natychmiast po kliknięciu Dodaj, nawet bez sieci.
    2. Aplikacja synchronizuje dane z serwerem po odzyskaniu połączenia.

* US-009 Oznaczanie jako kupione
  * Opis: Jako użytkownik chcę oznaczyć produkt jako kupiony, aby wiedzieć, co zostało już włożone do koszyka.
  * Kryteria akceptacji:
    1. Kliknięcie checkboxa lub wykonanie gestu swipe zmienia status produktu.
    2. Produkt wizualnie zmienia styl (np. przekreślenie, wyszarzenie).
    3. Produkt przesuwa się na dół listy (do sekcji Kupione).

* US-010 Obsługa duplikatów
  * Opis: Jako użytkownik chcę widzieć zduplikowane produkty jako jedną pozycję z informacją, aby uniknąć pomyłek.
  * Kryteria akceptacji:
    1. Jeśli dodam Mleko, a na liście już jest mleko, aplikacja nie tworzy drugiego wiersza.
    2. Istniejąca pozycja zostaje wyróżniona.
    3. Użytkownik może zdecydować o zsumowaniu ilości w istniejącej pozycji.

* US-011 Sortowanie produktów
  * Opis: Jako użytkownik chcę zmienić kolejność produktów na liście, aby ułożyć je według alejki w sklepie.
  * Kryteria akceptacji:
    1. Interfejs umożliwia przeciąganie (drag & drop) elementów listy.
    2. Nowa kolejność jest zapisywana i widoczna dla innych użytkowników.

### Zestawy (Szablony)
* US-012 Tworzenie zestawu z listy
  * Opis: Jako użytkownik chcę zapisać obecną listę produktów jako zestaw, aby móc szybko dodać je w przyszłości.
  * Kryteria akceptacji:
    1. Opcja Zapisz jako zestaw dostępna z poziomu aktywnej listy.
    2. Użytkownik nadaje nazwę zestawowi (np. Śniadanie).
    3. Zestaw zapisuje listę produktów i ich ilości.

* US-013 Zarządzanie zestawami
  * Opis: Jako użytkownik chcę tworzyć i edytować zestawy niezależnie od list, aby przygotować szablony na różne okazje.
  * Kryteria akceptacji:
    1. Dostępna zakładka Zestawy.
    2. Możliwość utworzenia nowego, pustego zestawu.
    3. Możliwość edycji produktów wewnątrz zestawu.

* US-014 Dodawanie zestawu do listy
  * Opis: Jako użytkownik chcę dodać wszystkie produkty z zestawu do aktualnej listy jednym kliknięciem, aby zaoszczędzić czas.
  * Kryteria akceptacji:
    1. Przycisk Dodaj do listy przy wybranym zestawie.
    2. Wszystkie produkty z zestawu trafiają na aktywną listę.
    3. Jeśli zestaw był już dodany, pojawia się pytanie o ponowne dodanie (zwiększenie ilości).

### Historia
* US-015 Przeglądanie historii
  * Opis: Jako użytkownik chcę zobaczyć moje zakończone zakupy, aby sprawdzić, co kupowałem w przeszłości.
  * Kryteria akceptacji:
    1. Dostępna zakładka Historia.
    2. Lista archiwalnych zakupów posortowana chronologicznie.
    3. Możliwość podglądu szczegółów zakończonej listy.

### Synchronizacja i Offline
* US-016 Synchronizacja zmian po odzyskaniu połączenia (Upload)
  * Opis: Jako użytkownik, który dodał pozycję będąc offline, chcę, aby po odzyskaniu połączenia lista została zaktualizowana w bazie danych.
  * Kryteria akceptacji:
    1. Aplikacja wykrywa powrót połączenia internetowego.
    2. Pozycje dodane lokalnie (w trybie offline) są automatycznie wysyłane do bazy danych (Supabase).
    3. Stan synchronizacji jest odzwierciedlony w UI (np. zniknięcie ikony "oczekuje na synchronizację").

* US-017 Pobieranie zmian po odzyskaniu połączenia (Download)
  * Opis: Jako użytkownik, który był offline, chcę po odzyskaniu połączenia zobaczyć zmiany wprowadzone przez innych użytkowników.
  * Kryteria akceptacji:
    1. Po przywróceniu łączności aplikacja automatycznie pobiera najnowszą wersję listy.
    2. Pozycje dodane przez innych użytkowników w czasie mojej nieobecności pojawiają się na liście.
    3. Konflikty są rozwiązywane automatycznie (strategia Last Write Wins).

* US-018 Synchronizacja w czasie rzeczywistym (Online)
  * Opis: Jako użytkownik będący online, chcę natychmiast widzieć zmiany wprowadzane przez innych użytkowników na tej samej liście.
  * Kryteria akceptacji:
    1. Gdy inny użytkownik doda, usunie lub zmodyfikuje pozycję, zmiana pojawia się na moim ekranie automatycznie.
    2. Nie jest wymagane ręczne odświeżanie strony ani interakcja użytkownika.

## 6. Metryki sukcesu

### 6.1 Główne wskaźniki (KPI)
* Wskaźnik użycia listy: 90% towarów zakupionych podczas dużych, weekendowych zakupów pochodzi z przygotowanej wcześniej listy w aplikacji.
* Efektywność zestawów: 50% produktów powtarzalnych (kupowanych cyklicznie tydzień do tygodnia) jest dodawanych do listy za pomocą funkcji Zestawów.

### 6.2 Dodatkowe wskaźniki
* Liczba aktywnych użytkowników (MAU) korzystających z funkcji współdzielenia list.
* Czas spędzony w aplikacji w trybie offline (weryfikacja działania Optimistic UI).
* Średni czas tworzenia listy (oczekiwany spadek dzięki zestawom).