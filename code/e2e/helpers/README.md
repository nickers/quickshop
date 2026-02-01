# E2E Test Helpers

Reusable helper functions for Playwright E2E tests.

## Interaction Helpers

### `clickWhenReady(locator, options?)`

Waits for an element to be visible and then clicks it. Use this for all standard button and link interactions.

**Usage:**
```typescript
import { clickWhenReady } from "../helpers/interactions";

// Standard button click
await clickWhenReady(page.getByTestId("submit-btn"));

// With hover option (for special cases)
await clickWhenReady(page.getByTestId("button"), { hover: true });
```

**When to use:**
- Standard buttons, links, tabs
- Form submit buttons
- Any clickable element that doesn't require hover

---

### `clickDropdownTrigger(locator)`

Specialized helper for Radix UI dropdown menu triggers. Always hovers before clicking to ensure proper pointer events are triggered.

**Usage:**
```typescript
import { clickDropdownTrigger } from "../helpers/interactions";

// Open a dropdown menu
await clickDropdownTrigger(page.getByTestId("menu-button"));
```

**When to use:**
- **Always use for DropdownMenu triggers** (Radix UI/Shadcn components)
- Menu buttons in list items, cards, headers
- Any element that opens a dropdown menu

**Why hover is needed:**
Radix UI DropdownMenu components rely on proper pointer events (pointer enter, pointer move, pointer down, pointer up) to function correctly. A simple `click()` in Playwright doesn't simulate the full pointer event sequence that a real user with a mouse generates. Hovering before clicking ensures the component receives all necessary events.

---

### `debugElement(locator, label?)`

Debug helper that logs element state to console. Useful for troubleshooting test failures.

**Usage:**
```typescript
import { debugElement } from "../helpers/interactions";

// Debug any element
await debugElement(page.getByTestId("my-button"), "Submit Button");

// Output:
// 🔍 Debug [Submit Button]:
//   { exists: true, count: 1, visible: true, enabled: true }
//   Text: "Submit"
//   Attributes: { class: "btn-primary", disabled: false, ... }
```

**When to use:**
- Investigating why an element isn't clickable
- Debugging test failures in Page Objects
- Understanding element state during test execution

**Example in Page Object:**
```typescript
async expectListVisible(listName: string) {
  try {
    await this.page.getByTestId("lists-grid").waitFor({ state: "visible" });
  } catch (error) {
    // Debug what went wrong
    await debugElement(this.page.getByTestId("lists-grid"), "lists-grid");
    throw error;
  }
}
```

---

## Best Practices

1. **Always use helpers instead of manual patterns:**
   ```typescript
   // ✅ GOOD
   await clickWhenReady(button);
   
   // ❌ BAD
   await button.waitFor({ state: "visible" });
   await button.click();
   ```

2. **Use the right helper for the job:**
   - `clickWhenReady()` - for standard interactions
   - `clickDropdownTrigger()` - for dropdown menus
   - `debugElement()` - for troubleshooting

3. **Import at the top of your file:**
   ```typescript
   import { clickWhenReady, clickDropdownTrigger, debugElement } from "../helpers/interactions";
   ```

4. **Consistency across Page Objects:**
   All Page Objects should use these helpers to maintain consistent behavior and reduce code duplication.

## Debugging Tests

When tests fail, the helpers provide additional debugging capabilities:

- `debugElement()` logs element state
- Screenshots are automatically captured on failure (configured in `playwright.config.ts`)
- Trace files are retained for failed tests
- Console errors are captured in test output
