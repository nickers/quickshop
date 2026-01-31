# Offline-First Implementation - Problem i Rozwiązanie

## Opis Problemu

Aplikacja wymagała implementacji trybu offline-first z TanStack Query, aby użytkownicy mogli:
- Edytować listy zakupów bez połączenia internetowego
- Automatycznie synchronizować zmiany po powrocie online
- Zachować wszystkie modyfikacje po odświeżeniu strony

### Objawy:
1. **Utrata modyfikacji offline** - edycje wykonane bez internetu znikały
2. **Utrata jednej z dwóch modyfikacji** - przy wielu edycjach jedna była tracona
3. **Race conditions** - mutacje wykonywane równolegle zamiast sekwencyjnie
4. **Błędne wykrywanie stanu offline** - aplikacja myślała że jest online mimo rozłączonego WiFi
5. **Retry zamiast pause** - mutacje failowały z błędami CORS zamiast czekać na połączenie

## Zaimplementowane Rozwiązania

### 1. Persistence Layer
**Problem:** Brak persystencji cache i mutacji między sesjami.

**Rozwiązanie:**
```typescript
// root-provider.tsx
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";

const persister = createSyncStoragePersister({
  storage: window.localStorage,
  key: "quickshop-query-cache",
});

<PersistQueryClientProvider
  client={queryClient}
  persistOptions={{
    persister,
    maxAge: 1000 * 60 * 60 * 24, // 24 hours
    dehydrateOptions: {
      shouldDehydrateMutation: () => true,
    },
  }}
  onSuccess={() => {
    // Resume mutations after restore
    queryClient.resumePausedMutations();
  }}
>
```

### 2. Mutation Defaults z Serializowalnymi Zmiennymi
**Problem:** `mutationFn` nie może być serializowana do localStorage.

**Rozwiązanie:**
```typescript
// Zmienne mutacji jako proste obiekty (serializowalne)
type MutationVariables = 
  | { type: "create"; data: CreateListItemDTO }
  | { type: "update"; data: UpdateListItemDTO }
  | { type: "delete"; itemId: string };

// Globalna mutationFn w setMutationDefaults
queryClient.setMutationDefaults(["list-items"], {
  networkMode: "offlineFirst",
  mutationFn: async (variables: MutationVariables) => {
    switch (variables.type) {
      case "create": return listItemsService.createItem(variables.data);
      case "update": return listItemsService.updateItem(variables.data);
      case "delete": return listItemsService.deleteItem(variables.itemId);
    }
  },
});

// Wywołanie mutacji
updateItemMutation.mutate({
  type: "update",
  data: { id, is_bought: true }
});
```

### 3. Mutation Scope dla Sekwencyjnego Wykonania
**Problem:** Mutacje wykonywały się równolegle, powodując race conditions.

**Rozwiązanie:**
```typescript
// useListDetails.ts
const updateItemMutation = useMutation({
  mutationKey: ["list-items", "update", listId],
  scope: { id: `list-${listId}` }, // ← Kluczowe!
  mutationFn: ({ data }) => listItemsService.updateItem(data),
  networkMode: "offlineFirst",
});
```

**Efekt:** Wszystkie mutacje dla tej samej listy wykonują się **sekwencyjnie**, nie równolegle.

### 4. Globalny MutationCache dla Callbacks
**Problem:** Callbacks (`onSuccess`) nie były wywoływane dla wznowionych mutacji z localStorage.

**Rozwiązanie:**
```typescript
// root-provider.tsx
const queryClient = new QueryClient({
  mutationCache: new MutationCache({
    onSuccess: (_data, _variables, _context, mutation) => {
      // Wywoływane dla WSZYSTKICH mutacji, nawet wznowionych
      if (mutation.options.mutationKey?.[0] === "list-items") {
        const listId = mutation.options.mutationKey[2];
        queryClient.invalidateQueries({ queryKey: ["list-items", listId] });
      }
    },
  }),
});
```

### 5. Custom Network Detection
**Problem:** `navigator.onLine` nie wykrywa rzeczywistego braku połączenia (zwraca `true` gdy komputer ma WiFi, nawet bez internetu).

