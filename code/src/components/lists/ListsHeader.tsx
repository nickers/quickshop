import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ListsHeaderProps {
	onCreateClick: () => void;
}

/**
 * Header component for the Lists View.
 * Displays the page title and a button to create a new list.
 */
export function ListsHeader({ onCreateClick }: ListsHeaderProps) {
	return (
		<div className="mb-6 flex items-center justify-between">
			<h1 className="text-3xl font-bold">Moje Listy Zakupów</h1>
			<Button onClick={onCreateClick} size="default">
				<Plus className="mr-2 h-4 w-4" />
				Nowa lista
			</Button>
		</div>
	);
}
