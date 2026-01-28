<pytania>
   1. W jaki sposób system powinien rozstrzygać konflikty synchronizacji w modelu local-first, gdy dwóch użytkowników edytuje tę samą współdzieloną
      listę w trybie offline?

  Rekomendacja: Dla MVP najbezpieczniejszym i najprostszym rozwiązaniem będzie strategia "Last Write Wins" (ostatnia zmiana wygrywa) na poziomie
  pojedynczego produktu, a nie całej listy, co zminimalizuje ryzyko utraty danych przy jednoczesnym zachowaniu prostoty implementacji.

   2. Czy użytkownik powinien mieć możliwość kategoryzowania produktów w Zestawach (np. "Warzywa", "Nabiał"), aby ułatwić poruszanie się po sklepie?

  Rekomendacja: Choć atrybuty ograniczamy do minimum, automatyczne sortowanie według prostych kategorii (lub kolejności dodawania) znacząco poprawia
  UX. W MVP sugeruję jednak pozostanie przy kolejności dodawania, a kategoryzację wprowadzić jako funkcję "smart" w wersji 2.0.

   3. Jak ma wyglądać proces dodawania innych użytkowników do listy (współdzielenie)? Czy wystarczy podanie adresu email?

  Rekomendacja: Tak, wyszukiwanie po adresie email jest najbardziej intuicyjne. Zalecam jednak, aby system wysyłał zaproszenie (powiadomienie
  wewnątrz aplikacji), które użytkownik musi zaakceptować, zanim lista pojawi się na jego koncie, co zapobiegnie spamowaniu listami.

   4. Czy "zakończenie zakupów" (moment wpisywania statystyk) powinno skutkować archiwizacją listy, czy jej wyczyszczeniem?

  Rekomendacja: Sugeruję mechanizm "Archiwizuj i wyczyść". Zakupione produkty znikają z widoku głównego, ale zostają zachowane w historii (dostępnej
  np. przez 30 dni), co pozwoli na późniejszą analizę lub odtworzenie listy, jeśli użytkownik zapomni czegoś kupić.

   5. Czy system powinien wysyłać powiadomienia push (PWA), gdy inny użytkownik doda produkt do wspólnej listy lub go odhaczy?

  Rekomendacja: W MVP powiadomienia push mogą być trudne w stabilnej implementacji na wszystkich platformach (szczególnie iOS). Rekomenduję wizualny
  wskaźnik "aktywności" (np. kropka przy liście) widoczny po otwarciu aplikacji, zamiast inwazyjnych powiadomień systemowych.

   6. Jakie działania są dopuszczalne na "Zestawach" poza ich dodawaniem do listy (np. tworzenie zestawu na podstawie aktualnej listy)?

  Rekomendacja: Funkcja "Zapisz bieżącą listę jako zestaw" to doskonały sposób na szybkie budowanie bazy zestawów przez użytkownika. Rekomenduję
  dodanie przycisku "Zapisz jako zestaw" w menu opcji aktywnej listy.

   7. Czy planujemy wprowadzenie trybu "Ciemny/Jasny" (Dark Mode) już w wersji MVP?

  Rekomendacja: Tak, Dark Mode jest obecnie standardem rynkowym i jest szczególnie ceniony przez użytkowników robiących zakupy wieczorem. PWA
  powinno wspierać automatyczne przełączanie na podstawie ustawień systemowych urządzenia.

   8. W jaki sposób użytkownik może zarządzać duplikatami, jeśli system błędnie połączy dwa różne produkty o podobnej nazwie?

  Rekomendacja: Przy połączonej pozycji powinien znajdować się przycisk "Rozdziel", który przywraca oryginalne, osobne wpisy. Zapobiegnie to
  frustracji użytkownika w rzadkich przypadkach błędnej heurystyki łączenia.

   9. Czy w ramach MVP przewidujemy usuwanie konta użytkownika i co dzieje się wtedy ze współdzielonymi listami?

  Rekomendacja: Prawo do bycia zapomnianym (RODO) wymaga funkcji usunięcia konta. W przypadku list współdzielonych, lista powinna pozostać aktywna
  dla reszty uczestników, a jedynie dane osobowe usuwającego się użytkownika powinny zostać z niej wymazane (anonimizacja wpisów).

   10. Jak system powinien reagować na dodanie tego samego zestawu do listy zakupów dwa razy pod rząd?

  Rekomendacja: System powinien zapytać użytkownika: "Ten zestaw został już dodany. Czy chcesz dodać go ponownie (zwiększyć ilości)?". Pozwoli to
  uniknąć przypadkowego zaśmiecenia listy przy wielokrotnym kliknięciu.
  </pytania>