**Rozwiązanie:**
```typescript
// root-provider.tsx
const checkOnlineStatus = async () => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    
    const response = await fetch('https://syjwmkiflgnxauitdrez.supabase.co/rest/v1/', {
      method: 'HEAD',
      signal: controller.signal,
      cache: 'no-store',
    });
    
    clearTimeout(timeoutId);
    return response.ok;
  } catch {
    return false;
  }
};

// Sprawdź przy starcie
checkOnlineStatus().then(isOnline => {
  onlineManager.setOnline(isOnline);
});

// Okresowe sprawdzanie (co 10s) gdy navigator.onLine === true
setInterval(async () => {
  if (navigator.onLine && !onlineManager.isOnline()) {
    const isReallyOnline = await checkOnlineStatus();
    if (isReallyOnline) {
      onlineManager.setOnline(true);
    }
  }
}, 10000);
```

### 6. Konfiguracja QueryClient
```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60 * 24,        // 24h w cache
      staleTime: 1000 * 60 * 5,            // 5min świeżość
      networkMode: "offlineFirst",
      retry: 3,
      refetchOnWindowFocus: false,         // ← Ważne!
      refetchOnReconnect: false,           // ← Ważne!
    },
    mutations: {
      networkMode: "offlineFirst",
      retry: 3,
    },
  },
});
```

## Potencjalne Dalsze Problemy (≥75% prawdopodobieństwa)

### 1. Konflikt przy Równoczesnej Edycji z Wielu Urządzeń
**Prawdopodobieństwo:** 85%

**Opis:** Użytkownik edytuje tę samą listę na telefonie (offline) i komputerze (online). Po powrocie online na telefonie obie zmiany mogą się nadpisać.

**Możliwe rozwiązanie:**
- Optimistic locking z `updated_at` timestamp
- Conflict resolution UI dla użytkownika
- Last-write-wins strategy (obecna implementacja)

### 2. Przekroczenie Limitu localStorage
**Prawdopodobieństwo:** 75%

**Opis:** localStorage ma limit ~5-10MB. Przy dużej ilości list i itemów + persystowane mutacje mogą przekroczyć limit.

**Objawy:**
- `QuotaExceededError`
- Utrata całego cache
- Crash aplikacji

**Możliwe rozwiązanie:**
```typescript
const persister = createSyncStoragePersister({
  storage: window.localStorage,
  key: "quickshop-query-cache",
  serialize: (data) => {
    // Ogranicz rozmiar - usuń stare queries
    return JSON.stringify(data);
  },
});

// Lub użyj IndexedDB zamiast localStorage:
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { del, get, set } from 'idb-keyval';

const persister = createAsyncStoragePersister({
  storage: { getItem: get, setItem: set, removeItem: del },
});
```

### 3. Timeout przy Długim Okresie Offline
**Prawdopodobieństwo:** 80%

**Opis:** Użytkownik wykonuje edycje przez kilka godzin offline. Po powrocie online:
- Wiele mutacji do synchronizacji (może trwać minuty)
- Użytkownik może zamknąć aplikację podczas sync
- Część mutacji może nie zdążyć się wykonać

**Możliwe rozwiązanie:**
```typescript
// Zwiększ maxAge dla mutacji
persistOptions: {
  maxAge: 1000 * 60 * 60 * 24 * 7, // 7 dni zamiast 24h
}

// Dodaj progress indicator
queryClient.getMutationCache().subscribe((event) => {
  const pausedMutations = queryClient.getMutationCache()
    .getAll()
    .filter(m => m.state.isPaused);
  
  if (pausedMutations.length > 0) {
    showSyncIndicator(pausedMutations.length);
  }
});
```

### 4. Błędy Walidacji po Długim Offline
**Prawdopodobieństwo:** 75%

**Opis:** Między wykonaniem mutacji offline a synchronizacją mogły zmienić się:
- Reguły walidacji na serwerze
- RLS policies w Supabase
- Struktura bazy danych

