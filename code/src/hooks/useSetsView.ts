import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { setsService } from "@/services/sets.service";
import type { CreateSetDTO } from "@/types/domain.types";

export const setQueryKeys = {
	all: ["sets"] as const,
	detail: (id: string) => ["sets", id] as const,
	items: (setId: string) => ["sets", setId, "items"] as const,
};

/**
 * Hook for Sets Dashboard: fetches all sets, createSet mutation.
 */
export function useSetsView() {
	const queryClient = useQueryClient();

	const {
		data: sets = [],
		isLoading,
		error,
		refetch,
	} = useQuery({
		queryKey: setQueryKeys.all,
		queryFn: () => setsService.getAllSets(),
		networkMode: "offlineFirst",
	});

	const createSetMutation = useMutation({
		mutationFn: (data: CreateSetDTO) => setsService.createSet(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: setQueryKeys.all });
		},
	});

	return {
		sets,
		isLoading,
		error,
		refetch: () => refetch(),
		queryClient,
		createSet: createSetMutation.mutateAsync,
		isCreatingSet: createSetMutation.isPending,
	};
}
