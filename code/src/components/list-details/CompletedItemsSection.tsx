import { Separator } from "@/components/ui/separator";
import type { ListItem } from "@/types/domain.types";
import { ListItemRow } from "./ListItemRow";

interface CompletedItemsSectionProps {
	items: ListItem[];
	onToggle: (id: string, isCompleted: boolean) => void;
	onDelete: (id: string) => void;
}

export function CompletedItemsSection({
	items,
	onToggle,
	onDelete,
}: CompletedItemsSectionProps) {
	if (items.length === 0) return null;

	return (
		<div className="p-4 pt-2">
			<div className="flex items-center gap-4 my-4">
				<Separator className="flex-1" />
				<span className="text-sm text-muted-foreground font-medium">
					Kupione ({items.length})
				</span>
				<Separator className="flex-1" />
			</div>
			{items.map((item) => (
				<ListItemRow
					key={item.id}
					item={item}
					onToggle={onToggle}
					onDelete={onDelete}
				/>
			))}
		</div>
	);
}