**Możliwe rozwiązanie:**
```typescript
mutationCache: new MutationCache({
  onError: (error, _variables, _context, mutation) => {
    // Rozróżnij błędy walidacji od network errors
    if (error.message.includes('validation') || error.code === '23505') {
      // Pokaż użytkownikowi konflikt
      showConflictDialog(mutation);
      // Usuń problematyczną mutację
      queryClient.getMutationCache().remove(mutation);
    }
  },
}),
```

### 5. Stale Optimistic Updates w UI
**Prawdopodobieństwo:** 90%

**Opis:** Po długim okresie offline, optimistic updates mogą pozostać w UI nawet jeśli mutacje failują (np. item został usunięty przez kogoś innego).

**Możliwe rozwiązanie:**
```typescript
// W onError - bardziej agresywne rollbacki
onError: (err, _variables, context) => {
  if (context?.previousItems) {
    queryClient.setQueryData(["list-items", listId], context.previousItems);
  }
  // Wymuś refetch po błędzie
  queryClient.invalidateQueries({ queryKey: ["list-items", listId] });
},
```

## Scenariusze Testowe

### Test 1: Podstawowa Edycja Offline
**Kroki:**
1. Załaduj aplikację z internetem
2. Otwórz listę zakupów
3. Rozłącz WiFi
4. Poczekaj 3-5s (weryfikacja offline state)
5. Zaznacz 1 item jako kupiony
6. Sprawdź czy zmiana jest widoczna
7. Włącz WiFi
8. Poczekaj na synchronizację (automatyczna)
9. Sprawdź czy zmiana została zapisana na serwerze

**Oczekiwany rezultat:**
- ✅ Zmiana widoczna natychmiast offline
- ✅ Brak błędów CORS w konsoli
- ✅ Zmiana zsynchronizowana po powrocie online
- ✅ Konsola: `[QueryClient] Network check failed - OFFLINE`
- ✅ Konsola: `[MutationCache] Mutation succeeded`

### Test 2: Wiele Edycji Offline
**Kroki:**
1. Załaduj aplikację z internetem
2. Rozłącz WiFi
3. Poczekaj 3-5s
4. Zaznacz 3 różne itemy jako kupione (szybko, jeden po drugim)
5. Sprawdź czy wszystkie 3 są zaznaczone
6. Włącz WiFi
7. Poczekaj na synchronizację
8. Odśwież stronę (F5)
9. Sprawdź czy wszystkie 3 są nadal zaznaczone

**Oczekiwany rezultat:**
- ✅ Wszystkie 3 zmiany widoczne natychmiast
- ✅ Wszystkie 3 zsynchronizowane (nie tylko ostatnia)
- ✅ Konsola: 3x `[MutationCache] Mutation succeeded`
- ✅ Zmiany przetrwały odświeżenie strony

### Test 3: Offline z Odświeżeniem Strony
**Kroki:**
1. Załaduj aplikację z internetem
2. Rozłącz WiFi
3. Poczekaj 3-5s
4. Zaznacz 2 itemy jako kupione
5. **Odśwież stronę (F5)** - KLUCZOWY KROK
6. Sprawdź localStorage (DevTools → Application → Local Storage)
7. Włącz WiFi
8. Poczekaj 10-15s (mutacje się wznowią)
9. Sprawdź czy obie zmiany zostały zsynchronizowane

**Oczekiwany rezultat:**
- ✅ Po odświeżeniu mutacje są w localStorage
- ✅ Konsola: `[QueryClient] Restored from localStorage`
- ✅ Konsola: `[QueryClient] Resuming paused mutations`
- ✅ Po włączeniu WiFi obie zmiany zsynchronizowane
- ✅ Konsola: 2x `[MutationCache] Mutation succeeded`

### Test 4: Bardzo Długi Offline (Stress Test)
**Kroki:**
1. Załaduj aplikację z internetem
2. Rozłącz WiFi
3. Wykonaj 10-15 edycji (zaznacz/odznacz różne itemy)
4. Poczekaj 5 minut
5. Odśwież stronę
6. Poczekaj kolejne 5 minut
7. Włącz WiFi
8. Monitoruj konsolę - wszystkie mutacje powinny się wykonać sekwencyjnie

