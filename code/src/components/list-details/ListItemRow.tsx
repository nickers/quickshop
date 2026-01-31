import { GripVertical, Trash2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import type { ListItem } from "@/types/domain.types";

interface ListItemRowProps {
	item: ListItem;
	onToggle: (id: string, isCompleted: boolean) => void;
	onDelete: (id: string) => void;
}

export function ListItemRow({ item, onToggle, onDelete }: ListItemRowProps) {
	return (
		<div
			className={cn(
				"flex items-center gap-3 p-3 bg-card border rounded-lg mb-2 transition-opacity",
				item.is_bought && "opacity-60 bg-muted/50",
			)}
		>
			{/* Drag handle placeholder - for now just visual */}
			<div className="text-muted-foreground cursor-grab active:cursor-grabbing">
				<GripVertical className="h-4 w-4" />
			</div>

			<Checkbox
				checked={item.is_bought ?? false}
				onCheckedChange={(checked) => onToggle(item.id, checked === true)}
			/>

			<div className="flex-1 min-w-0">
				<div
					className={cn(
						"font-medium truncate",
						item.is_bought && "line-through text-muted-foreground",
					)}
				>
					{item.name}
				</div>
				{item.quantity && (
					<div className="text-sm text-muted-foreground truncate">
						{item.quantity}
					</div>
				)}
			</div>

			<button
				type="button"
				onClick={() => onDelete(item.id)}
				className="text-destructive hover:bg-destructive/10 p-2 rounded-md transition-colors"
				aria-label="Delete item"
			>
				<Trash2 className="h-4 w-4" />
			</button>
		</div>
	);
}
