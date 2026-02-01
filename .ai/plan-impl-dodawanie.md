# Plan szczegółowy implementacji: Sumowanie liczb całkowitych w suggestedQuantityForConflict

Na podstawie planu ogólnego (Sumowanie liczb całkowitych w suggestedQuantityForConflict).

---

## 1. Definicja „liczby całkowitej”

| Aspekt | Reguła | Uzasadnienie |
|--------|--------|--------------|
| **Trim** | Przed parsowaniem stosować `String.prototype.trim()`. | `" 2 "` i `"2"` traktowane tak samo; spacje w ilościach z UI nie psują sumy. |
| **Format** | Dopuszczalna tylko reprezentacja liczby całkowitej: opcjonalny znak `+`/`-`, cyfry (bez separatora tysięcy, bez kropki). | Prosta reguła; „1.5”, „1,2”, „2 000” nie są integerami → pozostaje `join("+")`. |
| **Zakres** | Po `parseInt(str, 10)` sprawdzać `Number.isSafeInteger(n)`. | Unikamy błędów precyzji (np. 9e15); typowe ilości (1–999) zawsze safe. |
| **Zero** | `"0"` jest liczbą całkowitą; `"0"` + `"0"` → `"0"`. | Spójne z arytmetyką. |
| **Liczby ujemne** | Dopuszczalne; `"-1"` + `"2"` → `"1"`. | PRD nie wyklucza; spójna matematyka. |
| **Pusty string po trim** | `""` (po trim) nie jest liczbą; traktowane jak brak (już obsłużone przez `isEmptyQuantity`). | Bez zmian. |

**Funkcja pomocnicza (nie eksportowana):**

- `parseIntegerOrNull(value: string | null): number | null`
  - Jeśli `value == null` lub po `trim` jest `""` → `null`.
  - W przeciwnym razie: `const trimmed = value.trim()`; `const n = parseInt(trimmed, 10)`; jeśli `Number.isNaN(n)` lub `!Number.isSafeInteger(n)` → `null`, w przeciwnym razie → `n`.
  - Uwaga: `parseInt("  ", 10)` → `NaN` → `null`; `parseInt("1.5", 10)` → `1` (parseInt ucina część ułamkową). Dla spójności z „tylko integer” zaleca się: jeśli `trimmed !== String(n)` (np. `"1.5"` → n=1, String(1)="1" ≠ "1.5"), zwracać `null`. Alternatywa: sprawdzać regex `/^-?\d+$/` na trimmed zamiast parseInt – unikamy „1.5” → 1. W planie: **regex `/^-?\d+$/` na trimmed**; jeśli match, `parseInt(trimmed, 10)` i `Number.isSafeInteger(n)` → n, inaczej `null`.

**Ostateczna definicja parsowania:**

- `parseIntegerOrNull(value: string | null): number | null`
  1. Jeśli `value == null` → `null`.
  2. `const trimmed = value.trim()`; jeśli `trimmed === ""` → `null`.
  3. Jeśli `!/^-?\d+$/.test(trimmed)` → `null` (tylko opcjonalny minus i cyfry).
  4. `const n = parseInt(trimmed, 10)`; jeśli `!Number.isSafeInteger(n)` → `null`, w przeciwnym razie → `n`.

---

## 2. Kroki implementacji w `code/src/lib/conflictUtils.ts`

### 2.1 Funkcja pomocnicza `parseIntegerOrNull`

- **Lokalizacja:** w pliku `conflictUtils.ts`, przed `suggestedQuantityForConflict`, nie eksportowana.
- **Sygnatura:** `function parseIntegerOrNull(value: string | null): number | null`.
- **Logika:** jak w §1 (null → null; trim; regex `^-?\d+$`; parseInt; isSafeInteger).
- **JSDoc:** krótki opis: „Parsuje string jako liczbę całkowitą (trim, opcjonalny minus, cyfry). Zwraca number lub null.”

### 2.2 Modyfikacja `suggestedQuantityForConflict`

- **Obecna logika (zachować kolejność):**
  1. Odfiltrować puste: `isEmptyQuantity` → `parts = [existing, new].filter(...)`.
  2. Jeśli `parts.length === 0` → zwróć `PLACEHOLDER_NO_QUANTITY`.
