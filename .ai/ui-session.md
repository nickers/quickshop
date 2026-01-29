<conversation_summary>

<decisions>
1.  **Nawigacja**: Dolny pasek nawigacyjny (Bottom Navigation) dla głównych sekcji: Listy, Zestawy, Historia.
2.  **Status Synchronizacji**: Kropka lub pasek postępu w nagłówku, zmieniający kolor/animujący się dla stanów online/offline/sync.
3.  **Dodawanie Produktów**: Pole tekstowe przyklejone na stałe nad dolnym paskiem nawigacji (Sticky Input). Przycisk "Dodaj" nieaktywny, gdy pole puste; pulsowanie na czerwono przy próbie wysłania pustego.
4.  **Obsługa Duplikatów**: Modalne okno dialogowe. Lista duplikatów z przełącznikiem (Toggle): "Dodaj" (zsumowanie ilości, np. "2+1") lub "Pomiń". Domyślnie "Dodaj".
5.  **Edycja Produktu**: Długie przytrzymanie (Long Press) na nazwie produktu otwiera modal z edycją ilości i notatki.
6.  **Usuwanie Produktu**: Gest przesunięcia w lewo (Swipe to Delete) odsłaniający czerwone tło z ikoną kosza.
7.  **Sortowanie (Drag & Drop)**: Uchwyt (drag handle) przy każdym elemencie. Wizualizacja: cień, lekkie powiększenie/obrót (scale: 1.05), rozsuwanie się innych elementów.
8.  **Produkty Kupione**: Wydzielona sekcja na dole listy, domyślnie zwinięta? (nie doprecyzowano zwijania, ale ustalono oddzielną sekcję), elementy przekreślone i wyszarzone.
9.  **Udostępnianie**: Ikona "osoby+" w nagłówku widoku listy. Modal wyświetla: email, imię/awatar, ikonę kosza do usuwania dostępu.
10. **Zestawy (Szablony)**:
    *   Wyróżnienie: Inny kolor nagłówka (np. fioletowy) + etykieta "TRYB SZABLONU".
    *   Dodawanie do listy: Jeśli >1 aktywna lista -> Bottom Sheet z wyborem. Jeśli 1 -> dodaje automatycznie.
    *   Tworzenie zestawu z listy: SnackBar "[Nazwa] - zapisane" z przyciskiem "Zobacz".
11. **Archiwizacja**: Modal "Archiwizuj listę?" z opcjonalnym polem na liczbę produktów spoza listy.
12. **Historia**: Lista zwijana (Accordion) - nagłówek (Nazwa + Data), treść (tekstowa lista produktów).
13. **Profil**: Ikona (Awatar/Inicjały) w nagłówku -> Menu (Email + Wyloguj).
14. **Optimistic UI / Realtime**:
    *   Nowe (offline): Obniżona przezroczystość (0.6), pulsowanie.
    *   Aktualizacja (realtime): "Błyśnięcie" (flash) zmienionego elementu.
15. **Responsywność (Desktop/Tablet)**: Wyśrodkowany kontener o ograniczonej szerokości (brak układu wielokolumnowego).
</decisions>

<matched_recommendations>
1.  Zastosowanie Bottom Navigation dla kluczowych sekcji.
2.  Subtelny wskaźnik statusu synchronizacji w nagłówku.
3.  Sticky Input dla ergonomii Mobile First.
4.  Uchwyty (Drag handles) dla sortowania, aby nie kolidować z przewijaniem.
5.  Wizualne odróżnienie Zestawów (kolor nagłówka) od List.
6.  Przeniesienie "Kupionych" do osobnej sekcji na dole.
7.  Swipe to Delete jako szybka akcja usuwania.
8.  Ograniczenie szerokości kontenera na dużych ekranach (zachowanie Mobile First).
9.  Optimistic UI z przezroczystością dla niepotwierdzonych danych.
10. Proste menu profilu w nagłówku.
</matched_recommendations>

<ui_architecture_planning_summary>
### Główne wymagania UI
Aplikacja QuickShop będzie realizowana w podejściu **Mobile First** jako PWA. Interfejs ma być minimalistyczny, oparty na komponentach Material Design (lub zbliżonych) z wykorzystaniem Tailwind CSS. Priorytetem jest ergonomia obsługi jedną ręką (Sticky Input, Bottom Nav, Swipe gestures).

### Struktura Widoków i Nawigacja
1.  **Globalny Layout**:
    *   **Nagłówek (Header)**: Zawiera tytuł/logo, wskaźnik statusu sync, ikonę profilu (menu wylogowania). W widoku listy: przycisk udostępniania. W widoku zestawów: fioletowe tło + etykieta.
    *   **Treść (Content)**: Wyśrodkowany kontener (max-width) na tabletach/desktopach.
    *   **Dolna Nawigacja**: Linki do: Listy, Zestawy, Historia.
    *   **Sticky Input**: Nad dolną nawigacją, zawsze widoczne pole dodawania produktów.

2.  **Widok Listy (Główny)**:
    *   Lista elementów z Drag Handle (lewo/prawo) i Checkboxem.
    *   Interakcje: Swipe Left (usuń), Long Press (edycja - modal), Click (oznacz jako kupione).
    *   Sekcja "Kupione" na dole (przekreślone, opacity).
    *   Konflikty/Duplikaty: Modal przy dodawaniu (Merge/Skip).

3.  **Widok Zestawów**:
    *   Lista dostępnych szablonów.
    *   Akcja "Dodaj do listy": Logika wyboru listy docelowej (Bottom Sheet przy >1 liście).
    *   Tworzenie z listy: Akcja w menu listy, potwierdzenie SnackBarem.

4.  **Widok Historii**:
    *   Prosta lista akordeonowa (Accordion), readonly.

### Integracja z API i Zarządzanie Stanem
*   **Realtime**: Wykorzystanie subskrypcji Supabase do nasłuchiwania zmian (`UPDATE/INSERT/DELETE`). Zmiany przychodzące z zewnątrz są sygnalizowane wizualnie ("flash").
*   **Offline/Optimistic UI**: Lokalne zmiany są aplikowane natychmiastowo. Elementy oczekujące na sync mają `opacity: 0.6` i pulsują.
*   **Błędy**: Modale dla błędów krytycznych (np. błąd udostępniania), zachowanie wprowadzonych danych w formularzach.

### Wyłączenia z MVP (Scope Cut)
*   Empty States (dedykowane grafiki).
*   Sugestie ilości/jednostek (chipsy).
*   Zaawansowane animacje przejść między widokami.
*   Powiadomienia o nowych listach (badge).
*   Wyszukiwanie na liście.
*   Tryb wysokiego kontrastu (dedykowany).
</ui_architecture_planning_summary>

<unresolved_issues>
1.  Szczegóły implementacji "zwijania" sekcji "Kupione" (czy domyślnie zwinięta, czy zawsze otwarta, czy zapamiętuje stan).
2.  Dokładny wygląd modalu konfliktu (mockup by się przydał w fazie designu).
3.  Obsługa błędów sieciowych innych niż brak internetu (np. timeout, server error 500) - czy używamy tego samego mechanizmu co przy offline?
</unresolved_issues>

</conversation_summary>
