import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";
import type { Database } from "@/db/database.types";
import { historyQueryKeys } from "@/hooks/useHistory";
import { listQueryKeys } from "@/hooks/useListsView";
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
		queryFn: () => listsService.getListById(listId),
		networkMode: "offlineFirst",
	});

	// Fetch List Items
	const { data: items = [], isLoading: isItemsLoading } = useQuery({
		queryKey: ["list-items", listId],
		queryFn: () => listItemsService.getItemsByListId(listId),
		networkMode: "offlineFirst",
	});

	// Derived state
	const activeItems = items.filter((item) => !item.is_bought);
	const completedItems = items.filter((item) => item.is_bought);

	// Mutations
	const createItemMutation = useMutation({
		mutationKey: ["list-items", "create", listId],
		// Add scope to ensure mutations for this list run sequentially
		scope: { id: `list-${listId}` },
		mutationFn: ({ data }: { type: "create"; data: CreateListItemDTO }) =>
			listItemsService.createItem(data),
		networkMode: "offlineFirst",
		onMutate: async (variables) => {
			const newItem = variables.data;
			const optimisticId = crypto.randomUUID();
			await queryClient.cancelQueries({ queryKey: ["list-items", listId] });
			const previousItems = queryClient.getQueryData<ListItem[]>([
				"list-items",
				listId,
			]);

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
				return old ? [...old, optimisticItem] : [optimisticItem];
			});

			setPendingIds((prev) => new Set(prev).add(optimisticId));
			return { previousItems, optimisticId };
		},
		onError: (err, _variables, context) => {
			setLastMutationError(err instanceof Error ? err : new Error(String(err)));
			if (context?.previousItems && !isNetworkError(err)) {
				queryClient.setQueryData(["list-items", listId], context.previousItems);
			}
		},
		onSettled: (_data, _error, _variables, context) => {
			if (context?.optimisticId) {
				setPendingIds((prev) => {
					const next = new Set(prev);
					next.delete(context.optimisticId);
					return next;
				});
			}
		},
	});

	const updateItemMutation = useMutation({
		mutationKey: ["list-items", "update", listId],
		// Add scope to ensure mutations for this list run sequentially
		scope: { id: `list-${listId}` },
		mutationFn: ({ data }: { type: "update"; data: UpdateListItemDTO }) =>
			listItemsService.updateItem(data),
		networkMode: "offlineFirst",
		onMutate: async (variables) => {
			const updatedItem = variables.data;
			await queryClient.cancelQueries({ queryKey: ["list-items", listId] });
			const previousItems = queryClient.getQueryData<ListItem[]>([
				"list-items",
				listId,
			]);

			queryClient.setQueryData<ListItem[]>(["list-items", listId], (old) => {
				return old?.map((item) =>
					item.id === updatedItem.id ? { ...item, ...updatedItem } : item,
				);
			});

			setPendingIds((prev) => new Set(prev).add(updatedItem.id));
			return { previousItems, itemId: updatedItem.id };
		},
		onError: (err, _variables, context) => {
			setLastMutationError(err instanceof Error ? err : new Error(String(err)));
			if (context?.previousItems && !isNetworkError(err)) {
				queryClient.setQueryData(["list-items", listId], context.previousItems);
			}
		},
		onSettled: (_data, _error, _variables, context) => {
			if (context?.itemId) {
				setPendingIds((prev) => {
					const next = new Set(prev);
					next.delete(context.itemId);
					return next;
				});
			}
		},
	});

	const deleteItemMutation = useMutation({
		mutationKey: ["list-items", "delete", listId],
		// Add scope to ensure mutations for this list run sequentially
		scope: { id: `list-${listId}` },
		mutationFn: ({ itemId }: { type: "delete"; itemId: string }) =>
			listItemsService.deleteItem(itemId),
		networkMode: "offlineFirst",
		onMutate: async (variables) => {
			const itemId = variables.itemId;
			await queryClient.cancelQueries({ queryKey: ["list-items", listId] });
			const previousItems = queryClient.getQueryData<ListItem[]>([
				"list-items",
				listId,
			]);

			queryClient.setQueryData<ListItem[]>(["list-items", listId], (old) => {
				return old?.filter((item) => item.id !== itemId);
			});

			setPendingIds((prev) => new Set(prev).add(itemId));
			return { previousItems, itemId };
		},
		onError: (err, _variables, context) => {
			setLastMutationError(err instanceof Error ? err : new Error(String(err)));
			if (context?.previousItems && !isNetworkError(err)) {
				queryClient.setQueryData(["list-items", listId], context.previousItems);
			}
		},
		onSettled: (_data, _error, _variables, context) => {
			if (context?.itemId) {
				setPendingIds((prev) => {
					const next = new Set(prev);
					next.delete(context.itemId);
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
		setLastMutationError(null);
		queryClient.invalidateQueries({ queryKey: ["list-items", listId] });
		queryClient.invalidateQueries({ queryKey: ["list", listId] });
	}, [queryClient, listId]);

	// Handlers
	const handleAddItem = async (name: string) => {
		const existingItem = findDuplicateOnList(items, name);
		if (existingItem) {
			setConflictState({
				isOpen: true,
				conflictingItem: existingItem,
				pendingName: name,
			});
			return;
		}

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
			data: { quantity?: string | null; note?: string | null },
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
