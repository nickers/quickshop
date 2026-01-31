import { ListPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import type { ShoppingSet } from "@/types/domain.types";

interface SetCardProps {
	set: ShoppingSet;
	/** Opcjonalna liczba produktów w zestawie (jeśli dostępna) */
	itemCount?: number;
	onAddToList: (setId: string) => void;
	/** Klik w nazwę zestawu – nawigacja do szczegółów (opcjonalnie) */
	onSetClick?: (setId: string) => void;
}

/**
 * Card component for a single set (template).
 * Displays set name, optional item count, and "Dodaj do listy" button.
 */
export function SetCard({
	set,
	itemCount,
	onAddToList,
	onSetClick,
}: SetCardProps) {
	const handleAddClick = (e: React.MouseEvent) => {
		e.stopPropagation();
		onAddToList(set.id);
	};

	const handleCardClick = () => {
		if (onSetClick) onSetClick(set.id);
	};

	return (
		<Card
			className={onSetClick ? "cursor-pointer transition-shadow hover:shadow-md" : ""}
			onClick={onSetClick ? handleCardClick : undefined}
		>
			<CardHeader>
				<CardTitle className="text-lg">{set.name}</CardTitle>
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
