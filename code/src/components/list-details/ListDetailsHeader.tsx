import { Link } from "@tanstack/react-router";
import { Archive, ArrowLeft, Copy, MoreVertical, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ShoppingList } from "@/types/domain.types";

interface ListDetailsHeaderProps {
	list: ShoppingList;
	onShare: () => void;
	onArchive: () => void;
	onCreateSet: () => void;
}

export function ListDetailsHeader({
	list,
	onShare,
	onArchive,
	onCreateSet,
}: ListDetailsHeaderProps) {
	return (
		<div className="flex items-center justify-between p-4 border-b bg-background sticky top-0 z-10">
			<div className="flex items-center gap-3">
				<Link to="/lists" className="p-2 -ml-2 hover:bg-accent rounded-full">
					<ArrowLeft className="h-5 w-5" />
				</Link>
				<div>
					<h1 className="font-semibold text-lg leading-tight">{list.name}</h1>
					{/* Status indicator could go here */}
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
