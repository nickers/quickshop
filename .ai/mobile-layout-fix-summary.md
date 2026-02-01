# Mobile Layout Fix - List Details View

## Problem
Na urządzeniach mobilnych, gdy klawiatura się pojawia:
- Lista produktów była przesuwana w górę
- Pole dodawania produktu "skakało"
- Layout był niestabilny

## Przyczyna
- Użycie `min-h-screen` zamiast stałej wysokości viewportu
- Jednostka `vh` zmienia się dynamicznie gdy pojawia się klawiatura mobilna
- Brak spacera na dole scrollable area powodował zakrywanie ostatnich itemów
- `pb-20` na głównym kontenerze powodował dodatkowy layout shift

## Rozwiązanie

### 1. Meta Viewport (index.html)
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover, interactive-widget=resizes-visual" />
```
- `viewport-fit=cover` - obsługa notch/safe areas na iOS
- `interactive-widget=resizes-visual` - klawiatura zmienia tylko visual viewport (nie layout viewport)

### 2. CSS Utilities (styles.css)
Dodano nowe utility classes:
- `.h-screen-safe` - dynamic viewport height z fallbackiem
  - Fallback: `100vh` dla starszych przeglądarek
  - Nowoczesne: `100dvh` (dynamic viewport height)
  - iOS Safari: `100svh` (small viewport height)
- `.overscroll-none` - zapobiega bounce effect
- `.touch-manipulation` - zapobiega zoom na double-tap
- `.scroll-smooth-ios` - płynne scrollowanie z `-webkit-overflow-scrolling`

### 3. Struktura Layout (lists.$listId.tsx)

**Główny kontener:**
```tsx
<div className="flex flex-col h-screen-safe relative bg-background touch-manipulation">
```
Zmiany:
- `min-h-screen` → `h-screen-safe` (stała wysokość zamiast minimum)
- Usunięto `pb-20` (padding przeniesiony do spacera)
- Dodano `touch-manipulation` (UX na mobile)

**Header:**
```tsx
<div className="flex-shrink-0">
  <ListDetailsHeader ... />
</div>
```
- Wrapper z `flex-shrink-0` zapewnia stałą wysokość

**Scrollable Area:**
```tsx
<div className="flex-1 overflow-y-auto min-h-0 overscroll-none scroll-smooth-ios">
  <ActiveItemsList ... />
  <CompletedItemsSection ... />
  <div className="h-24" aria-hidden="true" /> {/* Spacer */}
</div>
```
Zmiany:
- Dodano `min-h-0` (kluczowe dla flexbox shrink)
- Dodano `overscroll-none` (zapobiega bounce)
- Dodano `scroll-smooth-ios` (płynne scrollowanie)
- Spacer `h-24` (96px) na dole - zapobiega zakrywaniu ostatnich itemów przez sticky bar

**Input Bar:**
```tsx
<div className="flex-shrink-0">
  <StickyInputBar ... />
</div>
```
- Wrapper z `flex-shrink-0` zapewnia stałą wysokość
- Pozostaje sticky, ale jako rodzeństwo scrollable area (nie dziecko)

### 4. ListDetailsHeader Cleanup
Usunięto `sticky top-0` z headera - jest zbędne gdy element jest poza scrollable container.

## Zmienione pliki
- `index.html` - meta viewport z mobile optimizations
- `src/styles.css` - nowe CSS utilities dla mobile viewport
- `src/routes/lists.$listId.tsx` - refaktoryzacja struktury layoutu
- `src/components/list-details/ListDetailsHeader.tsx` - usunięcie zbędnego sticky

## Wsparcie przeglądarek

### Dynamic Viewport Height (dvh)
- ✅ Safari 15.4+ (iOS 15.4+, marzec 2022)
- ✅ Chrome 108+ (listopad 2022)
- ✅ Firefox 110+ (luty 2023)
- ✅ Fallback na `100vh` dla starszych przeglądarek

### Interactive Widget
- ✅ Chrome 108+ (Android)
- ✅ Safari 15.4+ (iOS)

## Testowanie

### Scenariusze testowe (manualne na urządzeniach):
1. ✅ Otwórz listę z 10+ produktami
2. ✅ Kliknij w pole "Dodaj produkt"
   - Sprawdź czy klawiatura nie powoduje skakania layoutu
3. ✅ Podczas gdy klawiatura jest otwarta:
   - Scrolluj listę - powinna się płynnie przewijać
   - Header powinien pozostać na miejscu (widoczny)
   - Input bar powinien pozostać na dole
   - Ostatnie produkty powinny być widoczne (nie zakryte przez input)
4. ✅ Zamknij klawiaturę
   - Layout powinien pozostać stabilny (bez skakania)
5. ✅ Testuj drag-and-drop produktów
   - Upewnij się że działa z nowym layoutem
6. ✅ Testuj orientację poziomą (landscape)
7. ✅ Testuj na urządzeniach z notch (iPhone X+)
   - Sprawdź safe areas

### Platformy do przetestowania:
- iOS Safari (15.4+)
- Chrome Android
- Samsung Internet
- Firefox Android

### Testy E2E (Playwright):
```bash
npm run test:e2e
```
Istniejące testy powinny przechodzić bez zmian.

## Kluczowe decyzje techniczne

### Dlaczego `dvh` zamiast `vh`?
- `vh` (viewport height) = pełna wysokość ekranu **bez** klawiatury
- `dvh` (dynamic vh) = zmienia się dynamicznie gdy klawiatura się pojawia
- Na mobile z klawiaturą: `dvh` jest mniejszy niż `vh`
- `interactive-widget=resizes-visual` sprawia że klawiatura nie zmienia layout viewport

### Dlaczego spacer zamiast padding na kontenerze?
- Padding na głównym kontenerze (`pb-20`) powoduje że cały kontener jest wyższy
- Spacer wewnątrz scrollable area pozwala na scrollowanie i widoczność ostatnich itemów
- Spacer 96px (h-24) > wysokość input bar (~80px) = bezpieczny margines

### Dlaczego `min-h-0` na scrollable area?
- Flexbox domyślnie nie pozwala elementom kurczyć się poniżej ich minimalnej zawartości
- `min-height: 0` explicit mówi flexbox "możesz skurczyć ten element"
- Bez tego, scrollowanie może nie działać poprawnie

### Dlaczego usunięto `sticky` z headera?
- `position: sticky` działa tylko w scrollable container
- Header jest **poza** scrollable area, więc sticky nie ma efektu
- Header jest naturalnie "sticky" bo jest w non-scrollable flex-shrink-0 wrapper

## Znane ograniczenia
- Wymaga przeglądarek wspierających `dvh` dla optymalnego działania
- Na bardzo starych urządzeniach (iOS < 15.4) będzie fallback na `vh` (może występować lekkie skakanie)
- Drag-and-drop może być mniej wygodny gdy klawiatura jest otwarta (to jest akceptowalne UX trade-off)

## Potencjalne przyszłe ulepszenia
1. Dodać detekcję focus na input i opcjonalnie wyłączać drag-and-drop
2. Monitorować Cumulative Layout Shift (CLS) w production
3. Rozważyć użycie ResizeObserver API do dynamicznego dostosowania spacera

## Data implementacji
2026-02-01

## Status
✅ Zaimplementowane - czeka na testy manualne na urządzeniach mobilnych
