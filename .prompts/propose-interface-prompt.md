<db-plan>
@.ai/db-plan.md
</db-plan>

<prd>
@.ai/prd.md
</prd>

<tech-stack>
@.ai/tech-stack.md
</tech-stack>

Jesteś doświadczonym architektem oprogramowania, którego zadaniem jest stworzenie kompleksowego interfejsu dla klas pośredni. Twój plan będzie oparty na podanym schemacie bazy danych, dokumencie wymagań produktu (PRD) i stacku technologicznym podanym powyżej. Uważnie przejrzyj dane wejściowe i wykonaj następujące kroki:

1. Przeanalizuj schemat bazy danych:
   - Zidentyfikuj główne encje (tabele)
   - Zanotuj relacje między jednostkami
   - Rozważ wszelkie indeksy, które mogą mieć wpływ na projekt API
   - Zwróć uwagę na warunki walidacji określone w schemacie.

2. Przeanalizuj PRD:
   - Zidentyfikuj kluczowe cechy i funkcjonalności
   - Zwróć uwagę na konkretne wymagania dotyczące operacji na danych (pobieranie, tworzenie, aktualizacja, usuwanie, offline/online)
   - Zidentyfikuj wymagania logiki biznesowej, które wykraczają poza operacje CRUD

3. Rozważ stack technologiczny:
   - Upewnij się, że projekt jest zgodny z określonymi technologiami.
   - Rozważ, w jaki sposób te technologie mogą wpłynąć na wykorzystanie.

4. Zdefiniuj interfejs typescript, który później zostanie zaimplementowany. Weź pod uwagę:
   - implementacja będzie wykorzystywana w aplikacji react a użyciem tanstack query + supabase 
   - historyjki użytkownika
   - filtrowania i sortowania dla punktów końcowych listy.
   - Uwzględnienie mechanizmów uwierzytelniania i autoryzacji, jeśli wspomniano o nich w PRD
   
Przed dostarczeniem ostatecznego planu, pracuj wewnątrz tagów <api_analysis> w swoim bloku myślenia, aby rozbić swój proces myślowy i upewnić się, że uwzględniłeś wszystkie niezbędne aspekty. W tej sekcji:

1. Wymień główne encje ze schematu bazy danych. Ponumeruj każdą encję i zacytuj odpowiednią część schematu.
2. Wymień kluczowe funkcje logiki biznesowej z PRD. Ponumeruj każdą funkcję i zacytuj odpowiednią część PRD.
3. Zmapuj funkcje z PRD do potencjalnych metod definiowanego interfejsu. Dla każdej metody rozważ co najmniej dwa możliwe projekty i wyjaśnij, który z nich wybrałeś i dlaczego.
5. Wyraźnie mapuj logikę biznesową z PRD na metody wykorzystane do ich realizacji (nie ograniczaj ilości metod wykorzystanych w historyjce użytkownika, wykorzystaj tyle ile trzeba).
6. Uwzględnienie warunków walidacji ze schematu bazy danych w projekcie.

Ta sekcja może być dość długa.

Ostateczna propozycja interfejsu powinna być sformatowana w markdown i zawierać następujące sekcje:

1. blok kodu definiujący interfejs
2. mapowanie historyjek i wykorzystanych metod
3. uwagi końcowe (na co warto zwrócić uwagę w trakcie implementacji)

Jeśli musisz przyjąć jakieś założenia z powodu niejasnych informacji wejściowych, określ je wyraźnie w swojej analizie.

Końcowy wynik powinien składać się wyłącznie z propozycji w formacie markdown w języku angielskim, którą zapiszesz w .ai/business-logic-plan.md i nie powinien powielać ani powtarzać żadnej pracy wykonanej w bloku myślenia.