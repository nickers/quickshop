# Plan implementacji widoku Uwierzytelniania

## 1. Przegląd
Widok uwierzytelniania jest punktem wejścia dla użytkowników nieautoryzowanych. Jego celem jest umożliwienie dostępu do aplikacji poprzez logowanie (email/hasło lub Google) oraz rejestrację nowych kont. Zgodnie z zasadą Mobile First, widok musi być responsywny i czytelny na małych ekranach.

## 2. Routing widoku
*   **Ścieżka**: `/auth`
*   **Dostęp**: Publiczny (dla niezalogowanych). Zalogowani użytkownicy wchodzący na tę ścieżkę powinni być przekierowywani na `/lists` (lub `/`).

## 3. Struktura komponentów
Hierarchia komponentów dla widoku `/auth`:

*   `AuthView` (Page Component)
    *   `AuthLayout` (Wrapper - centrowanie, tło, logo)
        *   `Logo`
        *   `AuthFormContainer`
            *   `AuthModeSwitch` (Przełącznik Logowanie / Rejestracja)
            *   `EmailAuthForm`
                *   `FormField` (Email)
                *   `FormField` (Hasło)
                *   `SubmitButton`
            *   `Divider` ("lub")
            *   `GoogleAuthButton`
    *   `ErrorToast` (Globalny lub lokalny komponent powiadomień o błędach)

## 4. Szczegóły komponentów

### `AuthView`
*   **Opis**: Główny kontener widoku. Zarządza stanem przekierowania po udanym logowaniu.
*   **Główne elementy**: `<div className="min-h-screen ...">`
*   **Obsługiwane interakcje**: Sprawdzenie sesji przy załadowaniu (przekierowanie jeśli już zalogowany).
*   **Obsługiwana walidacja**: Brak.
*   **Typy**: Brak specyficznych.
*   **Propsy**: Brak.

### `AuthModeSwitch`
*   **Opis**: Komponent UI do przełączania między trybem "Logowanie" a "Rejestracja".
*   **Główne elementy**: Dwa przyciski (Tab) lub Segmented Control.
*   **Obsługiwane interakcje**: Kliknięcie zmienia stan `mode` w komponencie nadrzędnym.
*   **Typy**: `AuthMode = 'signin' | 'signup'`
*   **Propsy**:
    *   `currentMode: AuthMode`
    *   `onModeChange: (mode: AuthMode) => void`

### `EmailAuthForm`
*   **Opis**: Formularz obsługujący logowanie i rejestrację przez email/hasło.
*   **Główne elementy**: `<form>`, `<input type="email">`, `<input type="password">`, `<button type="submit">`.
*   **Obsługiwane interakcje**:
    *   Wpisanie emaila i hasła.
    *   Submit formularza.
*   **Obsługiwana walidacja**:
    *   **Email**: Wymagany, poprawny format.
    *   **Hasło**: Wymagane, min. 6 znaków (wymóg Supabase).
*   **Typy**: `AuthCredentials` (patrz sekcja Typy).
*   **Propsy**:
    *   `mode: AuthMode`
    *   `onSubmit: (credentials: AuthCredentials) => Promise<void>`
    *   `isLoading: boolean`

### `GoogleAuthButton`
*   **Opis**: Przycisk inicjujący logowanie przez dostawcę OAuth (Google).
*   **Główne elementy**: `<button>`, Ikona Google.
*   **Obsługiwane interakcje**: Kliknięcie wywołuje `signInWithOAuth`.
*   **Propsy**:
    *   `onClick: () => Promise<void>`
    *   `isLoading: boolean`

## 5. Typy

```typescript
// Typy pomocnicze dla widoku Auth

export type AuthMode = 'signin' | 'signup';

export interface AuthCredentials {
  email: string;
  pass: string; // "pass" zamiast "password" by uniknąć kolizji z atrybutami HTML
}

export interface AuthError {
  message: string;
  code?: string;
}
```

## 6. Zarządzanie stanem

Stan będzie zarządzany lokalnie w komponencie `AuthView` (lub wydzielonym hooku `useAuthLogic`), ponieważ jest to logika specyficzna dla tego widoku.

