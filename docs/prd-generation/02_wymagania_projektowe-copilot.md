### iteration 1


- Jak dokładnie wygląda aktualny proces robienia zakupów (planowanie, tworzenie list, zakupy w sklepie) u docelowego użytkownika i w jakich konkretnych momentach pojawia się problem „zapominania” stałych produktów?
Rekomendacja: Zdefiniuj 2–3 główne scenariusze (np. „zakupy weekendowe rodziny”, „singiel kupujący po pracy”), aby PRD mógł odzwierciedlać realne konteksty użycia.
- Który przypadek użycia jest ważniejszy na start: szybkie dorzucanie stałych zestawów (np. „śniadania”) czy jednorazowe tworzenie list zakupów na konkretne wydarzenia (np. „urodziny”)?
Rekomendacja: Ustal priorytet głównego „momentu prawdy” — funkcjonalności, która w największym stopniu wpłynie na zmianę zachowania użytkownika, i oznacz ją jako „must-have” w PRD.
- Czy użytkownik ma w aplikacji prowadzić jedną główną listę zakupów (np. na najbliższe zakupy), czy wiele równoległych list (np. „Biedronka”, „Lidl”, „Impreza”) i jak ważna jest ta wielolistowość w MVP?
Rekomendacja: Podejmij decyzję, czy MVP zakłada model „jednej aktywnej listy” (prostsza implementacja), czy też od razu potrzebne są wielokrotne listy z możliwością ich przełączania.
- Jak wyobrażasz sobie interakcję z duplikatami: czy użytkownik ma widzieć pozycję „jabłka (z 3 zestawów)” z możliwością rozwinięcia szczegółów, czy raczej zsumowaną ilość bez wglądu w źródło?
Rekomendacja: Opisz w PRD docelowy UX dla łączenia duplikatów (widok, oznaczenia, możliwość edycji ilości), bo to kluczowa, ale łatwa do skomplikowania funkcja.
- Czy system uwierzytelniania w MVP ma być minimalny (np. e-mail + hasło) czy planujesz od razu logowanie zewnętrzne (Google/Apple), a jeśli tak, które metody są obowiązkowe?
Rekomendacja: Zdecyduj o jednym podstawowym mechanizmie logowania na MVP, a integracje z dostawcami zewnętrznymi opisz jako „nice-to-have” lub kolejny etap.
- Jak chcesz mierzyć kryterium „90% zakupionych towarów pochodzi z listy”, skoro aplikacja nie ma integracji z paragonami/sklepami — na podstawie deklaracji użytkownika czy jakiegoś uproszczonego mechanizmu „odhaczania” zakupów?
Rekomendacja: Zdefiniuj w PRD konkretny, mierzalny proxy-metryk (np. odsetek pozycji odhaczonych jako kupione podczas sesji zakupowej) zamiast realnego udziału w faktycznym paragonie.
- Czy masz określony horyzont czasowy dla MVP (np. 3 miesiące do wersji testowej, 6 miesięcy do publicznego release’u) oraz minimalny skład zespołu (produkt, dev, UX), który jest realistycznie dostępny?
Rekomendacja: W PRD dodaj sekcję „Założenia projektowe” z ramowym harmonogramem i składem zespołu, bo będzie to wpływać na zakres i głębokość funkcji w MVP.
- Jakie platformy są priorytetowe na start: tylko mobile (Android/iOS), PWA, czy także prosty web?
Rekomendacja: Wybierz jedną platformę jako główną dla MVP (np. PWA lub Android) i zapewnij, że PRD jasno komunikuje ograniczenia co do pozostałych, aby uniknąć rozproszenia prac.
- Jakie główne ryzyka widzisz: brak nawyku korzystania z listy, zbyt skomplikowany interfejs, brak różnicy względem istniejących aplikacji list zakupów?
Rekomendacja: W PRD dodaj sekcję „Ryzyka i założenia”, a przy każdym ryzyku wpisz plan minimalizacji (np. prosty onboarding, gotowe zestawy startowe, przypomnienia o stałych zakupach).
- Czy planujesz jakąkolwiek funkcję „przypominania” o powtarzalnych zestawach (np. co tydzień w piątek sugeruj „zestaw śniadania”), czy na MVP użytkownik sam musi inicjować wszystko ręcznie?
Rekomendacja: Zdecyduj, czy w MVP ma się pojawić choćby bardzo prosty mechanizm przypomnienia (np. powiadomienie push oparte na ręcznym ustawieniu), bo może on silnie wpływać na realizację głównego problemu „zapominania”.
