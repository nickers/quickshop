Jako starszy programista frontendu Twoim zadaniem jest stworzenie szczegółowego planu wdrożenia nowego widoku w aplikacji internetowej. Plan ten powinien być kompleksowy i wystarczająco jasny dla innego programisty frontendowego, aby mógł poprawnie i wydajnie wdrożyć widok.

Najpierw przejrzyj następujące informacje:

1. Product Requirements Document (PRD):
<prd>
@.ai/prd.md
</prd>

2. Opis widoku:
<view_description>
**Ekran Logowania / Rejestracji** (ui-plan.md §2.1). Ścieżka: /auth. Cel: uwierzytelnienie użytkownika. Kluczowe komponenty: przełącznik „Logowanie / Rejestracja”, formularz (Email, Hasło), przycisk „Zaloguj z Google”. UX/Bezpieczeństwo: jasne komunikaty błędów walidacji, feedback wizualny podczas ładowania. Po zalogowaniu redirect do /lists.
</view_description>

3. User Stories:
<user_stories>
* US-001 Logowanie przez e-mail: formularz przyjmuje e-mail i hasło; poprawne dane → widok główny; błędne → komunikat.
* US-002 Logowanie przez Google: przycisk „Zaloguj z Google”, inicjacja OAuth, po sukcesie użytkownik zalogowany.
* US-003 Rejestracja konta: formularz rejestracji (e-mail, hasło); po rejestracji tworzona jest domyślna lista startowa; użytkownik automatycznie zalogowany.
</user_stories>

4. Interface description:
<interface_description>
Auth obsługiwany przez Supabase Auth SDK (business-logic-plan: US-001–US-003). Metody: supabase.auth.signInWithPassword({ email, password }), supabase.auth.signInWithOAuth({ provider: 'google' }), supabase.auth.signUp({ email, password }). Walidacja po stronie klienta: niepusty email (format), hasło min. 6 znaków. Błędy Supabase (invalid credentials, email already registered) mapowane na zrozumiałe komunikaty po polsku.
</interface_description>

5. Interface implementation:
<interface_implementation>
@code/src/db/supabase.client.ts, @code/src/components/auth/AuthModeSwitch.tsx, @code/src/components/auth/EmailAuthForm.tsx, @code/src/components/auth/GoogleAuthButton.tsx, @code/src/routes/auth.tsx
</interface_implementation>

6. Type Definitions:
<type_definitions>
@code/src/types/domain.types.ts, @code/src/types/auth.types.ts (jeśli istnieje), @code/src/db/database.types.ts
</type_definitions>

7. Tech Stack:
<tech_stack>
@.ai/tech-stack.md
</tech_stack>

8. Plan implementacji (istniejący):
<impl_plan>
@.ai/impl-plan-02-auth.md
</impl_plan>

9. Plan bazy danych:
<db_plan>
@.ai/db-plan.md
</db_plan>

Przed utworzeniem ostatecznego planu wdrożenia przeprowadź analizę i planowanie wewnątrz tagów <implementation_breakdown> w swoim bloku myślenia.

W swoim podziale implementacji wykonaj kroki 1–12 jak w szablonie (podsumowanie sekcji, wymagania, komponenty, drzewo komponentów, typy, stan, wywołania backendu, mapowanie user stories, interakcje, warunki, błędy, wyzwania).

Po przeprowadzeniu analizy dostarcz plan wdrożenia w formacie Markdown z sekcjami: 1. Przegląd, 2. Routing, 3. Struktura komponentów, 4. Szczegóły komponentów, 5. Typy, 6. Zarządzanie stanem, 7. Integracja z interfejsami, 8. Interakcje użytkownika, 9. Warunki i walidacja, 10. Obsługa błędów, 11. Kroki implementacji.

Ostateczne wyniki w języku polskim, zapisane w pliku **.ai/auth-view-implementation-plan.md**. Nie uwzględniaj analizy w końcowym wyniku.