- **Dodana gałąź (po kroku 1, przed join):**
  3. Jeśli `parts.length === 2`:  
     `const a = parseIntegerOrNull(parts[0]); const b = parseIntegerOrNull(parts[1]);`  
     jeśli `a !== null && b !== null` → zwróć `String(a + b)`.
  4. W przeciwnym razie (jedna wartość lub któraś nie jest integerem): zwróć `parts.join("+")`.

- **Aktualizacja JSDoc:**  
  „Łączy ilości przy konflikcie. Gdy **obie** wartości są liczbami całkowitymi (trim, opcjonalny minus, safe integer), zwraca ich **sumę**; w przeciwnym razie łączy przez '+'. Wartość '—' traktowana jak brak. Gdy obie puste/null/'—' → '—'.”

---

## 3. Testy jednostkowe (`code/src/lib/conflictUtils.test.ts`)

### 3.1 Testy do zmiany (oczekiwany wynik)

| Opis testu | Obecne wywołanie | Obecny wynik | Nowy wynik |
|------------|------------------|--------------|------------|
| Oba wypełnione liczbami | `suggestedQuantityForConflict("1", "2")` | `"1+2"` | `"3"` |
| Opis testu w pliku | `it("joins both with '+' when both filled", …)` | `"1+2"` | Zmienić na: gdy obie to liczby całkowite, zwraca sumę → `"3"`. |

- **Konkretna zmiana w pliku:** test „joins both with '+' when both filled” zmienić na:  
  `expect(suggestedQuantityForConflict("1", "2")).toBe("3");`  
  oraz zmienić opis (np. „returns sum when both are integers”).

### 3.2 Nowe testy do dodania (w bloku `describe("suggestedQuantityForConflict")`)

| # | Opis | Wywołanie | Oczekiwany wynik |
|---|------|-----------|-------------------|
| 1 | Suma dwóch dodatnich | `("2", "3")` | `"5"` |
| 2 | Zero + liczba | `("0", "1")` | `"1"` |
| 3 | Zero + zero | `("0", "0")` | `"0"` |
| 4 | Liczba + zero | `("5", "0")` | `"5"` |
| 5 | Trim: spacje wokół | `(" 2 ", " 3 ")` | `"5"` |
| 6 | Jedna liczba, jedna nie-liczba (string) | `("2", "szt")` | `"2+szt"` |
| 7 | Jedna liczba, jedna nie-liczba (jednostka) | `("2", "500 g")` | `"2+500 g"` |
| 8 | Obie nie-liczba (zachowanie) | `("500 g", "1 l")` | `"500 g+1 l"` (bez zmiany) |
| 9 | Liczba dziesiętna nie jest integerem | `("1", "2.5")` | `"1+2.5"` |
| 10 | Leading zeros: traktowane jako integer | `("02", "03")` | `"5"` (parseInt("02")=2, parseInt("03")=3) |
| 11 | Ujemna + dodatnia | `("-1", "3")` | `"2"` |
| 12 | Safe integer: granica | `("9007199254740991", "1")` | `"9007199254740992"` (jeśli w zakresie safe; albo osobny test na „poza safe → join”) |

**Uwaga do #12:** `Number.MAX_SAFE_INTEGER` = 9007199254740991; 9007199254740991 + 1 = 9007199254740992 jest safe. Dla 9007199254740992 + 1 wynik nie jest safe → wtedy nie sumujemy, tylko join. Dodać test: obie wartości w zakresie safe → suma; jedna poza safe → join.

**Skrócona lista testów do dopisania:**

- returns sum for two positive integers
- returns sum when one is zero
- returns "0" when both are "0"
- trims whitespace before parsing integers
- joins with '+' when one value is not an integer (e.g. "2" + "szt")
- joins with '+' when one value has unit (e.g. "2" + "500 g")
- joins with '+' for two non-integer strings (unchanged)
- joins with '+' when decimal (e.g. "1" + "2.5")
- parses leading zeros as integers ("02" + "03" → "5")
- returns sum for negative and positive ("-1" + "3" → "2")
- (opcjonalnie) both safe integers at upper bound → sum; one above safe → join

### 3.3 Testy `computeSetConflicts` (aktualizacja oczekiwań)

- Test „returns conflicts with suggestedQuantity '1+2' when both have values” – zmienić oczekiwanie: `suggestedQuantity` ma być `"3"` zamiast `"1+2"`.
- Test „mix of conflicts and nonConflicting” – tam gdzie `suggestedQuantity` było `"1+2"`, zmienić na `"3"`.
- Dla konfliktu z ilościami nieliczbowymi (np. `"1 l"`) pozostawić `"1 l"` (jedna wartość) lub np. `"500 g"` + `"1 l"` → `"500 g+1 l"` – bez zmian.

