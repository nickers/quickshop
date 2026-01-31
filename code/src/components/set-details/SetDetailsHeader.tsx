import { Link } from "@tanstack/react-router";
import { ArrowLeft, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ShoppingSet } from "@/types/domain.types";

interface SetDetailsHeaderProps {
	set: ShoppingSet;
	onRename?: () => void;
	onDeleteSet?: () => void;
}

export function SetDetailsHeader({
	set,
	onRename,
	onDeleteSet,
}: SetDetailsHeaderProps) {
	return (
		<div className="flex items-center justify-between p-4 border-b bg-background sticky top-0 z-10">
			<div className="flex items-center gap-3 min-w-0 flex-1">
				<Link
					to="/sets"
					className="p-2 -ml-2 hover:bg-accent rounded-full shrink-0"
					aria-label="Wróć do zestawów"
				>
					<ArrowLeft className="h-5 w-5" />
				</Link>
				<div className="min-w-0 flex-1">
					<p className="text-xs text-muted-foreground uppercase tracking-wide">
						TRYB SZABLONU
					</p>
					<h1 className="font-semibold text-lg leading-tight truncate">
						{set.name}
					</h1>
				</div>
			</div>

			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant="ghost" size="icon">
						<MoreVertical className="h-5 w-5" />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end">
					<DropdownMenuLabel>Opcje zestawu</DropdownMenuLabel>
					<DropdownMenuSeparator />
					{onRename && (
						<DropdownMenuItem onClick={onRename}>
							<Pencil className="mr-2 h-4 w-4" />
							Zmień nazwę
						</DropdownMenuItem>
					)}
					{onDeleteSet && (
						<DropdownMenuItem
							onClick={onDeleteSet}
							className="text-destructive focus:text-destructive"
						>
							<Trash2 className="mr-2 h-4 w-4" />
							Usuń zestaw
						</DropdownMenuItem>
					)}
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
}
