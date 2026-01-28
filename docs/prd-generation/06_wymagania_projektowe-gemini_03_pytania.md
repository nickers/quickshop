<pytania>
   1. Czy aplikacja w MVP ma być dostępna wyłącznie w języku polskim, czy powinniśmy od razu przygotować infrastrukturę pod wiele języków (i18n)?

  Rekomendacja: W MVP ograniczmy się do języka polskiego, aby przyspieszyć prace, ale w kodzie warto od początku używać kluczy tłumaczeń (np.
  i18next), co pozwoli na błyskawiczną ekspansję na inne rynki w przyszłości bez refaktoryzacji.

   2. Czy w ramach MVP potrzebna jest wyszukiwarka na liście zakupów oraz na liście zestawów?

  Rekomendacja: Przy dużej liczbie zestawów lub długich listach (np. "na tydzień") wyszukiwanie tekstowe staje się kluczowe dla szybkości obsługi.
  Rekomenduję dodanie prostego paska wyszukiwania na górze ekranu w obu tych widokach.

   3. Czy planujemy nałożyć limity na liczbę produktów na liście, liczbę zestawów lub liczbę współdzielących użytkowników?

  Rekomendacja: Aby utrzymać wydajność modelu synchronizacji local-first, sugeruję "miękkie" limity w MVP, np. do 100 produktów na liście, 50
  zestawów i 10 współużytkowników na jedną listę. Zapobiegnie to potencjalnym problemom z wydajnością na starszych telefonach.

   4. W jaki sposób użytkownik ma się przełączać między Listami, Zestawami i Historią (Główna nawigacja)?

  Rekomendacja: Najbardziej intuicyjny dla aplikacji mobilnych (PWA) będzie dolny pasek nawigacji (Bottom Navigation Bar) z trzema zakładkami:
  "Listy", "Zestawy" oraz "Historia". Zapewnia to szybki dostęp kciukiem do najważniejszych funkcji.

   5. Czy masz preferowany framework frontendowy do budowy PWA (np. React, Next.js, Vue)?

  Rekomendacja: Rekomenduję React z Vite (ze względu na szybkość i lekkość) lub Next.js. Do stylizacji najlepiej sprawdzi się Tailwind CSS w
  połączeniu z komponentami w stylu Material Design, aby uzyskać nowoczesny, "aplikacyjny" wygląd.

   6. Jak szczegółowy ma być interfejs edycji zestawów – czy ma to być osobny ekran, czy uproszczony modal?

  Rekomendacja: Edycja zestawu powinna odbywać się na dedykowanym ekranie, funkcjonalnie identycznym z widokiem listy zakupów. Dzięki temu
  użytkownik nie musi uczyć się nowego interfejsu, aby zarządzać bazą swoich produktów.

   7. Czy użytkownik powinien mieć możliwość ręcznej zmiany kolejności produktów na liście (np. metodą przeciągnij i upuść)?

  Rekomendacja: Tak, funkcja drag-and-drop jest bardzo pożądana przez użytkowników, którzy chcą układać listę zgodnie z topografią swojego
  ulubionego sklepu. W MVP warto wdrożyć prostą bibliotekę do sortowania (np. dnd-kit).

   8. Czy potrzebna jest funkcja "Wyczyść listę" (usuwająca wszystkie niezakupione pozycje) dostępna jednym kliknięciem?

  Rekomendacja: Zdecydowanie tak. Funkcja "Wyczyść listę" (z wymaganym potwierdzeniem) powinna znaleźć się w menu opcji aktywnej listy, aby ułatwić
  resetowanie błędnie dodanych zestawów.

   9. W jaki sposób użytkownik powinien być informowany o stanie synchronizacji danych (online/offline)?

  Rekomendacja: Mała, dyskretna ikona w nagłówku (np. chmurka: zielona - zsynchronizowano, pomarańczowa z wykrzyknikiem - tryb offline) zapewni
  użytkownikowi poczucie bezpieczeństwa, że jego zmiany nie znikną po zamknięciu przeglądarki.

   10. Czy "Szybkie zakupy" to nazwa ostateczna, czy mamy już docelową markę/logo, którą należy uwzględnić w projekcie UI?

  Rekomendacja: Jeśli nie ma docelowej marki, sugeruję użycie roboczej nazwy "QuickShop" lub pozostanie przy "Szybkie Zakupy" z minimalistycznym
  logotypem opartym na ikonie koszyka, co ułatwi rozpoznawalność ikony aplikacji na pulpicie telefonu.
  </pytania>