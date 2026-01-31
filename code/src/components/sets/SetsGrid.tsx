import { Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ShoppingSet } from "@/types/domain.types";
import { SetCard } from "./SetCard";

interface SetWithCount extends ShoppingSet {
	itemCount?: number;
}

interface SetsGridProps {
	sets: SetWithCount[];
	onAddToList: (setId: string) => void;
	onCreateSet?: () => void;
	onSetClick?: (setId: string) => void;
	onDeleteClick?: (setId: string) => void;
}

/**
 * Grid of set cards. Empty state with optional "Utwórz pierwszy zestaw" button.
 */
export function SetsGrid({
	sets,
	onAddToList,
	onCreateSet,
	onSetClick,
	onDeleteClick,
}: SetsGridProps) {
	if (sets.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center py-12 text-center">
				<div className="mb-4 rounded-full bg-secondary p-6">
					<Layers className="h-12 w-12 text-muted-foreground" />
				</div>
				<h2 className="mb-2 text-xl font-semibold">
					Nie masz jeszcze żadnych zestawów
				</h2>
				<p className="mb-6 max-w-md text-muted-foreground">
					Utwórz zestaw (szablon) produktów, aby szybko dodawać je do list
					zakupów.
				</p>
				{onCreateSet && (
					<Button onClick={onCreateSet} size="default">
						Utwórz pierwszy zestaw
					</Button>
				)}
			</div>
		);
	}

	return (
		<div className="grid grid-cols-1 gap-4">
			{sets.map((set) => (
				<SetCard
					key={set.id}
					set={set}
					itemCount={set.itemCount}
					onAddToList={onAddToList}
					onSetClick={onSetClick}
					onDeleteClick={onDeleteClick}
				/>
			))}
		</div>
	);
}
