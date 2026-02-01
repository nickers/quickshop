# How to View Debug Logs in E2E Tests

## ✨ Automatic Console Logging (Recommended)

**All E2E tests now automatically capture browser console logs!**

Console logs from the browser are captured and displayed in your terminal during test execution. No additional setup needed.

### Running Tests with Console Logs

```bash
# Run all tests (logs appear in terminal)
npm run test:e2e

# Run with browser visible
npm run test:e2e:headed

# Stop on first failure (recommended for debugging)
npm run test:e2e:debug

# Run in UI mode
npm run test:e2e:ui
```

### What Gets Logged

By default, these log categories are captured:
- `[useListDetails]` - List details operations
- `[useListsView]` - Lists view operations
- `[ListItemsService]` - Database operations for items
- `[ListsService]` - Database operations for lists
- `[MutationCache]` - TanStack Query mutation lifecycle
- `[QueryClient]` - TanStack Query client operations

## Method 1: Default Automatic Logging

Simply run your tests - logs appear automatically:

```bash
npm run test:e2e
```

Console output will show:
```
📝 [LOG] [useListsView] 🔵 listsQuery START | Timestamp: 2026-02-01T...
📝 [LOG] [ListsService] 🔵 getAllLists START | Timestamp: 2026-02-01T...
📝 [LOG] [ListsService] ✅ getAllLists SUCCESS | Count: 3 | Lists: ...
```

## Method 2: Debug Mode (Stop on First Failure)

**NEW:** Run tests and stop immediately when one fails:

```bash
npm run test:e2e:debug
```

This is ideal for debugging because:
- ✅ Tests stop immediately after first failure (`--max-failures=1`)
- ✅ Browser stays open (headed mode)
- ✅ Console logs are visible in terminal
- ✅ You can inspect the browser state

You can also manually specify a different failure limit:

```bash
# Stop after 3 failures
npx playwright test --max-failures=3

# Stop on first failure
npx playwright test --max-failures=1
```

## Method 3: Custom Console Logging in Tests

If you need to capture logs for assertions or custom analysis:

```typescript
import { test } from "./fixtures";
import { collectConsoleLogs } from "./helpers/console-logger";

test("should log item creation", async ({ page }) => {
  const logs = collectConsoleLogs(page, ["[useListDetails]"]);
  
  await listPage.addItem("Milk");
  
  // Assert on captured logs
  expect(logs.some(log => log.includes("CREATE onMutate"))).toBeTruthy();
  expect(logs.some(log => log.includes("CREATE onSuccess"))).toBeTruthy();
});
```

## Method 4: Verbose Logging (Capture Everything)

For detailed debugging, capture ALL console messages:

```typescript
import { test } from "./fixtures";
import { setupConsoleLogger } from "./helpers/console-logger";

test("debug everything", async ({ page }) => {
  // Override default logger to capture all messages
  setupConsoleLogger(page, {
    captureAll: true,  // Capture all console messages
    verbose: true,     // Include debug messages
  });
  
  await listPage.goto();
  // All console.log, console.error, console.warn will be captured
});
```

## Method 5: Playwright Trace Viewer

1. Run tests with trace:
   ```bash
   npx playwright test --trace on
   ```

2. Open the trace:
   ```bash
   npx playwright show-trace test-results/[test-folder]/trace.zip
   ```

3. Click on "Console" tab to see all console logs

## Debugging Timing Issues

When you see a test fail (e.g., list not visible):

1. **Check the log sequence** in your terminal:
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

3. **Look for missing logs** - Which step didn't happen?

4. **Check error logs** - Any red flags?
   ```
   ❌ [ERROR] [ListsService] getAllLists ERROR | Error: {...}
   ```

## Log Emojis Legend

- 🔵 **START** - Operation starting
- ✅ **SUCCESS** - Operation completed
- ❌ **ERROR** - Operation failed
- ⏸️ **PAUSE** - Query cancellation
- ✨ **OPTIMISTIC** - Optimistic update applied
- 🔄 **INVALIDATE** - Query invalidation
- 🚀 **MUTATION** - Mutation executing
- 📊 **STATE** - State change detected

## Console Message Color Codes

Terminal output is color-coded:
- 🔴 **Red** - Errors
- 🟡 **Yellow** - Warnings
- 🔵 **Cyan** - Info messages
- ⚪ **White** - Regular logs

## Configuration

### Stop on First Failure

The test suite is configured to stop on first failure when using:
```bash
npm run test:e2e:debug
```

Or manually with:
```bash
npx playwright test --max-failures=1
```

### Customize Logged Categories

Edit `e2e/fixtures.ts` to change what gets logged:

```typescript
setupConsoleLogger(page, {
  categories: ["[useListDetails]", "[CustomCategory]"],
  captureAll: false,
  verbose: false,
});
```

## Quick Debug Commands

```bash
# Run all tests with console logs
npm run test:e2e

# Debug mode: stop on first failure, headed, with logs
npm run test:e2e:debug

# Run specific test file
npx playwright test lists.spec.ts

# Run specific test line
npx playwright test lists.spec.ts:10

# Run with UI mode (interactive)
npm run test:e2e:ui

# Show last test report
npx playwright show-report
```

## Example: Complete Debug Session

```bash
# 1. Run tests in debug mode (stops on first failure)
npm run test:e2e:debug

# 2. Terminal shows console logs from browser in real-time
# 3. Browser stays open on failure - inspect state
# 4. Check terminal for log sequence
# 5. Identify missing step or timing issue

# If need more detail:
npx playwright test --trace on
npx playwright show-trace test-results/.../trace.zip
```

## Troubleshooting

### Logs not appearing?

1. Check if you're using the correct import:
   ```typescript
   import { test } from "./fixtures";  // ✅ Correct
   import { test } from "@playwright/test";  // ❌ Won't have logging
   ```

2. Make sure console logs are being generated in the app (check browser DevTools when running headed mode)

3. Verify log categories match what's in your code

### Too many logs?

Reduce noise by filtering categories:
```typescript
setupConsoleLogger(page, {
  categories: ["[useListDetails]"],  // Only one category
});
```

### Want to see everything?

```typescript
setupConsoleLogger(page, {
  captureAll: true,
  verbose: true,
});
```

## Related Documentation

- `DEBUG_LOGS_GUIDE.md` - Detailed guide on log structure and flow
- `DEBUG_LOGGING_SUMMARY.md` - Implementation overview
- `e2e/helpers/console-logger.ts` - Console logging utility source code
