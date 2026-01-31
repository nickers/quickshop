import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ListsHeaderProps {
	onCreateClick: () => void;
}

/**
 * Header section for the Lists View.
 * Tytuł "Listy" pochodzi z głównego Header (MainLayout).
 * Przycisk "Nowa lista" w nagłówku – zgodnie z ui-plan §2.2.
 */
export function ListsHeader({ onCreateClick }: ListsHeaderProps) {
	return (
		<div className="flex items-center justify-end pt-4">
			<Button onClick={onCreateClick} size="default">
				<Plus className="mr-2 h-4 w-4" />
				Nowa lista
			</Button>
		</div>
	);
}
