# Plan implementacji: Część 5 – Pulpit Zestawów

**Odniesienie:** ui-plan.md §2.4  
**Część:** 5 – Pulpit Zestawów

## Cel
Widok `/sets`: lista dostępnych zestawów (szablony), karty z przyciskiem "Dodaj do listy", Bottom Nav; wyróżnienie wizualne względem zwykłych list (np. inny kolor nagłówka).

## Zadania

### 1. Route i layout
- [ ] Trasa `/sets` już utworzona w części 1; `sets.index.tsx` – zastąpić placeholder.
- [ ] Pobieranie zestawów: `setsService.getAllSets()` (lub odpowiednik z hooka).

### 2. Hook useSetsView (lub odpowiednik)
- [ ] Hook w `src/hooks/useSetsView.ts`: getAllSets, isLoading, error, refetch.
- [ ] Opcjonalnie: prefetch w loaderze trasy.

### 3. Komponenty
- [ ] `SetsHeader`: tytuł "Zestawy", ewentualnie przycisk "Nowy zestaw" (jeśli w scope).
- [ ] `SetsGrid` / lista kart zestawów: nazwa zestawu, ewentualnie liczba produktów; na karcie przycisk "Dodaj do listy".
- [ ] "Dodaj do listy" → wybór listy (dropdown lub modal z listą aktywnych list) → dodanie pozycji zestawu do wybranej listy (z obsługą konfliktów – SetConflictResolutionDialog z części 8).

### 4. Wyróżnienie wizualne
- [ ] Nagłówek sekcji zestawów w innym kolorze (np. drugi kolor primary/muted) względem nagłówka list – zgodnie z ui-plan §2.4.

### 5. Bottom Nav
- [ ] Na `/sets` zakładka "Zestawy" aktywna.

### 6. Pusta lista
- [ ] Gdy brak zestawów: komunikat + ewentualnie "Utwórz pierwszy zestaw" (jeśli flow tworzenia zestawu jest w scope).

## Kryteria ukończenia
- Pulpit zestawów wyświetla karty zestawów z przyciskiem "Dodaj do listy".
- Wybór listy i dodanie zestawu do listy działa (z obsługą konfliktów gdy będzie ShareModal/ConflictResolution).
