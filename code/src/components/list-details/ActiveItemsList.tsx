import {
	closestCenter,
	DndContext,
	type DragEndEvent,
	PointerSensor,
	useSensor,
	useSensors,
} from "@dnd-kit/core";
import {
	arrayMove,
	SortableContext,
	useSortable,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { ListItem } from "@/types/domain.types";
import { ListItemRow } from "./ListItemRow";

interface ActiveItemsListProps {
	items: ListItem[];
	onToggle: (id: string, isCompleted: boolean) => void;
	onDelete: (id: string) => void;
	onUpdate?: (
		id: string,
		data: { quantity?: string | null; note?: string | null },
	) => void;
	onReorder?: (orderedItems: ListItem[]) => void;
	pendingIds?: Set<string>;
}

function SortableRow({
	item,
	onToggle,
	onDelete,
	onUpdate,
	pendingIds,
}: {
	item: ListItem;
	onToggle: (id: string, isCompleted: boolean) => void;
	onDelete: (id: string) => void;
	onUpdate?: (
		id: string,
		data: { quantity?: string | null; note?: string | null },
	) => void;
	pendingIds: Set<string>;
}) {
	const {
		attributes,
		listeners,
		setNodeRef,
		setActivatorNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({ id: item.id });

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
	};

	return (
		<div ref={setNodeRef} style={style}>
			<ListItemRow
				item={item}
				onToggle={onToggle}
				onDelete={onDelete}
				onUpdate={onUpdate}
				isPending={pendingIds.has(item.id)}
				dragHandleProps={{
					attributes: attributes as unknown as Record<string, unknown>,
					listeners: (listeners ?? {}) as unknown as Record<string, unknown>,
					setActivatorNodeRef,
				}}
				isDragging={isDragging}
			/>
		</div>
	);
}

export function ActiveItemsList({
	items,
	onToggle,
	onDelete,
	onUpdate,
	onReorder,
	pendingIds = new Set(),
}: ActiveItemsListProps) {
	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: { distance: 8 },
		}),
	);

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;
		if (!over || active.id === over.id || !onReorder) return;
		const oldIndex = items.findIndex((i) => i.id === active.id);
		const overIndex = items.findIndex((i) => i.id === over.id);
		if (oldIndex === -1 || overIndex === -1) return;
		const reordered = arrayMove(items, oldIndex, overIndex);
		onReorder(reordered);
	};

	if (items.length === 0) {
		return (
			<div className="text-center py-10 text-muted-foreground">
				Lista jest pusta. Dodaj produkty poniżej.
			</div>
		);
	}

	const itemIds = items.map((i) => i.id);

	return (
		<DndContext
			sensors={sensors}
			collisionDetection={closestCenter}
			onDragEnd={handleDragEnd}
		>
			<SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
				<div className="p-4 pb-0">
					{items.map((item) => (
						<SortableRow
							key={item.id}
							item={item}
							onToggle={onToggle}
							onDelete={onDelete}
							onUpdate={onUpdate}
							pendingIds={pendingIds}
						/>
					))}
				</div>
			</SortableContext>
		</DndContext>
	);
}
