import { Plus, ShoppingBasket } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ListViewModel } from "@/types/domain.types";
import { ListCard } from "./ListCard";

interface ListsGridProps {
	lists: ListViewModel[];
	currentUserId: string | null;
	onListClick: (listId: string) => void;
	onDeleteClick: (listId: string) => void;
	onCreateClick?: () => void;
}

/**
 * Responsive grid container for displaying list cards.
 * Shows empty state when no lists are available.
 */
export function ListsGrid({
	lists,
	currentUserId,
	onListClick,
	onDeleteClick,
	onCreateClick,
}: ListsGridProps) {
	// Empty state: komunikat + przycisk "Nowa lista" (impl-plan-03, ui-plan §2.2)
	if (lists.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center py-12 text-center">
				<div className="mb-4 rounded-full bg-secondary p-6">
					<ShoppingBasket className="h-12 w-12 text-muted-foreground" />
				</div>
				<h2 className="mb-2 text-xl font-semibold">
					Nie masz jeszcze żadnych list
				</h2>
				<p className="mb-6 max-w-md text-muted-foreground">
					Utwórz pierwszą listę zakupów i zacznij organizować swoje zakupy.
				</p>
				{onCreateClick && (
					<Button onClick={onCreateClick} size="default">
						<Plus className="mr-2 h-4 w-4" />
						Nowa lista
					</Button>
				)}
			</div>
		);
	}

	// Jedna kolumna – karty na pełną szerokość, bez efektu „ściśniętych kolumn” (max-w-md)
	return (
		<div className="grid grid-cols-1 gap-4" data-testid="lists-grid">
			{lists.map((list) => (
				<ListCard
					key={list.id}
					list={list}
					currentUserId={currentUserId}
					onClick={onListClick}
					onDeleteClick={onDeleteClick}
				/>
			))}
		</div>
	);
}
