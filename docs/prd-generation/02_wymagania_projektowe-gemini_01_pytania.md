### iteration 1


✦ <pytania>
   1. W jaki sposób system ma traktować łączenie duplikatów produktów o różnych jednostkach lub szczegółach (np. "Mleko 1L" i "Mleko 2szt")?

  Rekomendacja: W MVP sugeruję łączenie pozycji wyłącznie na podstawie identycznej nazwy (ignorując wielkość liter). W przypadku wykrycia duplikatu
  system powinien wyświetlić jedną pozycję z sumaryczną adnotacją lub wyróżnieniem, pozostawiając decyzję o ilości użytkownikowi, aby uniknąć błędów
  w konwersji jednostek.

   2. Czy "Zestawy" mają funkcjonować jako niezależne szablony, czy są dynamicznie powiązane z listami zakupów?

  Rekomendacja: Zestawy powinny działać jako szablony ("kopiuj-wklej"). Edycja produktów na aktywnej liście zakupów (po dodaniu ich z zestawu) nie
  powinna wpływać na definicję zapisanego zestawu, co uprości logikę aplikacji.

   3. Jakie konkretnie atrybuty produktu są niezbędne dla użytkownika w wersji MVP (np. ilość, jednostka, kategoria, zdjęcie)?

  Rekomendacja: Ograniczmy atrybuty do absolutnego minimum: "Nazwa" (wymagane) oraz opcjonalne pole tekstowe "Ilość/Notatka". Kategoryzację i
  zdjęcia warto przesunąć do kolejnych faz, aby przyspieszyć wprowadzanie danych.

   4. Czy aplikacja musi wspierać tryb offline, biorąc pod uwagę, że w marketach często występuje słaby zasięg?

  Rekomendacja: Jest to krytyczne dla UX. Aplikacja powinna działać w modelu "local-first" – zmiany zapisywane są lokalnie w urządzeniu i
  synchronizowane z serwerem po odzyskaniu połączenia.

   5. W jaki sposób użytkownik będzie oznaczał produkty jako "kupione" w trakcie wizyty w sklepie?

  Rekomendacja: Sugeruję prosty mechanizm checkboxa lub gestu przesunięcia (swipe), który przenosi produkt na dół listy do sekcji "Kupione" lub go
  wyszarza, zamiast całkowicie usuwać, co pozwoli na weryfikację przy kasie.

   6. Czy w ramach "podstawowego systemu uwierzytelniania" planujemy obsługę logowania społecznościowego (Google/Facebook)?

  Rekomendacja: Wdrożenie logowania przez Google znacznie obniża barierę wejścia dla nowych użytkowników. Sugeruję zestaw: Email/Hasło + Google
  Auth.

   7. Jak technicznie planujemy mierzyć kryterium sukcesu: "90% zakupionych towarów pochodzi z listy"?

  Rekomendacja: Ponieważ nie skanujemy paragonów (poza zakresem MVP), sugeruję dodanie prostego podsumowania po zakończeniu zakupów ("Zakończ
  zakupy"), gdzie użytkownik jednym suwakiem lub liczbą określa, ile rzeczy kupił spoza listy.

   8. Czy przewidujemy w MVP funkcję współdzielenia list (np. dla domowników), skoro wykluczamy "wielopoziomowy system uprawnień"?

  Rekomendacja: W MVP zrezygnujmy ze skomplikowanego zapraszania użytkowników. Użytkownicy mogą po prostu współdzielić jeden login i hasło do konta
  domowego, co jest wystarczającym obejściem na tym etapie.

   9. Na jakiej platformie docelowej ma działać MVP (Mobile Native, Web, PWA)?

  Rekomendacja: Biorąc pod uwagę charakter "szybkich zakupów", aplikacja PWA (Progressive Web App) będzie najlepszym kompromisem – działa jak
  aplikacja na telefonie, jest tańsza w produkcji niż native i dostępna na każdym systemie.

   10. Czy puste listy/zestawy po instalacji nie zniechęcą użytkownika (problem "pustej kartki")?

  Rekomendacja: Warto zaimplementować tzw. "seed data" – po założeniu konta użytkownik powinien widzieć 2-3 przykładowe zestawy (np. "Śniadanie",
  "Chemia domowa"), które pokażą potencjał funkcji zestawów od razu.
  </pytania>




<odpowiedzi>
1. W jaki sposób system ma traktować łączenie duplikatów produktów o różnych jednostkach lub szczegółach (np. "Mleko 1L" i "Mleko 2szt")?

Zgodnie z sugestią: łączenie pozycji wyłącznie na podstawie identycznej nazwy (ignorując wielkość liter). W przypadku wykrycia duplikatu system powinien wyświetlić jedną pozycję z sumaryczną adnotacją lub wyróżnieniem, pozostawiając decyzję o ilości użytkownikowi, aby uniknąć błędów w konwersji jednostek.

2. Zgodnie z sugestią: Zestawy powinny działać jako szablony ("kopiuj-wklej"). Edycja produktów na aktywnej liście zakupów (po dodaniu ich z zestawu) nie powinna wpływać na definicję zapisanego zestawu.

3. Zgodnie z rekomendacją: ograniczmy atrybuty do absolutnego minimum: "Nazwa" (wymagane) oraz opcjonalne pole tekstowe "Ilość/Notatka". 

4. Aplikacja powinna działać w modelu "local-first" – zmiany zapisywane są lokalnie w urządzeniu i synchronizowane z serwerem po odzyskaniu połączenia.

5. Zaznaczenie checkboxa lub swipe przeniesie pozycję do listy "kupione".

6. Czy w ramach "podstawowego systemu uwierzytelniania" planujemy obsługę logowania społecznościowego (Google/Facebook)?
Zgodnie z sugestią: Sugeruję zestaw: Email/Hasło + Google Auth.

7. Zgodnie z sugestią: po zakończeniu zakupów użytkownik wpisze liczbę produktów kupionych spoza listy (wartość opcjonalna, jeśli pominięta statystyka nie będzie liczona dla danej sesji zakupowej).


8. Czy przewidujemy w MVP funkcję współdzielenia list (np. dla domowników), skoro wykluczamy "wielopoziomowy system uprawnień"?

Tak. Do każdej listy zakupowej można dodać innych użytkowników i wszyscy są traktowanie jako równoważni właściciele tej listy (mogą udostępniać listę dalej oraz usuwać innych użytkowników, więc możliwe jest na przykład przekazanie listy przez dodanie nowego właściciela a potem usunięcie oryginalnego użytkownika).

9. PWA.

10. Tak. Do każdego założonego konta będzie dodana nowa lista zakupowa "Pierwsza lista" z 1 pozycją "mleko".
</odpowiedzi>