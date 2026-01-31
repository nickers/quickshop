import { ShoppingBasket } from "lucide-react";
import type { ListViewModel } from "@/types/domain.types";
import { ListCard } from "./ListCard";

interface ListsGridProps {
	lists: ListViewModel[];
	currentUserId: string | null;
	onListClick: (listId: string) => void;
	onDeleteClick: (listId: string) => void;
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
}: ListsGridProps) {
	// Empty state
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
					Kliknij przycisk "Nowa lista", aby utworzyć pierwszą listę zakupów i
					zacząć organizować swoje zakupy.
				</p>
			</div>
		);
	}

	// Grid with lists
	return (
		<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
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
