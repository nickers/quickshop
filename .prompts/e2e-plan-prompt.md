Jako doświadczony programista, przygotuj się do dodania testów e2e do projektu.

1. Testy mają opierać się na playwright i mieć możliwość uruchomienia w przeglądarce.
2. Jakie paczki npm należy dodać do projektu?


<product_requirements>
@.ai/prd.md
</product_requirements>

<tech_stack>
@.ai/tech-stack.md
</tech_stack>

<baza_danych>
@.ai/db-plan.md
</baza_danych>

Przykład jak wczytać plik env:
```
// playwright.config.ts
import dotenv from 'dotenv';
dotenv.config({ path: path.resolve(process.cwd(), '.env.e2e.local') });
```

Przygotuj plan implementacji testów e2e, gdzie pierwszym testem będzie włączenie aplikacji na ekranie logowania (bez samego logowania, to zostanie wykonane w kolejnym teście).