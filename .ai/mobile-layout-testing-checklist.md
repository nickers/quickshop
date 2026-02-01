# Checklist - Testy Manualne Mobile Layout Fix

## ✅ Co zostało zaimplementowane

### 1. Meta Viewport (index.html)
- ✅ Dodano `viewport-fit=cover` dla obsługi notch/safe areas
- ✅ Dodano `interactive-widget=resizes-visual` dla klawiatury

### 2. CSS Utilities (styles.css)
- ✅ `.h-screen-safe` - dynamic viewport height z fallbackiem
- ✅ `.overscroll-none` - zapobiega bounce effect
- ✅ `.touch-manipulation` - zapobiega zoom na double-tap
- ✅ `.scroll-smooth-ios` - płynne scrollowanie

### 3. Layout Refactoring (lists.$listId.tsx)
- ✅ Zamieniono `min-h-screen` → `h-screen-safe`
- ✅ Usunięto `pb-20` z głównego kontenera
- ✅ Dodano wrappery `flex-shrink-0` dla header i input bar
- ✅ Scrollable area z `min-h-0`, `overscroll-none`, `scroll-smooth-ios`
- ✅ Dodano spacer `h-24` na dole (zapobiega zakrywaniu itemów)

### 4. Header Cleanup
- ✅ Usunięto zbędny `sticky top-0` z ListDetailsHeader

### 5. Weryfikacja
- ✅ TypeScript compilation: PASSED
- ✅ Linter: NO ERRORS
- ✅ Production build: PASSED

---

## 📱 TESTY MANUALNE - DO WYKONANIA

### Przygotowanie
1. Wgraj build na serwer testowy lub użyj `npm run dev`
2. Otwórz aplikację na **rzeczywistym urządzeniu mobilnym** (nie emulator!)
3. Zaloguj się do aplikacji
4. Utwórz listę z co najmniej 10-15 produktami

### Platforma 1: iOS Safari (najważniejsza!)
**Urządzenia:** iPhone (iOS 15.4+), najlepiej różne modele

#### Test 1: Stabilność layoutu z klawiaturą
- [ ] Otwórz listę produktów
- [ ] Kliknij w pole "Dodaj produkt" na dole
- [ ] **SPRAWDŹ:** Czy layout się "skacze" gdy klawiatura się pojawia?
  - ✅ OK: Layout jest stabilny
  - ❌ PROBLEM: Lista/input skacze w górę/dół
- [ ] **SPRAWDŹ:** Czy header jest nadal widoczny na górze?
- [ ] **SPRAWDŹ:** Czy input bar jest na dole (nad klawiaturą)?

#### Test 2: Scrollowanie z klawiaturą
- [ ] Z otwartą klawiaturą, scrolluj listę produktów
- [ ] **SPRAWDŹ:** Czy scrollowanie jest płynne?
- [ ] **SPRAWDŹ:** Czy ostatnie produkty są widoczne? (nie zakryte przez input bar)
- [ ] **SPRAWDŹ:** Czy header pozostaje na miejscu podczas scrollowania?

#### Test 3: Zamykanie klawiatury
- [ ] Zamknij klawiaturę (kliknij poza input lub przycisk "Done")
- [ ] **SPRAWDŹ:** Czy layout wraca do pierwotnego stanu płynnie?
- [ ] **SPRAWDŹ:** Czy nie ma "skakania" po zamknięciu?

#### Test 4: Drag & Drop
- [ ] Przeciągnij produkt w inne miejsce na liście
- [ ] **SPRAWDŹ:** Czy drag & drop działa poprawnie?
- [ ] Z otwartą klawiaturą, spróbuj przeciągnąć produkt
- [ ] **SPRAWDŹ:** Czy można scrollować listę podczas drag?

#### Test 5: Orientacja
- [ ] Obróć telefon do orientacji poziomej (landscape)
- [ ] **SPRAWDŹ:** Czy layout wygląda dobrze?
- [ ] Kliknij w input - sprawdź czy klawiatura nie powoduje problemów
- [ ] Wróć do orientacji pionowej (portrait)

#### Test 6: Notch/Safe Areas (iPhone X+)
- [ ] **SPRAWDŹ:** Czy header nie jest zasłonięty przez notch?
- [ ] **SPRAWDŹ:** Czy input bar ma odpowiedni padding-bottom dla home indicator?

