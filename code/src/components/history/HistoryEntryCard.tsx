import { ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { HistoryEntry, HistoryItemSnapshot } from "@/types/domain.types";

function isHistoryItemSnapshot(item: unknown): item is HistoryItemSnapshot {
	return (
		item != null &&
		typeof item === "object" &&
		"name" in item &&
		typeof (item as HistoryItemSnapshot).name === "string"
	);
}

function parseItemsSnapshot(
	snapshot: HistoryEntry["items_snapshot"],
): HistoryItemSnapshot[] {
	if (snapshot == null) return [];
	const raw = snapshot as unknown;
	if (!Array.isArray(raw)) return [];
	return raw.filter(isHistoryItemSnapshot).map((item) => ({
		name: item.name,
		quantity: item.quantity ?? null,
		note: item.note ?? null,
	}));
}

function formatCompletedAt(completedAt: string | null): string {
	if (!completedAt) return "";
	const date = new Date(completedAt);
	return date.toLocaleDateString("pl-PL", {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
}

interface HistoryEntryCardProps {
	entry: HistoryEntry;
	isOpen: boolean;
	onToggle: () => void;
}

/**
 * Single history entry card: header (list name + date) and expandable list of items from snapshot.
 */
export function HistoryEntryCard({
	entry,
	isOpen,
	onToggle,
}: HistoryEntryCardProps) {
	const items = parseItemsSnapshot(entry.items_snapshot);
	const dateStr = formatCompletedAt(entry.completed_at);

	return (
		<Card className="overflow-hidden transition-shadow hover:shadow-md">
			<button
				type="button"
				className="w-full text-left"
				onClick={onToggle}
				aria-expanded={isOpen}
				aria-controls={`history-content-${entry.id}`}
				id={`history-trigger-${entry.id}`}
			>
				<CardHeader className="flex flex-row items-center justify-between gap-2 py-4">
					<CardTitle className="text-lg truncate pr-2">
						{entry.list_name}
					</CardTitle>
					<div className="flex shrink-0 items-center gap-2">
						{dateStr && (
							<span className="text-sm text-muted-foreground whitespace-nowrap">
								{dateStr}
							</span>
						)}
						{isOpen ? (
							<ChevronUp className="h-5 w-5 text-muted-foreground" />
						) : (
							<ChevronDown className="h-5 w-5 text-muted-foreground" />
						)}
					</div>
				</CardHeader>
			</button>

			{isOpen && (
				<CardContent
					id={`history-content-${entry.id}`}
					role="region"
					aria-labelledby={`history-trigger-${entry.id}`}
					className="border-t pt-4 pb-6"
				>
					{items.length === 0 ? (
						<p className="text-sm text-muted-foreground">
							Brak zapisanych pozycji w tym wpisie.
						</p>
					) : (
						<ul className="space-y-2">
							{items.map((item, index) => (
								<li
									key={`${entry.id}-${index}-${item.name}`}
									className="flex flex-col gap-0.5 text-sm"
								>
									<span>{item.name}</span>
									{(item.quantity || item.note) && (
										<span className="text-muted-foreground text-xs">
											{[item.quantity, item.note].filter(Boolean).join(" · ")}
										</span>
									)}
								</li>
							))}
						</ul>
					)}
				</CardContent>
			)}
		</Card>
	);
}
