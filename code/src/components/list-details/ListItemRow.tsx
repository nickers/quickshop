import { GripVertical, MoreVertical, Trash2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { ListItem } from "@/types/domain.types";

interface ListItemRowProps {
	item: ListItem;
	onToggle: (id: string, isCompleted: boolean) => void;
	onDelete: (id: string) => void;
	/** Elementy niesynchronizowane – obniżona opacity (optimistic UI) */
	isPending?: boolean;
}

export function ListItemRow({
	item,
	onToggle,
	onDelete,
	isPending = false,
}: ListItemRowProps) {
	return (
		<div
			className={cn(
				"flex items-center gap-3 p-3 bg-card border rounded-lg mb-2 transition-opacity",
				item.is_bought && "opacity-60 bg-muted/50",
				isPending && "opacity-70",
			)}
		>
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
				{(item.quantity || item.note) && (
					<div className="text-sm text-muted-foreground truncate">
						{[item.quantity, item.note].filter(Boolean).join(" · ")}
					</div>
				)}
			</div>

			<div
				className="text-muted-foreground cursor-grab active:cursor-grabbing shrink-0"
				aria-hidden
			>
				<GripVertical className="h-4 w-4" />
			</div>

			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<button
						type="button"
						className="p-2 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
						aria-label="Otwórz menu pozycji"
					>
						<MoreVertical className="h-4 w-4" />
					</button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end">
					<DropdownMenuItem
						className="text-destructive focus:text-destructive"
						onSelect={() => onDelete(item.id)}
					>
						<Trash2 className="mr-2 h-4 w-4" />
						Usuń
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
}
