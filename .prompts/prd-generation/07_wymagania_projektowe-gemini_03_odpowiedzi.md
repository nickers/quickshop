<pytania>
   1. Czy aplikacja w MVP ma być dostępna wyłącznie w języku polskim, czy powinniśmy od razu przygotować infrastrukturę pod wiele języków (i18n)?

  Zgodnie z rekomendacją: ograniczmy się do języka polskiego, ale w kodzie będziemy używać kluczy tłumaczeń (np. i18next).

   2. Czy w ramach MVP potrzebna jest wyszukiwarka na liście zakupów oraz na liście zestawów?

  TAk, zgodnie z rekomendacją: dodamy prosty pasek wyszukiwania na górze ekranu w obu tych widokach.

   3. Czy planujemy nałożyć limity na liczbę produktów na liście, liczbę zestawów lub liczbę współdzielących użytkowników?

   Bez limitów, jednak bez specjalnej obsługi długich list, zakładamy dobrą wolę użytkownika.

   4. W jaki sposób użytkownik ma się przełączać między Listami, Zestawami i Historią (Główna nawigacja)?

  Zgodnie z rekomendacją: dolny pasek nawigacji (Bottom Navigation Bar) z trzema zakładkami: "Listy", "Zestawy" oraz "Historia".

   5. Czy masz preferowany framework frontendowy do budowy PWA (np. React, Next.js, Vue)?

   React z Vite, do stylizacji najlepiej sprawdzi się Tailwind CSS w połączeniu z komponentami w stylu Material Design, aby uzyskać nowoczesny, "aplikacyjny" wygląd.

   6. Jak szczegółowy ma być interfejs edycji zestawów – czy ma to być osobny ekran, czy uproszczony modal?

  Zgodnie z rekomendacją: edycja zestawu powinna odbywać się na dedykowanym ekranie, funkcjonalnie identycznym z widokiem listy zakupów.

   7. Czy użytkownik powinien mieć możliwość ręcznej zmiany kolejności produktów na liście (np. metodą przeciągnij i upuść)?

  Rekomendacja: Tak, funkcja drag-and-drop jest bardzo pożądana, należy dodać opcję sortowania.

   8. Czy potrzebna jest funkcja "Wyczyść listę" (usuwająca wszystkie niezakupione pozycje) dostępna jednym kliknięciem?

  Zdecydowanie tak. Funkcja "Wyczyść listę" (z wymaganym potwierdzeniem) powinna znaleźć się w menu opcji aktywnej listy, aby ułatwić
  resetowanie błędnie dodanych zestawów.

   9. W jaki sposób użytkownik powinien być informowany o stanie synchronizacji danych (online/offline)?

  Zgoda, dyskretna ikona w nagłówku (np. chmurka: zielona - zsynchronizowano, pomarańczowa z wykrzyknikiem - tryb offline, itp.).

   10. Czy "Szybkie zakupy" to nazwa ostateczna, czy mamy już docelową markę/logo, którą należy uwzględnić w projekcie UI?

  Użyjmy "QuickShop" z minimalistycznym logotypem opartym na ikonie koszyka.
  </pytania>