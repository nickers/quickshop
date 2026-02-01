import { MoreVertical, ShoppingCart, Trash2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardAction,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ListViewModel } from "@/types/domain.types";

interface ListCardProps {
	list: ListViewModel;
	currentUserId: string | null;
	onClick: (listId: string) => void;
	onDeleteClick: (listId: string) => void;
}

/**
 * Card component representing a single shopping list.
 * Displays list name, owner info (if shared), item counts, and action menu.
 */
export function ListCard({ list, onClick, onDeleteClick }: ListCardProps) {
	const handleCardClick = () => {
		onClick(list.id);
	};

	const handleDeleteClick = (e: Event) => {
		e.preventDefault();
		e.stopPropagation();

		// Confirmation dialog
		if (
			window.confirm(
				`Czy na pewno chcesz usunąć listę "${list.name}"? Ta operacja jest nieodwracalna.`,
			)
		) {
			onDeleteClick(list.id);
		}
	};

	// Calculate progress percentage
	const progressPercentage =
		list.totalItems > 0
			? Math.round((list.boughtItems / list.totalItems) * 100)
			: 0;

	return (
		<Card
			className="cursor-pointer transition-shadow hover:shadow-md"
			onClick={handleCardClick}
			data-testid={`list-card-${list.id}`}
		>
			<CardHeader>
				<CardTitle className="text-lg">{list.name}</CardTitle>
				<CardAction>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								variant="ghost"
								size="icon"
								className="h-8 w-8"
								onClick={(e) => e.stopPropagation()}
							>
								<MoreVertical className="h-4 w-4" />
								<span className="sr-only">Otwórz menu</span>
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
							<DropdownMenuItem
								className="text-red-600 focus:text-red-600"
								onSelect={handleDeleteClick}
								data-testid="list-card-delete"
							>
								<Trash2 className="mr-2 h-4 w-4" />
								Usuń listę
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</CardAction>
			</CardHeader>

			<CardContent className="space-y-3">
				{/* Owner info (if shared) */}
				{list.isShared && (
					<div className="flex items-center text-sm text-muted-foreground">
						<User className="mr-2 h-4 w-4" />
						<span>Właściciel: {list.ownerName || "Współdzielona lista"}</span>
					</div>
				)}

				{/* Item counts */}
				<div className="space-y-2">
					<div className="flex items-center justify-between text-sm">
						<div className="flex items-center">
							<ShoppingCart className="mr-2 h-4 w-4 text-muted-foreground" />
							<span>
								{list.boughtItems} / {list.totalItems} produktów
							</span>
						</div>
						<span className="text-muted-foreground">{progressPercentage}%</span>
					</div>

					{/* Progress bar */}
					{list.totalItems > 0 && (
						<div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
							<div
								className="h-full bg-primary transition-all duration-300"
								style={{ width: `${progressPercentage}%` }}
							/>
						</div>
					)}
				</div>

				{/* Empty state message */}
				{list.totalItems === 0 && (
					<p className="text-sm text-muted-foreground">
						Lista jest pusta. Kliknij, aby dodać produkty.
					</p>
				)}
			</CardContent>
		</Card>
	);
}
