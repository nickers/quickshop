import { ListPlus, MoreVertical, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardAction,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ShoppingSet } from "@/types/domain.types";

interface SetCardProps {
	set: ShoppingSet;
	/** Opcjonalna liczba produktów w zestawie (jeśli dostępna) */
	itemCount?: number;
	onAddToList: (setId: string) => void;
	/** Klik w nazwę zestawu – nawigacja do szczegółów (opcjonalnie) */
	onSetClick?: (setId: string) => void;
	/** Usunięcie zestawu (opcjonalnie) */
	onDeleteClick?: (setId: string) => void;
}

/**
 * Card component for a single set (template).
 * Displays set name, optional item count, menu in top right, and "Dodaj do listy" button.
 */
export function SetCard({
	set,
	itemCount,
	onAddToList,
	onSetClick,
	onDeleteClick,
}: SetCardProps) {
	const handleAddClick = (e: React.MouseEvent) => {
		e.stopPropagation();
		onAddToList(set.id);
	};

	const handleCardClick = () => {
		if (onSetClick) onSetClick(set.id);
	};

	const handleDeleteClick = (e: Event) => {
		e.preventDefault();
		e.stopPropagation();
		if (
			window.confirm(
				`Czy na pewno chcesz usunąć zestaw "${set.name}"? Ta operacja jest nieodwracalna.`,
			)
		) {
			onDeleteClick?.(set.id);
		}
	};

	return (
		<Card
			className={
				onSetClick ? "cursor-pointer transition-shadow hover:shadow-md" : ""
			}
			onClick={onSetClick ? handleCardClick : undefined}
		>
			<CardHeader>
				<CardTitle className="text-lg">{set.name}</CardTitle>
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
								onSelect={(e) => {
									e.preventDefault();
									onAddToList(set.id);
								}}
							>
								<ListPlus className="mr-2 h-4 w-4" />
								Dodaj do listy
							</DropdownMenuItem>
							{onDeleteClick && (
								<DropdownMenuItem
									className="text-red-600 focus:text-red-600"
									onSelect={handleDeleteClick}
								>
									<Trash2 className="mr-2 h-4 w-4" />
									Usuń zestaw
								</DropdownMenuItem>
							)}
						</DropdownMenuContent>
					</DropdownMenu>
				</CardAction>
			</CardHeader>
			<CardContent>
				{itemCount !== undefined && (
					<p className="text-sm text-muted-foreground">
						{itemCount} {itemCount === 1 ? "produkt" : "produktów"}
					</p>
				)}
			</CardContent>
			<CardFooter>
				<Button
					variant="default"
					size="sm"
					className="w-full"
					onClick={handleAddClick}
				>
					<ListPlus className="mr-2 h-4 w-4" />
					Dodaj do listy
				</Button>
			</CardFooter>
		</Card>
	);
}
