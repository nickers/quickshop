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
			console.log("[useListsView] 🔵 listsQuery START", "| Timestamp:", new Date().toISOString());
			const lists = await listsService.getAllLists();
			console.log("[useListsView] 📋 Fetched lists:", lists.length);

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
						console.error(`[useListsView] Failed to fetch items for list ${list.id}:`, error);
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

			console.log("[useListsView] ✅ listsQuery SUCCESS", "| Total lists:", listsWithCounts.length, "| Timestamp:", new Date().toISOString());
			return listsWithCounts;
		},
		staleTime: 30000, // 30 seconds
		enabled: !!currentUserId, // Only run query when we have a user ID
	});

	// Log lists state changes for debugging
	useEffect(() => {
		if (listsQuery.data) {
			console.log("[useListsView] 📊 Lists state changed", "| Count:", listsQuery.data.length, "| Lists:", listsQuery.data.map(l => l.name).join(", "), "| Timestamp:", new Date().toISOString());
		}
	}, [listsQuery.data]);

	// Mutation: Create new list
	const createListMutation = useMutation({
		mutationFn: (data: CreateListDTO) => {
			console.log("[useListsView] 🚀 createList mutationFn called", "| Name:", data.name, "| Timestamp:", new Date().toISOString());
			return listsService.createList(data);
		},
		onSuccess: async (data) => {
			console.log("[useListsView] ✅ createList onSuccess", "| ListId:", data.id, "| Name:", data.name, "| Timestamp:", new Date().toISOString());
			// Close dialog first (better UX - user sees immediate feedback)
			setIsCreateDialogOpen(false);
			// Force refetch to ensure new list is visible
			// Using refetchQueries instead of invalidateQueries to guarantee immediate refetch
			console.log("[useListsView] 🔄 Forcing refetch after create", "| Timestamp:", new Date().toISOString());
			await queryClient.refetchQueries({ queryKey: listQueryKeys.all });
			console.log("[useListsView] ✅ Refetch completed", "| Timestamp:", new Date().toISOString());
			// Optional: Navigate to the newly created list
			// navigate({ to: `/lists/${newList.id}` });
		},
		onError: (error) => {
			console.error("[useListsView] ❌ createList onError", "| Error:", error, "| Timestamp:", new Date().toISOString());
			// Error handling will be done in the component
		},
	});

	// Mutation: Delete list with optimistic updates
	const deleteListMutation = useMutation({
		mutationFn: (listId: string) => {
			console.log("[useListsView] 🚀 deleteList mutationFn called", "| ListId:", listId, "| Timestamp:", new Date().toISOString());
			return listsService.deleteList(listId);
		},
		onMutate: async (listId) => {
			console.log("[useListsView] ⏸️ deleteList onMutate", "| ListId:", listId, "| Timestamp:", new Date().toISOString());
			// Cancel any outgoing refetches
			await queryClient.cancelQueries({ queryKey: listQueryKeys.all });

			// Snapshot the previous value
			const previousLists = queryClient.getQueryData<ListViewModel[]>(
				listQueryKeys.all,
			);
			console.log("[useListsView] 📊 Previous lists count:", previousLists?.length ?? 0);

			// Optimistically update to remove the list
			queryClient.setQueryData<ListViewModel[]>(
				listQueryKeys.all,
				(old) => {
					const filtered = old?.filter((list) => list.id !== listId) ?? [];
					console.log("[useListsView] ✨ Optimistic delete applied", "| New count:", filtered.length);
					return filtered;
				},
			);

			// Return context with the snapshot
			return { previousLists };
		},
		onError: (error, _listId, context) => {
			console.error("[useListsView] ❌ deleteList onError", "| Error:", error, "| Timestamp:", new Date().toISOString());
			// Rollback on error
			if (context?.previousLists) {
				console.log("[useListsView] ⏪ Rollback to previous lists", "| Count:", context.previousLists.length);
				queryClient.setQueryData(listQueryKeys.all, context.previousLists);
			}
		},
		onSettled: () => {
			console.log("[useListsView] ✅ deleteList onSettled", "| Timestamp:", new Date().toISOString());
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
