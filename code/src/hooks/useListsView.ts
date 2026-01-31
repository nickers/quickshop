import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabaseClient } from "@/db/supabase.client";
import { listItemsService } from "@/services/items.service";
import { listsService } from "@/services/lists.service";
import type { CreateListDTO, ListViewModel } from "@/types/domain.types";

/**
 * Query keys for lists-related queries
 */
export const listQueryKeys = {
	all: ["lists"] as const,
	detail: (id: string) => ["lists", id] as const,
};

/**
 * Custom hook for managing Lists View state and operations.
 * Handles fetching, creating, and deleting shopping lists with TanStack Query.
 */
export function useListsView() {
	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
	const [currentUserId, setCurrentUserId] = useState<string | null>(null);
	const navigate = useNavigate();
	const queryClient = useQueryClient();

	// Fetch current user ID on mount
	useEffect(() => {
		const fetchUser = async () => {
			const {
				data: { user },
			} = await supabaseClient.auth.getUser();
			setCurrentUserId(user?.id ?? null);
		};
		fetchUser();
	}, []);

	// Query: Fetch all lists with item counts
	const listsQuery = useQuery({
		queryKey: listQueryKeys.all,
		queryFn: async (): Promise<ListViewModel[]> => {
			const lists = await listsService.getAllLists();

			// Fetch item counts for each list
			const listsWithCounts = await Promise.all(
				lists.map(async (list) => {
					try {
						const items = await listItemsService.getItemsByListId(list.id);
						return {
							...list,
							totalItems: items.length,
							boughtItems: items.filter((item) => item.is_bought).length,
							isShared: list.created_by !== currentUserId,
							ownerName: undefined, // TODO: Implement owner name fetching with join
						} as ListViewModel;
					} catch (error) {
						console.error(`Failed to fetch items for list ${list.id}:`, error);
						// Return list with zero counts if fetching items fails
						return {
							...list,
							totalItems: 0,
							boughtItems: 0,
							isShared: list.created_by !== currentUserId,
							ownerName: undefined,
						} as ListViewModel;
					}
				}),
			);

			return listsWithCounts;
		},
		staleTime: 30000, // 30 seconds
		enabled: !!currentUserId, // Only run query when we have a user ID
	});

	// Mutation: Create new list
	const createListMutation = useMutation({
		mutationFn: (data: CreateListDTO) => listsService.createList(data),
		onSuccess: () => {
			// Invalidate queries to refresh the list
			queryClient.invalidateQueries({ queryKey: listQueryKeys.all });
			// Close dialog
			setIsCreateDialogOpen(false);
			// Optional: Navigate to the newly created list
			// navigate({ to: `/lists/${newList.id}` });
		},
		onError: (error) => {
			console.error("Failed to create list:", error);
			// Error handling will be done in the component
		},
	});

	// Mutation: Delete list with optimistic updates
	const deleteListMutation = useMutation({
		mutationFn: (listId: string) => listsService.deleteList(listId),
		onMutate: async (listId) => {
			// Cancel any outgoing refetches
			await queryClient.cancelQueries({ queryKey: listQueryKeys.all });

			// Snapshot the previous value
			const previousLists = queryClient.getQueryData<ListViewModel[]>(
				listQueryKeys.all,
			);

			// Optimistically update to remove the list
			queryClient.setQueryData<ListViewModel[]>(
				listQueryKeys.all,
				(old) => old?.filter((list) => list.id !== listId) ?? [],
			);

			// Return context with the snapshot
			return { previousLists };
		},
		onError: (error, _listId, context) => {
			// Rollback on error
			if (context?.previousLists) {
				queryClient.setQueryData(listQueryKeys.all, context.previousLists);
			}
			console.error("Failed to delete list:", error);
		},
		onSettled: () => {
			// Refetch to sync with server
			queryClient.invalidateQueries({ queryKey: listQueryKeys.all });
		},
	});

	// Handlers
	const handleCreateList = async (data: CreateListDTO) => {
		await createListMutation.mutateAsync(data);
	};

	const handleDeleteList = async (listId: string) => {
		// Confirmation will be handled in the component
		await deleteListMutation.mutateAsync(listId);
	};

	const handleListClick = (listId: string) => {
		// Navigate to list details (future implementation)
		navigate({ to: `/lists/${listId}` });
	};

	return {
		// Data
		lists: listsQuery.data ?? [],
		isLoading: listsQuery.isLoading,
		error: listsQuery.error,
		currentUserId,

		// Dialog state
		isCreateDialogOpen,
		setIsCreateDialogOpen,

		// Handlers
		handleCreateList,
		handleDeleteList,
		handleListClick,

		// Loading states
		isCreating: createListMutation.isPending,
		isDeleting: deleteListMutation.isPending,

		// Refetch function
		refetch: listsQuery.refetch,
	};
}