---

## 4. Pozostałe pliki (opcjonalnie)

### 4.1 SetConflictResolutionDialog – opis dla użytkownika

- **Plik:** `code/src/components/list-details/SetConflictResolutionDialog.tsx`.
- **Obecny tekst:** DialogDescription: „Poniższe produkty już są na liście. Zaznacz te, dla których chcesz zsumować ilości…”
- **Opcjonalna zmiana:** Dodać zdanie: „Sugerowana ilość to suma, gdy obie wartości są liczbami; w przeciwnym razie łączenie wpisów.” Można to umieścić w DialogDescription lub jako tooltip przy „Zaktualizuj ilość”. **Priorytet: niski** – można pominąć w pierwszej iteracji.

### 4.2 Brak zmian

- `useListDetails.ts`, `AddSetToListDialog.tsx`, `ItemConflictDialog.tsx`, serwisy, typy – bez zmian.
- Eksporty z `conflictUtils.ts` – bez zmian (eksportowana tylko `suggestedQuantityForConflict` i jak dotąd; `parseIntegerOrNull` wewnętrzna).

### 4.3 Dokumentacja (README.md, PRD.md)

**Obecny plan nie zawiera** obowiązkowej aktualizacji README ani PRD. Zmiana jest wewnętrzną ulepszeniem logiki „zsumowania ilości” (US-010, US-014) bez zmiany kontraktu API ani zachowania z punktu widzenia użytkownika końcowego (wciąż: konflikt → sugestia ilości → zatwierdzenie).

- **README.md:** Opcjonalnie – jeśli w README jest opis funkcji „duplikaty / konflikty zestawów” lub „sugerowana ilość”, można dodać zdanie: przy konflikcie ilości, gdy obie wartości są liczbami całkowitymi, sugestia to ich suma; w przeciwnym razie łączenie przez „+”. **Priorytet: niski.**
- **PRD.md:** Nie wymaga zmiany – US-010 i US-014 już mówią o „zsumowaniu”/„zwiększeniu ilości”; implementacja je realizuje. Opcjonalnie w sekcji wymagań lub notatkach można dodać doprecyzowanie: „Dla ilości będących liczbami całkowitymi sugestia to suma arytmetyczna.” **Priorytet: bardzo niski.**

Jeśli chcesz, aby aktualizacja README i/lub PRD była **obowiązkowym** elementem planu, dopisz w kolejności wykonania (§5) kroki np.: „9. Zaktualizować README.md (sekcja X): …” oraz „10. Opcjonalnie: doprecyzowanie w PRD.md (US-010/US-014): …”.

---

## 5. Kolejność wykonania

1. Dodać `parseIntegerOrNull` w `conflictUtils.ts` (z testami jednostkowymi opcjonalnie – można testować przez `suggestedQuantityForConflict`).
2. Zmodyfikować `suggestedQuantityForConflict` zgodnie z §2.2.
3. Zaktualizować JSDoc przy `suggestedQuantityForConflict`.
4. W `conflictUtils.test.ts`: zmienić test „joins both with '+' when both filled” na „returns sum when both are integers” z wynikiem `"3"`.
5. Dodać nowe testy z §3.2 (w bloku suggestedQuantityForConflict).
6. W testach `computeSetConflicts` zmienić oczekiwane `suggestedQuantity` z `"1+2"` na `"3"` tam, gdzie obie ilości to liczby całkowite.
7. Uruchomić `npm run test` i `npm run typecheck`.
8. (Opcjonalnie) Dodać krótką wzmiankę w SetConflictResolutionDialog zgodnie z §4.1.

---

## 6. Kryteria akceptacji

- [ ] Dla `("1", "2")` wynik to `"3"`.
- [ ] Dla `("500 g", "1 l")` wynik to `"500 g+1 l"` (bez zmiany).
- [ ] Dla `("1", "2.5")` wynik to `"1+2.5"`.
- [ ] Dla `(" 2 ", " 3 ")` wynik to `"5"`.
- [ ] Dla `("0", "0")` wynik to `"0"`.
- [ ] Wszystkie istniejące testy (po aktualizacji oczekiwań) przechodzą.
- [ ] Typecheck i lint bez błędów.
- [ ] SetConflictResolutionDialog bez zmian w zachowaniu (wyświetla i zapisuje `suggestedQuantity` jak dotąd).
