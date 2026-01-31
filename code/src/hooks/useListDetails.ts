import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import type { Database } from "@/db/database.types";
import { listItemsService } from "@/services/items.service";
import { listsService } from "@/services/lists.service";
import type {
	CreateListItemDTO,
	SingleItemConflictState,
	UpdateListItemDTO,
} from "@/types/domain.types";

type ListItem = Database["public"]["Tables"]["list_items"]["Row"];

export function useListDetails(listId: string) {
	const queryClient = useQueryClient();
	const [conflictState, setConflictState] = useState<SingleItemConflictState>({
		isOpen: false,
	});

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
			await queryClient.cancelQueries({ queryKey: ["list-items", listId] });
			const previousItems = queryClient.getQueryData<ListItem[]>([
				"list-items",
				listId,
			]);

			queryClient.setQueryData<ListItem[]>(["list-items", listId], (old) => {
				const optimisticItem: ListItem = {
					id: crypto.randomUUID(),
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

			return { previousItems };
		},
		onError: (err, _variables, context) => {
			// Only rollback if it's NOT a network error
			if (context?.previousItems && !isNetworkError(err)) {
				queryClient.setQueryData(["list-items", listId], context.previousItems);
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

			return { previousItems };
		},
		onError: (err, _variables, context) => {
			if (context?.previousItems && !isNetworkError(err)) {
				queryClient.setQueryData(["list-items", listId], context.previousItems);
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

			return { previousItems };
		},
		onError: (err, _variables, context) => {
			if (context?.previousItems && !isNetworkError(err)) {
				queryClient.setQueryData(["list-items", listId], context.previousItems);
			}
		},
	});

	// Handlers
	const handleAddItem = async (name: string) => {
		// Check for duplicates (case-insensitive) in active items
		const existingItem = items.find(
			(item) =>
				item.name.toLowerCase() === name.toLowerCase() && !item.is_bought,
		);

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

	return {
		list,
		activeItems,
		completedItems,
		isLoading: isListLoading || isItemsLoading,
		error: listError,
		addItem: handleAddItem,
		toggleItem: handleToggleItem,
		deleteItem: handleDeleteItem,
		conflictState,
		resolveConflict,
		cancelConflict: () => setConflictState({ isOpen: false }),
		isSubmitting: createItemMutation.isPending || updateItemMutation.isPending,
	};
}