**Oczekiwany rezultat:**
- ✅ Wszystkie 10-15 zmian widocznych offline
- ✅ Mutacje przetrwały odświeżenie i 10 minut czasu
- ✅ Po włączeniu WiFi wszystkie mutacje wykonane sekwencyjnie
- ✅ Konsola: 10-15x `[MutationCache] Mutation succeeded`
- ✅ Brak błędów `QuotaExceededError`

### Test 5: Sprawdzenie Scope (Sekwencyjność)
**Kroki:**
1. Otwórz DevTools → Network → Throttling → Slow 3G
2. Zaznacz 5 itemów bardzo szybko (jeden po drugim)
3. W DevTools → Network obserwuj requesty do `/list_items`
4. Sprawdź czy requesty idą **jeden po drugim**, nie równolegle

**Oczekiwany rezultat:**
- ✅ Requesty wykonywane sekwencyjnie (jeden kończy się przed startem drugiego)
- ✅ Brak równoległych requestów do tego samego `list_items?id=eq.XXX`
- ✅ Konsola: Mutacje logowane po kolei, nie wszystkie naraz

### Test 6: Conflict Resolution
**Kroki:**
1. Otwórz aplikację na 2 urządzeniach/przeglądarkach (A i B)
2. Na urządzeniu A: rozłącz WiFi
3. Na urządzeniu A: zaznacz item jako kupiony
4. Na urządzeniu B (online): odznacz ten sam item
5. Na urządzeniu A: włącz WiFi
6. Sprawdź końcowy stan na obu urządzeniach po synchronizacji

**Oczekiwany rezultat:**
- ✅ Last-write-wins: zmiana z urządzenia A (późniejsza) powinna wygrać
- ✅ Oba urządzenia pokazują ten sam końcowy stan
- ⚠️ **ZNANY PROBLEM:** Możliwa utrata zmiany z urządzenia B

### Test 7: Network Detection Accuracy
**Kroki:**
1. Załaduj aplikację
2. Sprawdź konsolę: `[QueryClient] Initial online state: true`
3. Rozłącz WiFi
4. Sprawdź konsolę w ciągu 3-5s: `[QueryClient] Network check failed - OFFLINE`
5. Włącz WiFi
6. Sprawdź konsolę w ciągu 10s: `[QueryClient] Network check result: true`

**Oczekiwany rezultat:**
- ✅ Aplikacja wykrywa offline w ciągu 3-5s od rozłączenia WiFi
- ✅ Aplikacja wykrywa online w ciągu 10s od włączenia WiFi
- ✅ `onlineManager.isOnline()` odpowiada rzeczywistemu stanowi sieci

## Monitoring i Debugowanie

### Kluczowe Logi do Obserwacji:
```
[QueryClient] Initial online state: true/false
[QueryClient] Network check failed - OFFLINE
[QueryClient] Network check result: true
[QueryClient] Restored from localStorage
[QueryClient] Resuming paused mutations
[QueryClient] All restored mutations resumed
[MutationCache] Mutation succeeded: ["list-items", "update", "..."]
[MutationCache] Mutation failed: ["list-items", "update", "..."]
```

### Sprawdzanie Stanu w DevTools:
```javascript
// Console DevTools
queryClient.getMutationCache().getAll() // Wszystkie mutacje
  .filter(m => m.state.isPaused)        // Tylko pauzowane

// LocalStorage
localStorage.getItem('quickshop-query-cache') // Cache content
```

## Metryki Sukcesu
- ✅ 0 błędów CORS podczas offline
- ✅ 0 utraconych mutacji (wszystkie zsynchronizowane)
- ✅ < 5s wykrywanie offline po rozłączeniu WiFi
- ✅ < 10s wykrywanie online po włączeniu WiFi
- ✅ Mutacje przetrwają odświeżenie strony
- ✅ Sekwencyjna kolejność wykonania mutacji zachowana
