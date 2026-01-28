Akceptuję proponowane zmiany:
- usuwamy azure app service i wykorzystamy vercel
- uproszczenie: Zamiast budować pełny silnik "Local-first", zastosujmy Optimistic UI (zakładamy sukces operacji) + Persist Cache (np. TanStack Query zapisujący stan w localStorage). To da wrażenie działania offline i szybkości, będąc łatwiejszym w implementacji niż pełna baza danych po stronie klienta (np. PouchDB/WatermelonDB).

Popraw proszę plik @.history/analiza.md