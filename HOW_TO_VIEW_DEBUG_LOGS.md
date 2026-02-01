# How to View Debug Logs in E2E Tests

## Method 1: Browser Console (Headed Mode)

1. Run tests in headed mode:
   ```bash
   npx playwright test --headed
   ```

2. Open Browser DevTools:
   - When the browser opens, press F12 or right-click → Inspect
   - Go to the Console tab

3. Filter logs:
   ```
   [useListDetails]
   [useListsView]
   [ListItemsService]
   [ListsService]
   [MutationCache]
   [QueryClient]
   ```

4. Watch the logs stream as the test executes

## Method 2: Playwright Console Listener (Headless Mode)

Add this to your test file:

```typescript
test.beforeEach(async ({ page }) => {
  // Capture browser console logs
  page.on('console', msg => {
    const text = msg.text();
    // Only log our debug messages
    if (text.includes('[useListDetails]') || 
        text.includes('[useListsView]') || 
        text.includes('[ListItemsService]') ||
        text.includes('[ListsService]') ||
        text.includes('[MutationCache]') ||
        text.includes('[QueryClient]')) {
      console.log('BROWSER:', text);
    }
  });
});
```

Then run:
```bash
npx playwright test
```

The browser console logs will appear in your terminal.

## Method 3: Playwright Trace Viewer

1. Run tests with trace:
   ```bash
   npx playwright test --trace on
   ```

2. Open the trace:
   ```bash
   npx playwright show-trace test-results/[test-folder]/trace.zip
   ```

3. Click on "Console" tab to see all console logs

## Method 4: Using Page.evaluate() for Custom Logging

Add this to your test:

```typescript
test('debug specific action', async ({ page }) => {
  const listsPage = new ListsPage(page);
  await listsPage.goto();
  
  // Enable verbose logging
  await page.evaluate(() => {
    (window as any).__DEBUG_MODE__ = true;
  });
  
  await listsPage.clickNewList();
  
  // Wait a bit to see logs accumulate
  await page.waitForTimeout(1000);
  
  // Get all console messages
  const logs = await page.evaluate(() => {
    return (window as any).__CONSOLE_LOGS__ || [];
  });
  
  console.log('Captured logs:', logs);
});
```

## Recommended: Playwright Test with Console Output

Create a helper file `e2e/helpers/console-logger.ts`:

```typescript
import type { Page } from '@playwright/test';

export function setupConsoleLogger(page: Page, filter?: string[]) {
  page.on('console', msg => {
    const text = msg.text();
    
    // Filter logs if specified
    if (filter) {
      const shouldLog = filter.some(f => text.includes(f));
      if (!shouldLog) return;
    }
    
    // Color code by type
    const type = msg.type();
    const prefix = type === 'error' ? '❌' : 
                   type === 'warning' ? '⚠️' : 
                   type === 'info' ? 'ℹ️' : '📝';
    
    console.log(`${prefix} ${text}`);
  });
}
```

Then use it in your tests:

```typescript
import { setupConsoleLogger } from './helpers/console-logger';

test.beforeEach(async ({ page }) => {
  setupConsoleLogger(page, [
    '[useListDetails]',
    '[useListsView]',
    '[ListItemsService]',
    '[ListsService]',
    '[MutationCache]',
    '[QueryClient]',
  ]);
});

test('LIST-01: create new list', async ({ page }) => {
  const listsPage = new ListsPage(page);
  await listsPage.goto();
  await listsPage.clickNewList();
  const uniqueListName = `E2E Test ${formatTimestamp()}`;
  await listsPage.createList(uniqueListName);
  await listsPage.expectListVisible(uniqueListName);
  
  // Console logs will be automatically captured and displayed
});
```

## Debugging Timing Issues

When you see a test fail (e.g., list not visible):

1. **Check the log sequence** - Did all steps complete?
   ```
   [ListsService] 🔵 createList START
   [ListsService] ✅ createList SUCCESS
   [useListsView] ✅ createList onSuccess
   [MutationCache] 🔄 Invalidating queries
   [useListsView] 🔵 listsQuery START
   [ListsService] ✅ getAllLists SUCCESS
   [useListsView] 📊 Lists state changed
   ```

2. **Compare timestamps** - Are operations too fast?
   ```
   | Timestamp: 2026-02-01T21:45:30.123Z  <- Create
   | Timestamp: 2026-02-01T21:45:30.125Z  <- Query (2ms later!)
   ```
   
   If query happens too soon after create, database might not have committed yet.

3. **Look for missing logs** - Which step didn't happen?
   - Missing invalidation? Cache won't refresh
   - Missing query refetch? UI won't update
   - Missing mutation success? Optimistic update might revert

4. **Check error logs** - Any red flags?
   ```
   [ListsService] ❌ getAllLists ERROR | Error: {...}
   [useListsView] ⏪ Rollback to previous lists
   ```

## Quick Debug Commands

```bash
# Run single test with trace and headed
npx playwright test lists.spec.ts --headed --trace on

# Run with debug mode (pause on failure)
npx playwright test lists.spec.ts --debug

# Run and show report
npx playwright test && npx playwright show-report

# Run specific test line
npx playwright test lists.spec.ts:10
```

## Example: Complete Debug Session

```bash
# 1. Run test in headed mode to see browser
npx playwright test lists.spec.ts --headed

# 2. When test runs, open DevTools (F12)
# 3. Go to Console tab
# 4. Type filter: [Lists
# 5. Watch the log sequence
# 6. If test fails, check what step is missing
# 7. Compare timestamps to identify race conditions

# If need more detail:
npx playwright test lists.spec.ts --trace on
npx playwright show-trace test-results/.../trace.zip
# Click "Console" tab to review all logs
```

## Current Test Status

Note: The auth setup is currently failing. To use the logs:

1. Fix the auth issue first (separate from logging)
2. Once auth works, run tests as normal
3. Logs will automatically appear in console
4. Use the filtering techniques above to focus on specific issues

The logging infrastructure is now in place and will work once the tests can authenticate successfully.
