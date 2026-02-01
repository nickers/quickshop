import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { SetConflictResolutionDialog } from "@/components/list-details/SetConflictResolutionDialog";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { listQueryKeys } from "@/hooks/useListsView";
import { computeSetConflicts } from "@/lib/conflictUtils";
import { listItemsService } from "@/services/items.service";
import { listsService } from "@/services/lists.service";
import { setsService } from "@/services/sets.service";
import type {
	CreateListItemDTO,
	ListItem,
	SetConflictItem,
	SetResolutionResult,
} from "@/types/domain.types";

interface AddSetToListDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	setId: string | null;
	setName: string;
	onSuccess?: () => void;
}

/**
 * Modal: wybór listy docelowej; po wyborze – dodanie pozycji zestawu do listy
 * z obsługą konfliktów nazw (SetConflictResolutionDialog).
 */
export function AddSetToListDialog({
	open,
	onOpenChange,
	setId,
	setName,
	onSuccess,
}: AddSetToListDialogProps) {
	const queryClient = useQueryClient();
	const [isAdding, setIsAdding] = useState(false);
	const [conflictDialogOpen, setConflictDialogOpen] = useState(false);
	const [conflicts, setConflicts] = useState<SetConflictItem[]>([]);
	const [nonConflictingItems, setNonConflictingItems] = useState<
		CreateListItemDTO[]
	>([]);
	const [targetListIdForConflict, setTargetListIdForConflict] = useState<
		string | null
	>(null);

	// Listy użytkownika (gdy dialog otwarty)
	const { data: lists = [] } = useQuery({
		queryKey: listQueryKeys.all,
		queryFn: () => listsService.getAllLists(),
		enabled: open,
	});

	const handleSelectList = async (listId: string) => {
		if (!setId) return;
		setIsAdding(true);
		try {
			const [setItems, listItems] = await Promise.all([
				setsService.getSetItems(setId),
				listItemsService.getItemsByListId(listId),
			]);

			const activeOnList = listItems.filter((i: ListItem) => !i.is_bought);
			const { conflicts: conflictsOut, nonConflicting: nonConflictingOut } =
				computeSetConflicts({
					activeListItems: activeOnList,
					setItems,
					listId,
				});

			if (conflictsOut.length === 0) {
				if (nonConflictingOut.length > 0) {
					await listItemsService.bulkCreateItems(nonConflictingOut);
				}
				queryClient.invalidateQueries({ queryKey: ["list-items", listId] });
				queryClient.invalidateQueries({ queryKey: listQueryKeys.all });
				onOpenChange(false);
				onSuccess?.();
			} else {
				setConflicts(conflictsOut);
				setNonConflictingItems(nonConflictingOut);
				setTargetListIdForConflict(listId);
				setConflictDialogOpen(true);
			}
		} catch (err) {
			console.error("Add set to list failed:", err);
		} finally {
			setIsAdding(false);
		}
	};

	const handleConflictResolve = async (resolution: SetResolutionResult) => {
		if (!targetListIdForConflict) return;
		try {
			if (resolution.itemsToCreate.length > 0) {
				await listItemsService.bulkCreateItems(resolution.itemsToCreate);
			}
			for (const u of resolution.itemsToUpdate) {
				await listItemsService.updateItem({
					id: u.itemId,
					quantity: u.newQuantity,
				});
			}
			queryClient.invalidateQueries({
				queryKey: ["list-items", targetListIdForConflict],
			});
			queryClient.invalidateQueries({ queryKey: listQueryKeys.all });
			setConflictDialogOpen(false);
			setTargetListIdForConflict(null);
			onOpenChange(false);
			onSuccess?.();
		} catch (err) {
			console.error("Conflict resolve failed:", err);
		}
	};

	const handleConflictCancel = () => {
		setConflictDialogOpen(false);
		setTargetListIdForConflict(null);
		setConflicts([]);
		setNonConflictingItems([]);
	};

	const handleClose = (open: boolean) => {
		if (!open) {
			setConflictDialogOpen(false);
			setTargetListIdForConflict(null);
		}
		onOpenChange(open);
	};

	return (
		<>
			<Dialog open={open} onOpenChange={handleClose}>
				<DialogContent className="sm:max-w-[425px]">
					<DialogHeader>
						<DialogTitle>Dodaj zestaw do listy</DialogTitle>
						<DialogDescription>
							Wybierz listę, na którą chcesz dodać zestaw „{setName}”.
						</DialogDescription>
					</DialogHeader>
					<div className="flex flex-col gap-2 py-4 max-h-[60vh] overflow-y-auto">
						{lists.length === 0 ? (
							<p className="text-sm text-muted-foreground">
								Brak list. Utwórz najpierw listę w zakładce Listy.
							</p>
						) : (
							lists.map((list) => (
								<Button
									key={list.id}
									variant="outline"
									className="justify-start"
									onClick={() => handleSelectList(list.id)}
									disabled={isAdding}
								>
									{list.name}
								</Button>
							))
						)}
					</div>
				</DialogContent>
			</Dialog>

			<SetConflictResolutionDialog
				isOpen={conflictDialogOpen}
				conflicts={conflicts}
				nonConflictingItems={nonConflictingItems}
				onResolve={handleConflictResolve}
				onCancel={handleConflictCancel}
			/>
		</>
	);
}
