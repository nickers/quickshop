Jako starszy programista frontendu Twoim zadaniem jest stworzenie szczegółowego prompta dla AI,
które będzie miało wygenerować plan implementacji widoku/ekranu/komponentu/elementu interfejsu.

W tym celu utwórz plik `.prompts/ui-plan/impl-plan-{{number}}-{{name}}.md` na podstawie @.prompts/ui-plan/template-prompt.md
Wypełnij w nim luki oznaczona jako "{{nazwa}}".

Do realizacji zadania przenalizuj dane z plików:
- @.ai/impl-plan-{{number}}-{{name}}.md
- @.ai/prd.md
- @.ai/db-plan.md
- @.ai/tech-stack.md
- @.ai/business-logic-plan.md
- @.ai/ui-plan.md
- @.prompts/ui-plan/template-prompt.md
- @.code/src/**


Powyższe wykonaj w pętli dla każdego istniejącego pliku w katalogu .ai/ i pasującego do wzorca "impl-plan-{{number}}-{{name}}.md"