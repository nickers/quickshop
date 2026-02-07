import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { Database } from "@/db/database.types";
import { historyQueryKeys } from "@/hooks/useHistory";
import { listQueryKeys } from "@/hooks/useListsView";
import { useRealtimeSubscription } from "@/hooks/useRealtimeSubscription";
import { findDuplicateOnList } from "@/lib/conflictUtils";
import { listItemsService } from "@/services/items.service";
import { listsService } from "@/services/lists.service";
import type {
	CreateListItemDTO,
	SingleItemConflictState,
	UpdateListItemDTO,
} from "@/types/domain.types";

type ListItem = Database["public"]["Tables"]["list_items"]["Row"];

export type SyncStatus = "synced" | "syncing" | "error";

export function useListDetails(listId: string) {
	const queryClient = useQueryClient();
	const [conflictState, setConflictState] = useState<SingleItemConflictState>({
		isOpen: false,
	});
	const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());
	const [lastMutationError, setLastMutationError] = useState<Error | null>(
		null,
	);
	const [isOnline, setIsOnline] = useState(
		typeof navigator !== "undefined" ? navigator.onLine : true,
	);

	useEffect(() => {
		const handleOnline = () => setIsOnline(true);
		const handleOffline = () => setIsOnline(false);
		window.addEventListener("online", handleOnline);
		window.addEventListener("offline", handleOffline);
		return () => {
			window.removeEventListener("online", handleOnline);
			window.removeEventListener("offline", handleOffline);
		};
	}, []);

	// Helper to check if error is a network error
	const isNetworkError = (error: unknown) => {
		// In many browsers, a failed fetch due to no network results in a TypeError
		// or an error that doesn't have a status code (like Supabase/PostgREST errors)
		const err = error as { status?: number; message?: string; name?: string };
		return (
			!err?.status &&
			(err?.message === "Failed to fetch" ||
				err?.name === "TypeError" ||
				!navigator.onLine)
		);
	};

	// Fetch List Details
	const {
		data: list,
		isLoading: isListLoading,
		error: listError,
	} = useQuery({
		queryKey: ["list", listId],
		queryFn: () => {
			console.log(
				"[useListDetails] 🔵 list query START",
				"| ListId:",
				listId,
				"| Timestamp:",
				new Date().toISOString(),
			);
			return listsService.getListById(listId);
		},
		networkMode: "offlineFirst",
		// List details are collaborative — always refetch from server on mount/navigation
		// so that changes made by other users are visible immediately after page refresh.
		staleTime: 0,
		refetchOnWindowFocus: true,
		refetchOnReconnect: true,
	});

	// Fetch List Items
	const { data: items = [], isLoading: isItemsLoading } = useQuery({
		queryKey: ["list-items", listId],
		queryFn: () => {
			console.log(
				"[useListDetails] 🔵 list-items query START",
				"| ListId:",
				listId,
				"| Timestamp:",
				new Date().toISOString(),
			);
			return listItemsService.getItemsByListId(listId);
		},
		networkMode: "offlineFirst",
		// List items are collaborative — always refetch from server on mount/navigation
		// so that changes made by other users are visible immediately after page refresh.
		staleTime: 0,
		refetchOnWindowFocus: true,
		refetchOnReconnect: true,
	});

	// Log items changes for debugging
	useEffect(() => {
		console.log(
			"[useListDetails] 📊 Items state changed",
			"| Count:",
			items.length,
			"| Items:",
			items.map((i) => i.name).join(", "),
			"| Timestamp:",
			new Date().toISOString(),
		);
	}, [items]);

	// Derived state
	const activeItems = items.filter((item) => !item.is_bought);
	const completedItems = items.filter((item) => item.is_bought);

	// Mutations
	const createItemMutation = useMutation({
		mutationKey: ["list-items", "create", listId],
		// Add scope to ensure mutations for this list run sequentially
		scope: { id: `list-${listId}` },
		mutationFn: ({ data }: { type: "create"; data: CreateListItemDTO }) => {
			console.log(
				"[useListDetails] 🚀 CREATE mutationFn called",
				"| Item:",
				data.name,
				"| ListId:",
				listId,
				"| Timestamp:",
				new Date().toISOString(),
			);
			return listItemsService.createItem(data);
		},
		networkMode: "offlineFirst",
		onMutate: async (variables) => {
			const newItem = variables.data;
			const optimisticId = crypto.randomUUID();
			console.log(
				"[useListDetails] ⏸️ CREATE onMutate - pausing queries",
				"| OptimisticId:",
				optimisticId,
				"| Item:",
				newItem.name,
				"| Timestamp:",
				new Date().toISOString(),
			);

			await queryClient.cancelQueries({ queryKey: ["list-items", listId] });
			const previousItems = queryClient.getQueryData<ListItem[]>([
				"list-items",
				listId,
			]);
			console.log(
				"[useListDetails] 📊 Previous items count:",
				previousItems?.length ?? 0,
			);

			queryClient.setQueryData<ListItem[]>(["list-items", listId], (old) => {
				const optimisticItem: ListItem = {
					id: optimisticId,
					list_id: listId,
					name: newItem.name,
					quantity: newItem.quantity ?? null,
					is_bought: newItem.is_bought ?? false,
					note: newItem.note ?? null,
					sort_order: newItem.sort_order ?? 0,
					created_at: new Date().toISOString(),
					updated_at: new Date().toISOString(),
				};
				const newData = old ? [...old, optimisticItem] : [optimisticItem];
				console.log(
					"[useListDetails] ✨ Optimistic update applied",
					"| New count:",
					newData.length,
				);
				return newData;
			});

			setPendingIds((prev) => new Set(prev).add(optimisticId));
			console.log(
				"[useListDetails] ⏳ Added to pendingIds",
				"| OptimisticId:",
				optimisticId,
			);
			return { previousItems, optimisticId };
		},
		onError: (err, _variables, context) => {
			console.error(
				"[useListDetails] ❌ CREATE onError",
				"| Error:",
				err,
				"| OptimisticId:",
				context?.optimisticId,
				"| Timestamp:",
				new Date().toISOString(),
			);
			setLastMutationError(err instanceof Error ? err : new Error(String(err)));
			if (context?.previousItems && !isNetworkError(err)) {
				console.log(
					"[useListDetails] ⏪ Rollback to previous items",
					"| Count:",
					context.previousItems.length,
				);
				queryClient.setQueryData(["list-items", listId], context.previousItems);
			}
		},
		onSettled: (_data, _error, _variables, context) => {
			console.log(
				"[useListDetails] ✅ CREATE onSettled",
				"| OptimisticId:",
				context?.optimisticId,
				"| Data:",
				_data ? "present" : "null",
				"| Error:",
				_error ? "present" : "null",
				"| Timestamp:",
				new Date().toISOString(),
			);
			if (context?.optimisticId) {
				setPendingIds((prev) => {
					const next = new Set(prev);
					next.delete(context.optimisticId);
					console.log(
						"[useListDetails] 🗑️ Removed from pendingIds",
						"| OptimisticId:",
						context.optimisticId,
						"| Remaining:",
						next.size,
					);
					return next;
				});
			}
		},
	});

	const updateItemMutation = useMutation({
		mutationKey: ["list-items", "update", listId],
		// Add scope to ensure mutations for this list run sequentially
		scope: { id: `list-${listId}` },
		mutationFn: ({ data }: { type: "update"; data: UpdateListItemDTO }) => {
			console.log(
				"[useListDetails] 🚀 UPDATE mutationFn called",
				"| ItemId:",
				data.id,
				"| Updates:",
				data,
				"| Timestamp:",
				new Date().toISOString(),
			);
			return listItemsService.updateItem(data);
		},
		networkMode: "offlineFirst",
		onMutate: async (variables) => {
			const updatedItem = variables.data;
			console.log(
				"[useListDetails] ⏸️ UPDATE onMutate - pausing queries",
				"| ItemId:",
				updatedItem.id,
				"| Timestamp:",
				new Date().toISOString(),
			);

			await queryClient.cancelQueries({ queryKey: ["list-items", listId] });
			const previousItems = queryClient.getQueryData<ListItem[]>([
				"list-items",
				listId,
			]);

			queryClient.setQueryData<ListItem[]>(["list-items", listId], (old) => {
				const updated = old?.map((item) =>
					item.id === updatedItem.id ? { ...item, ...updatedItem } : item,
				);
				console.log(
					"[useListDetails] ✨ Optimistic update applied",
					"| ItemId:",
					updatedItem.id,
					"| Count:",
					updated?.length ?? 0,
				);
				return updated;
			});

			setPendingIds((prev) => new Set(prev).add(updatedItem.id));
			console.log(
				"[useListDetails] ⏳ Added to pendingIds",
				"| ItemId:",
				updatedItem.id,
			);
			return { previousItems, itemId: updatedItem.id };
		},
		onError: (err, _variables, context) => {
			console.error(
				"[useListDetails] ❌ UPDATE onError",
				"| Error:",
				err,
				"| ItemId:",
				context?.itemId,
				"| Timestamp:",
				new Date().toISOString(),
			);
			setLastMutationError(err instanceof Error ? err : new Error(String(err)));
			if (context?.previousItems && !isNetworkError(err)) {
				console.log(
					"[useListDetails] ⏪ Rollback to previous items",
					"| Count:",
					context.previousItems.length,
				);
				queryClient.setQueryData(["list-items", listId], context.previousItems);
			}
		},
		onSettled: (_data, _error, _variables, context) => {
			console.log(
				"[useListDetails] ✅ UPDATE onSettled",
				"| ItemId:",
				context?.itemId,
				"| Data:",
				_data ? "present" : "null",
				"| Error:",
				_error ? "present" : "null",
				"| Timestamp:",
				new Date().toISOString(),
			);
			if (context?.itemId) {
				setPendingIds((prev) => {
					const next = new Set(prev);
					next.delete(context.itemId);
					console.log(
						"[useListDetails] 🗑️ Removed from pendingIds",
						"| ItemId:",
						context.itemId,
						"| Remaining:",
						next.size,
					);
					return next;
				});
			}
		},
	});

	const deleteItemMutation = useMutation({
		mutationKey: ["list-items", "delete", listId],
		// Add scope to ensure mutations for this list run sequentially
		scope: { id: `list-${listId}` },
		mutationFn: ({ itemId }: { type: "delete"; itemId: string }) => {
			console.log(
				"[useListDetails] 🚀 DELETE mutationFn called",
				"| ItemId:",
				itemId,
				"| Timestamp:",
				new Date().toISOString(),
			);
			return listItemsService.deleteItem(itemId);
		},
		networkMode: "offlineFirst",
		onMutate: async (variables) => {
			const itemId = variables.itemId;
			console.log(
				"[useListDetails] ⏸️ DELETE onMutate - pausing queries",
				"| ItemId:",
				itemId,
				"| Timestamp:",
				new Date().toISOString(),
			);

			await queryClient.cancelQueries({ queryKey: ["list-items", listId] });
			const previousItems = queryClient.getQueryData<ListItem[]>([
				"list-items",
				listId,
			]);

			queryClient.setQueryData<ListItem[]>(["list-items", listId], (old) => {
				const filtered = old?.filter((item) => item.id !== itemId);
				console.log(
					"[useListDetails] ✨ Optimistic delete applied",
					"| ItemId:",
					itemId,
					"| New count:",
					filtered?.length ?? 0,
				);
				return filtered;
			});

			setPendingIds((prev) => new Set(prev).add(itemId));
			console.log(
				"[useListDetails] ⏳ Added to pendingIds",
				"| ItemId:",
				itemId,
			);
			return { previousItems, itemId };
		},
		onError: (err, _variables, context) => {
			console.error(
				"[useListDetails] ❌ DELETE onError",
				"| Error:",
				err,
				"| ItemId:",
				context?.itemId,
				"| Timestamp:",
				new Date().toISOString(),
			);
			setLastMutationError(err instanceof Error ? err : new Error(String(err)));
			if (context?.previousItems && !isNetworkError(err)) {
				console.log(
					"[useListDetails] ⏪ Rollback to previous items",
					"| Count:",
					context.previousItems.length,
				);
				queryClient.setQueryData(["list-items", listId], context.previousItems);
			}
		},
		onSettled: (_data, _error, _variables, context) => {
			console.log(
				"[useListDetails] ✅ DELETE onSettled",
				"| ItemId:",
				context?.itemId,
				"| Data:",
				_data ? "present" : "null",
				"| Error:",
				_error ? "present" : "null",
				"| Timestamp:",
				new Date().toISOString(),
			);
			if (context?.itemId) {
				setPendingIds((prev) => {
					const next = new Set(prev);
					next.delete(context.itemId);
					console.log(
						"[useListDetails] 🗑️ Removed from pendingIds",
						"| ItemId:",
						context.itemId,
						"| Remaining:",
						next.size,
					);
					return next;
				});
			}
		},
	});

	const reorderItemsMutation = useMutation({
		mutationKey: ["list-items", "reorder", listId],
		scope: { id: `list-${listId}` },
		mutationFn: (orderedItems: ListItem[]) => {
			const payload = orderedItems.map((item, index) => ({
				id: item.id,
				sort_order: index,
			}));
			return listItemsService.reorderItems(payload);
		},
		networkMode: "offlineFirst",
		onMutate: async (orderedItems) => {
			await queryClient.cancelQueries({ queryKey: ["list-items", listId] });
			const previousItems = queryClient.getQueryData<ListItem[]>([
				"list-items",
				listId,
			]);
			// Reorder: active items get new order, completed stay at end with original relative order
			const completed = (previousItems ?? []).filter((i) => i.is_bought);
			const reorderedActive = orderedItems.map((item, index) => ({
				...item,
				sort_order: index,
			}));
			const completedWithOrder = completed.map((item, index) => ({
				...item,
				sort_order: orderedItems.length + index,
			}));
			queryClient.setQueryData<ListItem[]>(["list-items", listId], () => [
				...reorderedActive,
				...completedWithOrder,
			]);
			return { previousItems };
		},
		onError: (err, _variables, context) => {
			setLastMutationError(err instanceof Error ? err : new Error(String(err)));
			if (context?.previousItems && !isNetworkError(err)) {
				queryClient.setQueryData(["list-items", listId], context.previousItems);
			}
		},
	});

	const isAnyMutationPending =
		createItemMutation.isPending ||
		updateItemMutation.isPending ||
		deleteItemMutation.isPending ||
		reorderItemsMutation.isPending;

	const syncStatus: SyncStatus =
		lastMutationError && isOnline
			? "error"
			: !isOnline && (pendingIds.size > 0 || isAnyMutationPending)
				? "syncing"
				: isAnyMutationPending
					? "syncing"
					: "synced";

	const onSyncRetry = useCallback(() => {
		console.log(
			"[useListDetails] 🔄 onSyncRetry called",
			"| ListId:",
			listId,
			"| Timestamp:",
			new Date().toISOString(),
		);
		setLastMutationError(null);
		queryClient.invalidateQueries({ queryKey: ["list-items", listId] });
		queryClient.invalidateQueries({ queryKey: ["list", listId] });
	}, [queryClient, listId]);

	// Handlers
	const handleAddItem = async (name: string) => {
		console.log(
			"[useListDetails] 📝 handleAddItem called",
			"| Name:",
			name,
			"| Timestamp:",
			new Date().toISOString(),
		);
		const existingItem = findDuplicateOnList(items, name);
		if (existingItem) {
			console.log(
				"[useListDetails] ⚠️ Duplicate found, showing conflict dialog",
				"| Existing:",
				existingItem.name,
			);
			setConflictState({
				isOpen: true,
				conflictingItem: existingItem,
				pendingName: name,
			});
			return;
		}

		console.log(
			"[useListDetails] ➕ Creating new item mutation",
			"| Name:",
			name,
		);
		createItemMutation.mutate({
			type: "create",
			data: {
				list_id: listId,
				name: name,
				quantity: null, // Default
				is_bought: false,
			},
		});
	};

	const resolveConflict = (combinedQuantity: string) => {
		if (!conflictState.conflictingItem) return;

		updateItemMutation.mutate({
			type: "update",
			data: {
				id: conflictState.conflictingItem.id,
				quantity: combinedQuantity,
			},
		});

		setConflictState({ isOpen: false });
	};

	const handleToggleItem = (id: string, isCompleted: boolean) => {
		updateItemMutation.mutate({
			type: "update",
			data: {
				id,
				is_bought: isCompleted,
			},
		});
	};

	const handleDeleteItem = (id: string) => {
		deleteItemMutation.mutate({
			type: "delete",
			itemId: id,
		});
	};

	const updateItemFields = useCallback(
		(
			itemId: string,
			data: {
				name?: string;
				quantity?: string | null;
				note?: string | null;
			},
		) => {
			updateItemMutation.mutate({
				type: "update",
				data: { id: itemId, ...data },
			});
		},
		[updateItemMutation],
	);

	const handleReorderItems = (orderedActiveItems: ListItem[]) => {
		// Only reorder active items; completed items stay at end
		reorderItemsMutation.mutate(orderedActiveItems);
	};

	const archiveList = async () => {
		await listsService.completeShoppingTrip(listId);
		queryClient.invalidateQueries({ queryKey: ["list", listId] });
		queryClient.invalidateQueries({ queryKey: ["list-items", listId] });
		queryClient.invalidateQueries({ queryKey: listQueryKeys.all });
		queryClient.invalidateQueries({ queryKey: historyQueryKeys.all });
	};

	const renameList = async (newName: string) => {
		const trimmed = newName.trim();
		if (!trimmed) return;
		await listsService.updateList(listId, { name: trimmed });
		queryClient.invalidateQueries({ queryKey: ["list", listId] });
		queryClient.invalidateQueries({ queryKey: listQueryKeys.all });
	};

	// --- Realtime subscriptions ---
	// Subscribe to changes on list_items for this specific list and on the list itself.
	// When another user adds/edits/deletes items or renames the list, the cache is
	// automatically invalidated and TanStack Query refetches fresh data.
	const realtimeQueryKeys = useMemo(
		() => [["list-items", listId], ["list", listId], listQueryKeys.all],
		[listId],
	);

	const realtimeSubscriptions = useMemo(
		() => [
			{
				table: "list_items" as const,
				filter: `list_id=eq.${listId}`,
			},
			{
				table: "lists" as const,
				filter: `id=eq.${listId}`,
			},
		],
		[listId],
	);

	useRealtimeSubscription({
		channelName: `list-details-${listId}`,
		subscriptions: realtimeSubscriptions,
		queryKeys: realtimeQueryKeys,
		enabled: !!listId,
	});

	return {
		list,
		activeItems,
		completedItems,
		pendingIds,
		isLoading: isListLoading || isItemsLoading,
		error: listError,
		addItem: handleAddItem,
		toggleItem: handleToggleItem,
		deleteItem: handleDeleteItem,
		updateItemFields,
		conflictState,
		resolveConflict,
		cancelConflict: () => setConflictState({ isOpen: false }),
		isSubmitting: createItemMutation.isPending || updateItemMutation.isPending,
		archiveList,
		renameList,
		reorderItems: handleReorderItems,
		isReordering: reorderItemsMutation.isPending,
		syncStatus,
		syncError: lastMutationError,
		onSyncRetry,
	};
}