---

### Platforma 2: Chrome Android
**Urządzenia:** Samsung, Pixel, lub inny Android (v108+)

#### Test 1-5: Powtórz wszystkie testy jak dla iOS
- [ ] Test 1: Stabilność layoutu z klawiaturą
- [ ] Test 2: Scrollowanie z klawiaturą
- [ ] Test 3: Zamykanie klawiatury
- [ ] Test 4: Drag & Drop
- [ ] Test 5: Orientacja

#### Test 6: Address Bar na Androidzie
- [ ] Scrolluj w dół - address bar przeglądarki powinien się schować
- [ ] **SPRAWDŹ:** Czy layout pozostaje stabilny gdy address bar się chowa?

---

### Platforma 3: Samsung Internet (opcjonalnie)
Jeśli masz dostęp do Samsung Galaxy:
- [ ] Test podstawowy: otwórz listę, kliknij input
- [ ] **SPRAWDŹ:** Czy stabilność layoutu jest OK?

---

### Platforma 4: Firefox Android (opcjonalnie)
- [ ] Test podstawowy: otwórz listę, kliknij input
- [ ] **SPRAWDŹ:** Czy stabilność layoutu jest OK?

---

## 🔧 Testowanie na Desktop (opcjonalnie)

### Chrome DevTools - Device Mode
⚠️ **Uwaga:** DevTools nie symuluje poprawnie zmian viewport z klawiaturą, ale można sprawdzić basic layout

- [ ] Otwórz Chrome DevTools (F12)
- [ ] Włącz Device Mode (Ctrl+Shift+M)
- [ ] Wybierz iPhone 12 Pro lub Pixel 5
- [ ] Otwórz listę produktów
- [ ] **SPRAWDŹ:** Czy layout wygląda dobrze w różnych rozmiarach ekranu

---

## 📊 Kryteria Akceptacji

### ✅ PASS - implementacja OK jeśli:
1. Layout **nie skacze** gdy klawiatura się pojawia/chowa
2. Header **pozostaje widoczny** na górze
3. Input bar **pozostaje na dole** (nad klawiaturą)
4. Ostatnie produkty **są widoczne** (nie zakryte przez input bar)
5. Scrollowanie **jest płynne** z otwartą klawiaturą
6. Drag & Drop **działa** poprawnie
7. Safe areas (notch, home indicator) **są respektowane**

### ❌ FAIL - wymaga poprawek jeśli:
1. Layout skacze gdy klawiatura się pojawia
2. Header znika lub jest zakryty
3. Input bar "płynie" w górę/dół ekranu
4. Ostatnie produkty są zakryte przez input bar
5. Nie można scrollować gdy klawiatura jest otwarta
6. Drag & Drop nie działa lub powoduje problemy z scrollem

---

## 🐛 Zgłaszanie problemów

Jeśli znajdziesz problem, zgłoś z następującymi informacjami:
- **Urządzenie:** Model telefonu (np. iPhone 13, Samsung S21)
- **System:** iOS/Android + wersja (np. iOS 16.4, Android 13)
- **Przeglądarka:** Nazwa + wersja (np. Safari, Chrome 120)
- **Problem:** Dokładny opis co się dzieje
- **Screenshot/wideo:** Jeśli możliwe

---

## 📸 Przykładowe Screenshoty do zrobienia

Jeśli możesz, zrób screenshoty:
1. Lista bez klawiatury (stan początkowy)
2. Lista Z klawiaturą (po kliknięciu w input)
3. Lista scrollowana na dół Z klawiaturą (czy ostatnie itemy widoczne?)
4. Orientacja pozioma

---

## ⏱️ Szacowany czas testowania
- Podstawowe testy (iOS + Android): **15-20 minut**
- Pełne testy (wszystkie platformy + edge cases): **30-40 minut**

---

## 🚀 Następne kroki po testach

Po pozytywnych testach:
1. [ ] Commit zmian
2. [ ] Push do repozytorium
3. [ ] Merge do głównej gałęzi
4. [ ] Deploy na production

Jeśli będą problemy:
1. [ ] Zgłoś problemy z szczegółami
2. [ ] Będę kontynuować fixes

---

**GOTOWE DO TESTÓW!** 🎯

Uruchom aplikację i przetestuj na rzeczywistych urządzeniach mobilnych.
