import type { ListItem } from "@/types/domain.types";
import { ListItemRow } from "./ListItemRow";

interface ActiveItemsListProps {
	items: ListItem[];
	onToggle: (id: string, isCompleted: boolean) => void;
	onDelete: (id: string) => void;
}

export function ActiveItemsList({
	items,
	onToggle,
	onDelete,
}: ActiveItemsListProps) {
	if (items.length === 0) {
		return (
			<div className="text-center py-10 text-muted-foreground">
				Lista jest pusta. Dodaj produkty poniżej.
			</div>
		);
	}

	return (
		<div className="p-4 pb-0">
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
