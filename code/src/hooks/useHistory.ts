import { useQuery } from "@tanstack/react-query";
import { historyService } from "@/services/history.service";
import type { HistoryEntry } from "@/types/domain.types";

export const historyQueryKeys = {
	all: ["history"] as const,
};

/**
 * Hook for History view: fetches completed shopping trips (read-only).
 */
export function useHistory() {
	const {
		data: entries = [],
		isLoading,
		error,
		refetch,
	} = useQuery<HistoryEntry[]>({
		queryKey: historyQueryKeys.all,
		queryFn: () => historyService.getHistory(),
		networkMode: "offlineFirst",
	});

	return {
		entries,
		isLoading,
		error,
		refetch: () => refetch(),
	};
}
