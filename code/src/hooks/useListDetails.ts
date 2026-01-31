import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { listItemsService } from "@/services/items.service";
import { listsService } from "@/services/lists.service";
import type {
	CreateListItemDTO,
	SingleItemConflictState,
} from "@/types/domain.types";

export function useListDetails(listId: string) {
	const queryClient = useQueryClient();
	const [conflictState, setConflictState] = useState<SingleItemConflictState>({
		isOpen: false,
	});

	// Fetch List Details
	const {
		data: list,
		isLoading: isListLoading,
		error: listError,
	} = useQuery({
		queryKey: ["list", listId],
		queryFn: () => listsService.getListById(listId),
	});

	// Fetch List Items
	const { data: items = [], isLoading: isItemsLoading } = useQuery({
		queryKey: ["list-items", listId],
		queryFn: () => listItemsService.getItemsByListId(listId),
	});

	// Derived state
	const activeItems = items.filter((item) => !item.is_bought);
	const completedItems = items.filter((item) => item.is_bought);

	// Mutations
	const createItemMutation = useMutation({
		mutationFn: (data: CreateListItemDTO) => listItemsService.createItem(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["list-items", listId] });
		},
	});

	const updateItemMutation = useMutation({
		mutationFn: listItemsService.updateItem,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["list-items", listId] });
		},
	});

	const deleteItemMutation = useMutation({
		mutationFn: listItemsService.deleteItem,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["list-items", listId] });
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
			list_id: listId,
			name: name,
			quantity: null, // Default
			is_bought: false,
		});
	};

	const resolveConflict = (combinedQuantity: string) => {
		if (!conflictState.conflictingItem) return;

		updateItemMutation.mutate({
			id: conflictState.conflictingItem.id,
			quantity: combinedQuantity,
		});

		setConflictState({ isOpen: false });
	};

	const handleToggleItem = (id: string, isCompleted: boolean) => {
		updateItemMutation.mutate({
			id,
			is_bought: isCompleted,
		});
	};

	const handleDeleteItem = (id: string) => {
		deleteItemMutation.mutate(id);
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
