import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import {
	MutationCache,
	onlineManager,
	QueryClient,
} from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { useEffect } from "react";
import { cfg } from "@/config";
import { listItemsService } from "@/services/items.service";
import type {
	CreateListItemDTO,
	UpdateListItemDTO,
} from "@/types/domain.types";

// Create persister using localStorage
const persister = createSyncStoragePersister({
	storage: window.localStorage,
	key: "quickshop-query-cache",
});

// Define mutation function type that can handle all mutation types
type MutationVariables =
	| { type: "create"; data: CreateListItemDTO }
	| { type: "update"; data: UpdateListItemDTO }
	| { type: "delete"; itemId: string };

export function getContext() {
	const queryClient = new QueryClient({
		defaultOptions: {
			queries: {
				// Keep data in cache for 24 hours
				gcTime: 1000 * 60 * 60 * 24,
				// Consider data stale after 5 minutes
				staleTime: 1000 * 60 * 5,
				// Use offline-first mode for all queries
				networkMode: "offlineFirst",
				// Retry failed queries
				retry: 3,
				retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
				// Don't refetch on window focus by default (to avoid overwriting optimistic updates)
				refetchOnWindowFocus: false,
				// Don't refetch on reconnect (to avoid overwriting optimistic updates)
				refetchOnReconnect: false,
			},
			mutations: {
				// Use offline-first mode for all mutations
				networkMode: "offlineFirst",
				// Retry failed mutations
				retry: 3,
				retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
			},
		},
		// Add global mutation cache callbacks
		mutationCache: new MutationCache({
			onMutate: (_variables, mutation) => {
				console.log(
					"[MutationCache] ⏰ Mutation starting (onMutate):",
					mutation.options.mutationKey,
					"| State:",
					mutation.state.status,
					"| Timestamp:",
					new Date().toISOString(),
				);
			},
			onSuccess: (_data, _variables, _context, mutation) => {
				console.log(
					"[MutationCache] ✅ Mutation succeeded:",
					mutation.options.mutationKey,
					"| State:",
					mutation.state.status,
				);
				// Invalidate queries after each successful mutation
				if (mutation.options.mutationKey?.[0] === "list-items") {
					const listId = mutation.options.mutationKey[2];
					if (listId) {
						console.log(
							"[MutationCache] 🔄 Invalidating queries for list:",
							listId,
							"| Timestamp:",
							new Date().toISOString(),
						);
						queryClient.invalidateQueries({ queryKey: ["list-items", listId] });
					}
				}
			},
			onError: (error, _variables, _context, mutation) => {
				console.error(
					"[MutationCache] ❌ Mutation failed:",
					mutation.options.mutationKey,
					"| Error:",
					error,
					"| State:",
					mutation.state.status,
				);
			},
			onSettled: (_data, _error, _variables, _context, mutation) => {
				console.log(
					"[MutationCache] 🏁 Mutation settled:",
					mutation.options.mutationKey,
					"| State:",
					mutation.state.status,
					"| HasError:",
					!!_error,
					"| Timestamp:",
					new Date().toISOString(),
				);
			},
		}),
	});

	return {
		queryClient,
	};
}

