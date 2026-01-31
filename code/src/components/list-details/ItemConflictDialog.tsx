import { useEffect, useId, useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ListItem } from "@/types/domain.types";

interface ItemConflictDialogProps {
	isOpen: boolean;
	existingItem?: ListItem;
	newItemName?: string;
	onConfirm: (combinedQuantity: string) => void;
	onCancel: () => void;
}

export function ItemConflictDialog({
	isOpen,
	existingItem,
	newItemName,
	onConfirm,
	onCancel,
}: ItemConflictDialogProps) {
	const [quantity, setQuantity] = useState("");
	const quantityId = useId();

	useEffect(() => {
		if (isOpen && existingItem) {
			setQuantity(existingItem.quantity || "");
		}
	}, [isOpen, existingItem]);

	const handleConfirm = () => {
		onConfirm(quantity);
	};

	return (
		<Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Produkt już istnieje</DialogTitle>
					<DialogDescription>
						"{newItemName}" jest już na liście. Czy chcesz zaktualizować ilość?
					</DialogDescription>
				</DialogHeader>
				<div className="grid gap-4 py-4">
					<div className="grid gap-2">
						<Label htmlFor={quantityId}>Ilość</Label>
						<Input
							id={quantityId}
							value={quantity}
							onChange={(e) => setQuantity(e.target.value)}
							placeholder="np. 1 szt + 2 op"
						/>
					</div>
				</div>
				<DialogFooter>
					<Button variant="outline" onClick={onCancel}>
						Anuluj
					</Button>
					<Button onClick={handleConfirm}>Zaktualizuj</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
