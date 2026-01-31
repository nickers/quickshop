import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { setsService } from "@/services/sets.service";
import type { CreateSetItemDTO, SetItem } from "@/types/domain.types";

function isNetworkError(error: unknown): boolean {
	const err = error as { status?: number; message?: string; name?: string };
	return (
		!err?.status &&
		(err?.message === "Failed to fetch" ||
			err?.name === "TypeError" ||
			!navigator.onLine)
	);
}

export function useSetDetails(setId: string) {
	const queryClient = useQueryClient();
	const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());

	const {
		data: set,
		isLoading: isSetLoading,
		error: setError,
	} = useQuery({
		queryKey: ["set", setId],
		queryFn: () => setsService.getSetById(setId),
		enabled: !!setId,
		networkMode: "offlineFirst",
	});

	const { data: items = [], isLoading: isItemsLoading } = useQuery({
		queryKey: ["set-items", setId],
		queryFn: () => setsService.getSetItems(setId),
		enabled: !!setId,
		networkMode: "offlineFirst",
	});

	const addItemMutation = useMutation({
		mutationKey: ["set-items", "create", setId],
		scope: { id: `set-${setId}` },
		mutationFn: (data: CreateSetItemDTO) => setsService.addSetItem(data),
		networkMode: "offlineFirst",
		onMutate: async (newItem) => {
			const optimisticId = crypto.randomUUID();
			await queryClient.cancelQueries({ queryKey: ["set-items", setId] });
			const previousItems = queryClient.getQueryData<SetItem[]>([
				"set-items",
				setId,
			]);

			const maxSort =
				(previousItems?.length ?? 0) > 0
					? Math.max(...(previousItems ?? []).map((i) => i.sort_order ?? 0)) + 1
					: 0;

			queryClient.setQueryData<SetItem[]>(["set-items", setId], (old) => {
				const optimisticItem: SetItem = {
					id: optimisticId,
					set_id: setId,
					name: newItem.name,
					quantity: newItem.quantity ?? null,
					note: newItem.note ?? null,
					sort_order: newItem.sort_order ?? maxSort,
					created_at: new Date().toISOString(),
					updated_at: new Date().toISOString(),
				};
				return old ? [...old, optimisticItem] : [optimisticItem];
			});

			setPendingIds((prev) => new Set(prev).add(optimisticId));
			return { previousItems, optimisticId };
		},
		onError: (err, _variables, context) => {
			if (context?.previousItems && !isNetworkError(err)) {
				queryClient.setQueryData(["set-items", setId], context.previousItems);
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
		mutationKey: ["set-items", "update", setId],
		scope: { id: `set-${setId}` },
		mutationFn: ({
			itemId,
			data,
		}: {
			itemId: string;
			data: Partial<CreateSetItemDTO>;
		}) => setsService.updateSetItem(itemId, data),
		networkMode: "offlineFirst",
		onMutate: async ({ itemId, data }) => {
			await queryClient.cancelQueries({ queryKey: ["set-items", setId] });
			const previousItems = queryClient.getQueryData<SetItem[]>([
				"set-items",
				setId,
			]);

			queryClient.setQueryData<SetItem[]>(["set-items", setId], (old) =>
				old?.map((item) => (item.id === itemId ? { ...item, ...data } : item)),
			);

			setPendingIds((prev) => new Set(prev).add(itemId));
			return { previousItems, itemId };
		},
		onError: (err, _variables, context) => {
			if (context?.previousItems && !isNetworkError(err)) {
				queryClient.setQueryData(["set-items", setId], context.previousItems);
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
		mutationKey: ["set-items", "delete", setId],
		scope: { id: `set-${setId}` },
		mutationFn: (itemId: string) => setsService.deleteSetItem(itemId),
		networkMode: "offlineFirst",
		onMutate: async (itemId) => {
			await queryClient.cancelQueries({ queryKey: ["set-items", setId] });
			const previousItems = queryClient.getQueryData<SetItem[]>([
				"set-items",
				setId,
			]);

			queryClient.setQueryData<SetItem[]>(["set-items", setId], (old) =>
				old?.filter((item) => item.id !== itemId),
			);

			setPendingIds((prev) => new Set(prev).add(itemId));
			return { previousItems, itemId };
		},
		onError: (err, _variables, context) => {
			if (context?.previousItems && !isNetworkError(err)) {
				queryClient.setQueryData(["set-items", setId], context.previousItems);
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

	const addItem = (name: string) => {
		const trimmed = name.trim();
		if (!trimmed) return;

		const currentItems = queryClient.getQueryData<SetItem[]>([
			"set-items",
			setId,
		]);
		const maxSort =
			(currentItems?.length ?? 0) > 0
				? Math.max(...(currentItems ?? []).map((i) => i.sort_order ?? 0)) + 1
				: 0;

		addItemMutation.mutate({
			set_id: setId,
			name: trimmed,
			sort_order: maxSort,
		});
	};

	const updateItem = (
		itemId: string,
		data: Partial<Pick<CreateSetItemDTO, "name" | "quantity" | "note">>,
	) => {
		updateItemMutation.mutate({ itemId, data });
	};

	const deleteItem = (itemId: string) => {
		deleteItemMutation.mutate(itemId);
	};

	const refetch = () => {
		queryClient.invalidateQueries({ queryKey: ["set", setId] });
		queryClient.invalidateQueries({ queryKey: ["set-items", setId] });
	};

	const renameSet = async (name: string) => {
		const trimmed = name.trim();
		if (!trimmed) return;
		await setsService.updateSet(setId, { name: trimmed });
		queryClient.invalidateQueries({ queryKey: ["set", setId] });
		queryClient.invalidateQueries({ queryKey: ["sets"] });
	};

	const deleteSet = async () => {
		await setsService.deleteSet(setId);
		queryClient.invalidateQueries({ queryKey: ["set", setId] });
		queryClient.invalidateQueries({ queryKey: ["set-items", setId] });
		queryClient.invalidateQueries({ queryKey: ["sets"] });
	};

	return {
		set: set ?? undefined,
		items,
		isLoading: isSetLoading || isItemsLoading,
		error: setError,
		addItem,
		updateItem,
		deleteItem,
		refetch,
		pendingIds,
		isSubmitting: addItemMutation.isPending || updateItemMutation.isPending,
		renameSet,
		deleteSet,
	};
}
