Przeanalizuje PRD, plan logiki biznesowej oraz plan UI pod kątem nieścisłości, które mogły się pojawić. Przedstaw 5 głównych punktów/niejasności zaczynając od tych mających największe prawdopodobieństow wprowadzenia błędów. Zrób to w formie listy numerowanej. Zapytaj użytkownika czy należy wprowadzić poprawki. Zaproponuj poprawki dla każdego punktu.

Dokumentu:

PRD:
<prd>
@.ai/prd.md
</prd>

Interfejsy:
<business_logic_plan>
@.ai/business-logic-plan.md
</api_plan>

<ui_plan>
@.ai/ui-plan.md
</ui_plan>


===

response:

Oto analiza dokumentacji pod kątem niespójności i potencjalnych błędów implementacyjnych.

  5 Głównych Nieścisłości i Zagrożeń

   1. Konflikt logiki "Sumowania" ilości (Matematyka vs Tekst)
       * Ryzyko (Wysokie): PRD wspomina o "sumowaniu" (sugeruje operację matematyczną), a Plan Logiki Biznesowej (API) zakładał updateListItem do
         scalania. Jednak najnowsze zmiany w UI Plan (User Journey) wymuszają konkatenację tekstową (np. "6 szt+10 szt") lub ręczną edycję tekstu.
         Jeśli backend lub logika klienta spróbuje parsować te wartości jako liczby, aplikacja będzie wyrzucać błędy lub działać nieprzewidywalnie.
       * Dokumenty: PRD (US-010), UI Plan (User Journey), API Plan.

   2. Niespójna definicja komponentu `ConflictModal` w UI Plan
       * Ryzyko (Średnie): Zaktualizowaliśmy sekcję User Journey w UI Plan o nowe wytyczne (edycja tekstu, checkboxy dla zestawów), ale sekcja 5.4.
         ConflictModal w tym samym pliku nadal opisuje starą wersję (opcje "Zsumuj", "Pomiń", "Dodaj jako nową"). Programista patrzący na spis
         komponentów zaimplementuje błędne rozwiązanie.
       * Dokumenty: UI Plan (sekcja 3 vs sekcja 5.4).

   3. Niejasny status listy po Archiwizacji (RPC vs Cykl Życia)
       * Ryzyko (Średnie): API Plan definiuje funkcję archive_list_items, która przenosi produkty do historii. PRD (US-006) mówi "Lista znika z
         widoku aktywnych". Nie jest określone, czy sama encja Listy (tabela lists) jest usuwana, czy oznaczana jako archived (soft delete), czy po
         prostu zostaje pusta i "wisi" w bazie. Jeśli zostanie usunięta, tracimy URL i powiązania użytkowników (share).
       * Dokumenty: PRD (US-006), API Plan (ListsService).

   4. Interakcja Sortowania (Drag&Drop) z sekcją "Kupione"
       * Ryzyko (Średnie): PRD wymaga sortowania oraz oddzielnej sekcji "Kupione". Nie ustalono, jak sort_order zachowuje się przy zmianie statusu.
           * Czy "Kupione" mają swoje osobne sortowanie?
           * Co się dzieje, gdy odznaczę produkt jako "niekupiony"? Czy wraca na swoje stare miejsce, czy na górę/dół listy? Brak tej decyzji
             spowoduje chaotyczne skakanie elementów po liście.
       * Dokumenty: PRD (US-011, US-009).

   5. Udostępnianie listy użytkownikom niezarejestrowanym
       * Ryzyko (Logiczne): API Plan zakłada shareListWithEmail, który wyszukuje user_id w tabeli profiles. Jeśli użytkownika nie ma w bazie,
         funkcja zawiedzie. PRD (US-005) mówi o zapraszaniu przez email, ale nie precyzuje, co się dzieje, gdy zapraszamy "nowego" użytkownika (czy
         system ma wysłać maila z zaproszeniem do rejestracji? czy stworzyć "pending invite"?). W obecnym planie API nie da się udostępnić listy
         komuś, kto jeszcze nie ma konta.
       * Dokumenty: PRD (US-005), API Plan.

  ---

  Czy mam wprowadzić poprawki?

  Jeśli tak, zaktualizuję pliki .ai/ui-plan.md (niespójność komponentu) oraz .ai/business-logic-plan.md (doprecyzowanie logiki łączenia tekstowego i
  archiwizacji).

  Proponowane rozwiązania:

   1. Dla pkt 1 (Ilość): Zaktualizować API Plan, aby jasno wskazywał, że pole quantity jest traktowane wyłącznie jako string, a operacja łączenia to
      concatenation, a nie addition.
   2. Dla pkt 2 (Modal): Nadpisać sekcję 5.4 w UI Plan opisem zgodnym z User Journey (edycja inputu dla singla, lista checkboxów dla zestawu).
   3. Dla pkt 3 (Archiwizacja): Ustalić, że archive_list_items czyści produkty, a sama lista zostaje usunięta (Soft Delete w lists lub fizyczne
      usunięcie, jeśli historia trzyma snapshot produktów niezależnie). Proponuję: Historia trzyma snapshot JSON, a Lista jest usuwana (Hard
      Delete), aby nie śmiecić w bazie pustymi listami.
   4. Dla pkt 4 (Sortowanie): Dodać adnotację w UI Plan/Logic Plan: "Odznaczenie produktu (powrót do aktywnych) przenosi go na górę listy (reset
      sort_order lub min(sort_order) - 1)". Sekcja "Kupione" jest sortowana chronologicznie (czas zakupu) lub alfabetycznie, ignorując manualny
      sort_order.
   5. Dla pkt 5 (Udostępnianie): W MVP ograniczyć się do komunikatu: "Użytkownik o tym emailu nie istnieje". (To najbezpieczniejsze dla zakresu
      MVP).


====
Wprowadz proponowane rozwiązania 1, 2 i 5. W pkt 3 pusta lista lista nie zostanie automatycznie usunięta (zostaje w bazie). W pkt 4. w obu sekcjach zachowajmy oryginalne wartosci sort_order akceptując, że sekwencja zaznacz->zmień kolejność->odznacz może zachować się nieprzewidywalnie, bo zmiana kolejności nie brała pod uwagę pozycji oznaczonej jako kupionej.