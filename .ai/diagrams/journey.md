<user_journey_analysis>
1. **Ścieżki użytkownika (User Paths):**
   - **Nowy Użytkownik:** Wejście na stronę -> Rejestracja (E-mail/Hasło) -> Automatyczne utworzenie domyślnej listy -> Automatyczne zalogowanie -> Dostęp do aplikacji.
   - **Powracający Użytkownik (E-mail):** Wejście na stronę -> Logowanie (E-mail/Hasło) -> Walidacja -> Dostęp do aplikacji.
   - **Użytkownik Google:** Wejście na stronę -> Logowanie/Rejestracja przez Google (OAuth) -> Dostęp do aplikacji.
   - **Zapomniane Hasło:** Ekran logowania -> "Zapomniałem hasła" -> Podanie e-maila -> Odebranie wiadomości -> Kliknięcie linku -> Ustawienie nowego hasła -> Logowanie.
   - **Weryfikacja E-mail:** Rejestracja -> Otrzymanie e-maila weryfikacyjnego (w tle lub wymagane) -> Kliknięcie linku -> Potwierdzenie konta.
   - **Niezalogowany Użytkownik:** Dostęp do strony głównej (Landing Page), brak dostępu do list zakupów (wymaga logowania).

2. **Główne podróże i stany:**
   - **Autentykacja:** Stan początkowy, obejmuje wybór metody (Logowanie/Rejestracja).
   - **Proces Logowania:** Wprowadzanie danych, walidacja, obsługa błędów, OAuth.
   - **Proces Rejestracji:** Formularz, walidacja, tworzenie konta, inicjalizacja danych (lista startowa).
   - **Odzyskiwanie Dostępu:** Flow resetowania hasła.
   - **Aplikacja (Zalogowany):** Główny widok list, dostęp do funkcjonalności biznesowych.

3. **Punkty decyzyjne:**
   - Czy użytkownik ma konto? (Logowanie vs Rejestracja).
   - Czy dane logowania są poprawne?
   - Czy rejestracja się powiodła (unikalny email)?
   - Czy logowanie następuje przez Google czy E-mail?
   - Czy token (weryfikacyjny/resetu) jest ważny?

4. **Cel stanów:**
   - `EkranPowitalny`: Punkt wejścia, informacja o aplikacji, wybór akcji.
   - `FormularzLogowania` / `FormularzRejestracji`: Zbieranie danych uwierzytelniających.
   - `Aplikacja`: Umożliwienie korzystania z funkcji biznesowych (listy zakupów).
</user_journey_analysis>

<mermaid_diagram>
```mermaid
stateDiagram-v2
    [*] --> Niezalogowany

    state "Strefa Niezalogowana" as Niezalogowany {
        [*] --> EkranPowitalny
        
        EkranPowitalny --> FormularzLogowania: Mam już konto
        EkranPowitalny --> FormularzRejestracji: Chcę założyć konto
        
        note right of EkranPowitalny
            Użytkownik może zapoznać się z
            głównymi funkcjami aplikacji
        end note

        state "Logowanie" as ProcesLogowania {
            state if_metoda_logowania <<choice>>
            FormularzLogowania --> if_metoda_logowania
            
            if_metoda_logowania --> LogowanieEmail: E-mail i hasło
            if_metoda_logowania --> LogowanieGoogle: Google OAuth

            LogowanieGoogle --> WalidacjaOAuth
            LogowanieEmail --> WalidacjaDanychLogowania

            state if_walidacja_logowania <<choice>>
            WalidacjaDanychLogowania --> if_walidacja_logowania
            
            if_walidacja_logowania --> SukcesLogowania: Dane poprawne
            if_walidacja_logowania --> BladLogowania: Dane błędne
            
            BladLogowania --> FormularzLogowania: Spróbuj ponownie
            
            FormularzLogowania --> InicjacjaResetuHasla: Zapomniałem hasła
        }

        state "Rejestracja" as ProcesRejestracji {
            FormularzRejestracji --> WalidacjaDanychRejestracji
            
            state if_walidacja_rejestracji <<choice>>
            WalidacjaDanychRejestracji --> if_walidacja_rejestracji
            
            if_walidacja_rejestracji --> TworzenieKonta: Dane poprawne
            if_walidacja_rejestracji --> BladRejestracji: E-mail zajęty/Błąd
            
            BladRejestracji --> FormularzRejestracji
            
            state fork_rejestracja <<fork>>
            TworzenieKonta --> fork_rejestracja
            
            fork_rejestracja --> WyslanieEmailaWeryfikacyjnego: Wyślij link
            fork_rejestracja --> InicjalizacjaDanych: Utwórz listę startową
            
            state join_rejestracja <<join>>
            WyslanieEmailaWeryfikacyjnego --> join_rejestracja
            InicjalizacjaDanych --> join_rejestracja
            
            join_rejestracja --> AutoLogowanie
        }

        state "Odzyskiwanie Hasła" as ProcesResetu {
            InicjacjaResetuHasla --> PodanieEmaila
            PodanieEmaila --> WyslanieLinkuResetu
            WyslanieLinkuResetu --> [*]: Sprawdź pocztę
        }
    }

    state "Zewnętrzne Zdarzenia (Email)" as EmailFlow {
        [*] --> KlikniecieWLink
        KlikniecieWLink --> WeryfikacjaTokenu
        
        state if_typ_tokenu <<choice>>
        WeryfikacjaTokenu --> if_typ_tokenu
        
        if_typ_tokenu --> FormularzNowegoHasla: Reset hasła
        if_typ_tokenu --> PotwierdzenieKonta: Weryfikacja konta
        
        FormularzNowegoHasla --> ZapisanieHasla
        ZapisanieHasla --> PrzekierowanieDoLogowania
    }

    state "Aplikacja (Zalogowany)" as Aplikacja {
        [*] --> Dashboard
        
        state "Widok List" as Dashboard {
            [*] --> ListaDostepnychList
        }
        
        note right of Dashboard
            Dostęp do:
            - Tworzenie list
            - Zestawy
            - Historia
        end note
    }

    SukcesLogowania --> Aplikacja
    WalidacjaOAuth --> Aplikacja: Sukces
    AutoLogowanie --> Aplikacja
    PrzekierowanieDoLogowania --> FormularzLogowania
    PotwierdzenieKonta --> Aplikacja: (Jeśli sesja aktywna)
    PotwierdzenieKonta --> FormularzLogowania: (Jeśli brak sesji)

    Aplikacja --> EkranPowitalny: Wyloguj
```
</mermaid_diagram>
