import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SetsHeaderProps {
	onCreateClick?: () => void;
}

/**
 * Header section for the Sets Dashboard.
 * Tytuł "Zestawy" pochodzi z głównego Header (MainLayout).
 * Opcjonalny przycisk "Nowy zestaw" – zgodnie z ui-plan §2.4, impl-plan-05.
 */
export function SetsHeader({ onCreateClick }: SetsHeaderProps) {
	return (
		<div className="flex items-center justify-end pt-4">
			{onCreateClick && (
				<Button onClick={onCreateClick} size="default">
					<Plus className="mr-2 h-4 w-4" />
					Nowy zestaw
				</Button>
			)}
		</div>
	);
}