*   `mode`: `AuthMode` - określa czy wyświetlamy formularz logowania czy rejestracji.
*   `isLoading`: `boolean` - blokuje interfejs podczas komunikacji z API.
*   `error`: `string | null` - przechowuje treść błędu do wyświetlenia.
*   `formData`: (zarządzane przez React Hook Form lub stan lokalny w `EmailAuthForm`).

**Custom Hook: `useAuthForm`** (opcjonalnie, wewnątrz `EmailAuthForm`) do obsługi walidacji i submitu.

## 7. Integracja z interfejsami

Widok korzysta bezpośrednio z `supabaseClient` (zdefiniowanego w `@src/db/supabase.client.ts`).

1.  **Logowanie Email**:
    *   Metoda: `supabase.auth.signInWithPassword({ email, password })`
    *   Parametry: `{ email: string, password: string }`
    *   Wynik: `{ data: { user, session }, error }`
    *   Obsługa błędu: Wyświetlenie `error.message`.

2.  **Rejestracja Email**:
    *   Metoda: `supabase.auth.signUp({ email, password })`
    *   Parametry: `{ email: string, password: string }`
    *   Wynik: `{ data: { user, session }, error }`
    *   **Uwaga**: Supabase może wymagać potwierdzenia emaila. Należy sprawdzić konfigurację lub obsłużyć komunikat "Sprawdź skrzynkę pocztową". W MVP zakładamy auto-login lub jasny komunikat.

3.  **Logowanie Google**:
    *   Metoda: `supabase.auth.signInWithOAuth({ provider: 'google' })`
    *   Parametry: `{ provider: 'google', options: { redirectTo: ... } }`
    *   Wynik: Przekierowanie przeglądarki.

## 8. Interakcje użytkownika

1.  **Przełączanie trybu**: Użytkownik klika "Zarejestruj się" -> nagłówek formularza i przycisk akcji zmieniają tekst ("Zarejestruj", "Załóż konto").
2.  **Wypełnianie formularza**: Walidacja "onBlur" lub przy próbie wysłania. Błędy walidacji (np. "Niepoprawny email") pojawiają się pod polami.
3.  **Wysłanie formularza (Sukces)**:
    *   Spinner na przycisku.
    *   Zablokowanie inputów.
    *   Po sukcesie: Przekierowanie na `/lists` (React Router `navigate`).
4.  **Wysłanie formularza (Błąd)**:
    *   Spinner znika.
    *   Formularz odblokowany.
    *   Toast/Alert z komunikatem błędu (np. "Błędne hasło").
5.  **Logowanie Google**:
    *   Kliknięcie -> Przekierowanie do Google -> Powrót do aplikacji (automatycznie obsłużone przez sesję Supabase).

## 9. Warunki i walidacja

*   **Email**: Regex dla formatu email, pole wymagane.
*   **Hasło**: Pole wymagane, minimum 6 znaków (ograniczenie Supabase).
*   **Stan ładowania**: Podczas `isLoading === true` wszystkie przyciski i inputy muszą mieć atrybut `disabled`.

## 10. Obsługa błędów

*   **Błędy API (Supabase)**: Przechwytywanie obiektu `error` z odpowiedzi `signIn`/`signUp`. Mapowanie kodów błędów na przyjazne komunikaty (np. "invalid_login_credentials" -> "Nieprawidłowy email lub hasło").
*   **Błędy Sieci**: Standardowa obsługa błędów klienta Supabase.
*   **Błędy Walidacji**: Obsługiwane przez formularz przed wysłaniem żądania.

## 11. Kroki implementacji

1.  Stworzenie struktury katalogów: `src/routes/auth.tsx` (dla TanStack Router) lub odpowiednio dla używanego routera.
2.  Implementacja komponentów UI: `AuthLayout`, `AuthModeSwitch`, `GoogleAuthButton`.
3.  Implementacja formularza `EmailAuthForm` z walidacją (np. używając React Hook Form i Zod, jeśli są w stacku, lub czystego Reacta).
4.  Integracja z `supabase.auth` w głównym komponencie widoku (`AuthView` lub `src/routes/auth.tsx`).
5.  Obsługa stanów `loading` i `error`.
6.  Dodanie przekierowania po udanym zalogowaniu (`navigate('/lists')`).
7.  Podpięcie routingu (jeśli nie jest automatyczne w `src/routes`).
8.  Weryfikacja działania logowania Google i Email.
