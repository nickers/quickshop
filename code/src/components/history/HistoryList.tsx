import { useState } from "react";
import type { HistoryEntry } from "@/types/domain.types";
import { HistoryEntryCard } from "./HistoryEntryCard";

interface HistoryListProps {
	entries: HistoryEntry[];
}

/**
 * List of history entry cards (accordion). Empty state: "Brak zakończonych zakupów".
 */
export function HistoryList({ entries }: HistoryListProps) {
	const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

	const toggleEntry = (id: string) => {
		setExpandedIds((prev) => {
			const next = new Set(prev);
			if (next.has(id)) {
				next.delete(id);
			} else {
				next.add(id);
			}
			return next;
		});
	};

	if (entries.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center py-12 text-center">
				<p className="text-muted-foreground text-lg">
					Brak zakończonych zakupów
				</p>
				<p className="text-muted-foreground text-sm mt-2">
					Zarchiwizowane listy pojawią się tutaj po zakończeniu zakupów.
				</p>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			{entries.map((entry) => (
				<HistoryEntryCard
					key={entry.id}
					entry={entry}
					isOpen={expandedIds.has(entry.id)}
					onToggle={() => toggleEntry(entry.id)}
				/>
			))}
		</div>
	);
}
