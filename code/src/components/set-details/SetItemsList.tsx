import type { SetItem } from "@/types/domain.types";
import { SetItemRow } from "./SetItemRow";

interface SetItemsListProps {
	items: SetItem[];
	pendingIds: Set<string>;
	onUpdate: (
		itemId: string,
		data: { name?: string; quantity?: string | null; note?: string | null },
	) => void;
	onDelete: (itemId: string) => void;
}

export function SetItemsList({
	items,
	pendingIds,
	onUpdate,
	onDelete,
}: SetItemsListProps) {
	return (
		<div className="pb-4">
			{items.map((item) => (
				<SetItemRow
					key={item.id}
					item={item}
					onUpdate={onUpdate}
					onDelete={onDelete}
					isPending={pendingIds.has(item.id)}
				/>
			))}
		</div>
	);
}
