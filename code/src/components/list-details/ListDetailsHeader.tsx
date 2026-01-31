import { Link } from "@tanstack/react-router";
import {
	Archive,
	ArrowLeft,
	Copy,
	MoreVertical,
	Pencil,
	Share2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { SyncStatus } from "@/hooks/useListDetails";
import type { ShoppingList } from "@/types/domain.types";
import { SyncStatusIndicator } from "./SyncStatusIndicator";

interface ListDetailsHeaderProps {
	list: ShoppingList;
	onShare: () => void;
	onArchive: () => void;
	onCreateSet: () => void;
	onRename?: () => void;
	syncStatus?: SyncStatus;
	syncError?: Error | null;
	onSyncRetry?: () => void;
}

export function ListDetailsHeader({
	list,
	onShare,
	onArchive,
	onCreateSet,
	onRename,
	syncStatus = "synced",
	syncError = null,
	onSyncRetry,
}: ListDetailsHeaderProps) {
	return (
		<div className="flex items-center justify-between p-4 border-b bg-background sticky top-0 z-10">
			<div className="flex items-center gap-3 min-w-0 flex-1">
				<Link
					to="/lists"
					className="p-2 -ml-2 hover:bg-accent rounded-full shrink-0"
					aria-label="Wróć do list"
				>
					<ArrowLeft className="h-5 w-5" />
				</Link>
				<div className="min-w-0 flex-1">
					<h1 className="font-semibold text-lg leading-tight truncate">
						{list.name}
					</h1>
					<SyncStatusIndicator
						status={syncStatus}
						error={syncError}
						onRetry={onSyncRetry}
					/>
				</div>
			</div>

			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant="ghost" size="icon">
						<MoreVertical className="h-5 w-5" />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end">
					<DropdownMenuLabel>Opcje listy</DropdownMenuLabel>
					<DropdownMenuSeparator />
					<DropdownMenuItem onClick={onShare}>
						<Share2 className="mr-2 h-4 w-4" />
						Udostępnij
					</DropdownMenuItem>
					<DropdownMenuItem onClick={onCreateSet}>
						<Copy className="mr-2 h-4 w-4" />
						Utwórz zestaw
					</DropdownMenuItem>
					{onRename && (
						<DropdownMenuItem onClick={onRename}>
							<Pencil className="mr-2 h-4 w-4" />
							Zmień nazwę
						</DropdownMenuItem>
					)}
					<DropdownMenuSeparator />
					<DropdownMenuItem
						onClick={onArchive}
						className="text-destructive focus:text-destructive"
					>
						<Archive className="mr-2 h-4 w-4" />
						Zakończ zakupy (Archiwizuj)
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
}