export function Provider({
	children,
	queryClient,
}: {
	children: React.ReactNode;
	queryClient: QueryClient;
}) {
	// Set up online/offline detection with custom network check
	useEffect(() => {
		console.log("[QueryClient] Setting up custom online detection...");

		// Custom online check - try to reach Supabase (with anon key so we get 200, not 401)
		const checkOnlineStatus = async () => {
			if (!cfg.SUPABASE_URL || !cfg.SUPABASE_KEY) {
				// Fallback to navigator when config is missing (e.g. tests)
				return navigator.onLine;
			}
			try {
				// Try a lightweight HEAD request to Supabase (won't count as query)
				const controller = new AbortController();
				const timeoutId = setTimeout(() => controller.abort(), 3000);

				const response = await fetch(
					`${cfg.SUPABASE_URL}/rest/v1/`,
					{
						method: "HEAD",
						signal: controller.signal,
						cache: "no-store",
						headers: {
							apikey: cfg.SUPABASE_KEY,
							Authorization: `Bearer ${cfg.SUPABASE_KEY}`,
						},
					},
				);

				clearTimeout(timeoutId);
				// 2xx = online; 401 = reached server but auth issue (e.g. missing key) = still online
				const isOnline = response.ok || response.status === 401;
				console.log("[QueryClient] Network check result:", isOnline);
				return isOnline;
			} catch {
				console.log("[QueryClient] Network check failed - OFFLINE");
				return false;
			}
		};

		// Check online status immediately
		checkOnlineStatus().then((isOnline) => {
			onlineManager.setOnline(isOnline);
			console.log("[QueryClient] Initial online state:", isOnline);
		});

		// Set up event listener for online/offline detection
		const unsubscribe = onlineManager.setEventListener((setOnline) => {
			const handleOnline = async () => {
				console.log(
					"[QueryClient] Browser online event detected, verifying...",
				);
				const isReallyOnline = await checkOnlineStatus();
				setOnline(isReallyOnline);
			};

			const handleOffline = () => {
				console.log("[QueryClient] Browser went OFFLINE");
				setOnline(false);
			};

			window.addEventListener("online", handleOnline);
			window.addEventListener("offline", handleOffline);

			// Also check periodically when navigator says we're online but we might not be
			const intervalId = setInterval(async () => {
				if (navigator.onLine && !onlineManager.isOnline()) {
					// Navigator says online but we detected offline - recheck
					const isReallyOnline = await checkOnlineStatus();
					if (isReallyOnline) {
						console.log("[QueryClient] Network restored!");
						setOnline(true);
					}
				}
			}, 10000); // Check every 10 seconds

			return () => {
				window.removeEventListener("online", handleOnline);
				window.removeEventListener("offline", handleOffline);
				clearInterval(intervalId);
			};
		});

		return unsubscribe;
	}, []);

	// Set up mutation defaults BEFORE resuming paused mutations
	// This must be done in the Provider, not in getContext, so the function is available when mutations resume
	useEffect(() => {
		// Set mutation defaults with a global mutationFn
		// This is critical for offline-first - mutations can resume after page reload
		queryClient.setMutationDefaults(["list-items"], {
			networkMode: "offlineFirst",
			mutationFn: async (variables: MutationVariables) => {
				switch (variables.type) {
					case "create":
						return listItemsService.createItem(variables.data);
					case "update":
						return listItemsService.updateItem(variables.data);
					case "delete":
						return listItemsService.deleteItem(variables.itemId);
					default:
						throw new Error("Unknown mutation type");
				}
			},
		});
	}, [queryClient]);

	// Set up online event listener to resume paused mutations
	useEffect(() => {
		const handleOnline = () => {
			const pausedCount = queryClient.getMutationCache().getAll().filter(m => m.state.isPaused).length;
			console.log("[QueryClient] 🌐 Going online, resuming paused mutations...", "| Paused count:", pausedCount, "| Timestamp:", new Date().toISOString());
			// Resume paused mutations when coming back online.
			// Do NOT call invalidateQueries() here: it would refetch before all mutations
			// complete and overwrite cache with server data missing the last updates.
			// MutationCache.onSuccess already invalidates the specific list when each
			// mutation succeeds, so we get fresh data per list as each mutation finishes.
			queryClient.resumePausedMutations().then(() => {
				console.log("[QueryClient] ✅ All paused mutations resumed", "| Timestamp:", new Date().toISOString());
			});
		};

		window.addEventListener("online", handleOnline);
		return () => window.removeEventListener("online", handleOnline);
	}, [queryClient]);

	return (
		<PersistQueryClientProvider
			client={queryClient}
			persistOptions={{
				persister,
				// Automatically persist mutations for offline support
				maxAge: 1000 * 60 * 60 * 24, // 24 hours
				// Dehydrate mutations to persist them
				dehydrateOptions: {
					shouldDehydrateMutation: () => true,
				},
			}}
			onSuccess={() => {
				const allMutations = queryClient.getMutationCache().getAll();
				const pausedCount = allMutations.filter(m => m.state.isPaused).length;
				console.log(
					"[QueryClient] 💾 Restored from localStorage, setting mutation defaults...",
					"| Total mutations:", allMutations.length,
					"| Paused:", pausedCount,
					"| Timestamp:", new Date().toISOString(),
				);
				// Set mutation defaults FIRST before resuming
				queryClient.setMutationDefaults(["list-items"], {
					networkMode: "offlineFirst",
					mutationFn: async (variables: MutationVariables) => {
						console.log("[QueryClient] 🚀 Executing mutation:", variables.type, "| Variables:", variables, "| Timestamp:", new Date().toISOString());
						switch (variables.type) {
							case "create":
								return listItemsService.createItem(variables.data);
							case "update":
								return listItemsService.updateItem(variables.data);
							case "delete":
								return listItemsService.deleteItem(variables.itemId);
							default:
								throw new Error("Unknown mutation type");
						}
					},
				});

				console.log("[QueryClient] ▶️ Resuming paused mutations after restore...", "| Timestamp:", new Date().toISOString());
				// Resume paused mutations after restore from localStorage.
				// This is critical - without this, offline mutations won't be retried after page reload.
				// Do NOT call invalidateQueries() here: same race as on reconnect (see handleOnline).
				queryClient.resumePausedMutations().then(() => {
					console.log("[QueryClient] ✅ All restored mutations resumed", "| Timestamp:", new Date().toISOString());
				});
			}}
		>
			{children}
		</PersistQueryClientProvider>
	);
}
