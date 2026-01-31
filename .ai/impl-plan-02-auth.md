# Plan implementacji: Część 2 – Ekran Auth

**Odniesienie:** ui-plan.md §2.1  
**Część:** 2 – Ekran Auth

## Cel
Dopasowanie ekranu logowania/rejestracji do ui-plan: przełącznik Logowanie/Rejestracja, formularz (email, hasło), "Zaloguj z Google", czytelne komunikaty błędów walidacji, feedback podczas ładowania.

## Stan obecny
- Ścieżka `/auth`, komponenty: AuthModeSwitch, EmailAuthForm, GoogleAuthButton (w `src/components/auth/`).
- Trzeba zweryfikować: walidacja, komunikaty błędów, stany ładowania.

## Zadania

### 1. Weryfikacja i dopracowanie AuthModeSwitch
- [ ] Przełącznik między trybem "Logowanie" i "Rejestracja" jest widoczny i działa.
- [ ] Etykiety zgodne z ui-plan (np. "Logowanie" / "Rejestracja").

### 2. Formularz (Email, Hasło)
- [ ] Pola: Email, Hasło (type password).
- [ ] Przycisk zatwierdzenia: np. "Zaloguj się" / "Zarejestruj się" w zależności od trybu.
- [ ] Walidacja po stronie klienta: niepusty email (format), hasło min. długość (np. 6 znaków) – czytelne komunikaty pod polami lub w bloku błędów.

### 3. Zaloguj z Google
- [ ] Przycisk "Zaloguj z Google" widoczny i działający (GoogleAuthButton).
- [ ] Spójny styl z resztą formularza.

### 4. Komunikaty błędów
- [ ] Błędy z Supabase (np. invalid credentials, email already registered) mapowane na zrozumiałe komunikaty po polsku.
- [ ] Wyświetlanie w jednym miejscu (np. nad formularzem lub przy przycisku) z możliwością zamknięcia/ukrycia.

### 5. Feedback podczas ładowania
- [ ] Podczas wysyłki formularza: disable przycisku "Zaloguj"/"Zarejestruj" + wskaźnik ładowania (spinner lub tekst "Logowanie...").
- [ ] To samo dla "Zaloguj z Google" jeśli możliwe (np. stan loading w kontekście).

### 6. UX/Bezpieczeństwo
- [ ] Brak ujawniania szczegółów (np. "użytkownik istnieje" przy rejestracji – ogólny komunikat).
- [ ] Po udanym logowaniu/rejestracji redirect do `/lists` (już prawdopodobnie zaimplementowane).

## Kryteria ukończenia
- Formularz z walidacją i czytelnymi błędami.
- Stan ładowania przy logowaniu/rejestracji i przy Google.
- Zgodność z opisem §2.1 ui-plan.
