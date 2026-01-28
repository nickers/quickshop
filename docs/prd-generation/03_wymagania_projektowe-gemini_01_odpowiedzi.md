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