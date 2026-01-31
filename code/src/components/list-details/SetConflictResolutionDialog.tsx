import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import type {
	CreateListItemDTO,
	SetConflictItem,
	SetResolutionResult,
} from "@/types/domain.types";

interface SetConflictResolutionDialogProps {
	isOpen: boolean;
	conflicts: SetConflictItem[];
	nonConflictingItems: CreateListItemDTO[];
	onResolve: (resolution: SetResolutionResult) => void;
	onCancel: () => void;
}

export function SetConflictResolutionDialog({
	isOpen,
	conflicts,
	nonConflictingItems,
	onResolve,
	onCancel,
}: SetConflictResolutionDialogProps) {
	const [selectedConflicts, setSelectedConflicts] = useState<Set<string>>(
		new Set(),
	);

	const handleToggle = (itemName: string) => {
		const next = new Set(selectedConflicts);
		if (next.has(itemName)) {
			next.delete(itemName);
		} else {
			next.add(itemName);
		}
		setSelectedConflicts(next);
	};

	const handleConfirm = () => {
		const itemsToUpdate: { itemId: string; newQuantity: string }[] = [];

		// Process conflicts
		conflicts.forEach((conflict) => {
			if (selectedConflicts.has(conflict.existingItem.name)) {
				// User chose to update/merge
				itemsToUpdate.push({
					itemId: conflict.existingItem.id,
					newQuantity: conflict.suggestedQuantity,
				});
			}
		});

		onResolve({
			itemsToCreate: nonConflictingItems,
			itemsToUpdate,
		});
	};

	return (
		<Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
			<DialogContent className="max-w-md">
				<DialogHeader>
					<DialogTitle>Znaleziono duplikaty</DialogTitle>
					<DialogDescription>
						Poniższe produkty już są na liście. Zaznacz te, dla których chcesz
						zsumować ilości. Niezaznaczone produkty pozostaną bez zmian.
					</DialogDescription>
				</DialogHeader>

				<div className="max-h-[60vh] overflow-y-auto py-4">
					{conflicts.map((conflict) => (
						<div
							key={conflict.existingItem.id}
							className="flex items-start gap-3 mb-4 p-3 border rounded-md"
						>
							<Checkbox
								checked={selectedConflicts.has(conflict.existingItem.name)}
								onCheckedChange={() => handleToggle(conflict.existingItem.name)}
							/>
							<div>
								<div className="font-medium">{conflict.existingItem.name}</div>
								<div className="text-sm text-muted-foreground">
									Obecnie: {conflict.existingItem.quantity || "0"} <br />
									Dodawane: {conflict.newItemCandidate.quantity || "0"} <br />
									<span className="text-primary font-semibold">
										Po złączeniu: {conflict.suggestedQuantity}
									</span>
								</div>
							</div>
						</div>
					))}
				</div>

				<DialogFooter>
					<Button variant="outline" onClick={onCancel}>
						Anuluj
					</Button>
					<Button onClick={handleConfirm}>
						Dodaj ({nonConflictingItems.length + selectedConflicts.size} prod.)
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
