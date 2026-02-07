import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useId, useState } from "react";
import { DetailsPageLayout } from "@/components/layout/DetailsPageLayout";
import { ActiveItemsList } from "@/components/list-details/ActiveItemsList";
import { CompletedItemsSection } from "@/components/list-details/CompletedItemsSection";
import { ItemConflictDialog } from "@/components/list-details/ItemConflictDialog";
import { ListDetailsHeader } from "@/components/list-details/ListDetailsHeader";
import { ShareModal } from "@/components/list-details/ShareModal";
import { StickyInputBar } from "@/components/list-details/StickyInputBar";
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
import { supabaseClient } from "@/db/supabase.client";
import { useListDetails } from "@/hooks/useListDetails";

export const Route = createFileRoute("/lists/$listId")({
	component: ListDetailsPage,
});

function ListDetailsPage() {
	const { listId } = Route.useParams();
	const navigate = useNavigate();
	const renameListInputId = useId();
	const [archiveConfirmOpen, setArchiveConfirmOpen] = useState(false);
	const [shareModalOpen, setShareModalOpen] = useState(false);
	const [renameDialogOpen, setRenameDialogOpen] = useState(false);
	const [renameInputValue, setRenameInputValue] = useState("");
	const [createSetPlaceholderOpen, setCreateSetPlaceholderOpen] =
		useState(false);
	const [isArchiving, setIsArchiving] = useState(false);
	const [isRenaming, setIsRenaming] = useState(false);

	// Auth check
	useEffect(() => {
		const checkAuth = async () => {
			const {
				data: { session },
			} = await supabaseClient.auth.getSession();
			if (!session) {
				navigate({ to: "/auth" });
			}
		};
		checkAuth();
	}, [navigate]);

	const {
		list,
		activeItems,
		completedItems,
		pendingIds,
		isLoading,
		error,
		addItem,
		toggleItem,
		deleteItem,
		updateItemFields,
		conflictState,
		resolveConflict,
		cancelConflict,
		isSubmitting,
		archiveList,
		renameList,
		reorderItems,
		syncStatus,
		syncError,
		onSyncRetry,
	} = useListDetails(listId);

	const handleArchiveConfirm = async () => {
		if (!archiveList) return;
		setIsArchiving(true);
		try {
			await archiveList();
			setArchiveConfirmOpen(false);
			navigate({ to: "/lists" });
		} catch (err) {
			console.error("Archive failed:", err);
		} finally {
			setIsArchiving(false);
		}
	};

	const handleRenameOpen = () => {
		setRenameInputValue(list?.name ?? "");
		setRenameDialogOpen(true);
	};

	const handleRenameConfirm = async () => {
		const trimmed = renameInputValue.trim();
		if (!trimmed || !renameList) return;
		setIsRenaming(true);
		try {
			await renameList(trimmed);
			setRenameDialogOpen(false);
		} catch (err) {
			console.error("Rename failed:", err);
		} finally {
			setIsRenaming(false);
		}
	};

	if (isLoading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
			</div>
		);
	}

	if (error || !list) {
		return (
			<div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
				<p className="mb-4 text-red-600">
					Nie znaleziono listy lub wystąpił błąd.
				</p>
				<Button onClick={() => navigate({ to: "/lists" })} variant="outline">
					Wróć do list
				</Button>
			</div>
		);
	}

	return (
		<>
			<DetailsPageLayout
				testId="list-details-page"
				header={
					<ListDetailsHeader
						list={list}
						onShare={() => setShareModalOpen(true)}
						onArchive={() => setArchiveConfirmOpen(true)}
						onCreateSet={() => setCreateSetPlaceholderOpen(true)}
						onRename={handleRenameOpen}
						syncStatus={syncStatus}
						syncError={syncError}
						onSyncRetry={onSyncRetry}
					/>
				}
				footer={<StickyInputBar onAddItem={addItem} isSubmitting={isSubmitting} />}
			>
				<ActiveItemsList
					items={activeItems}
					onToggle={toggleItem}
					onDelete={deleteItem}
					onUpdate={updateItemFields}
					onReorder={reorderItems}
					pendingIds={pendingIds}
				/>

				<CompletedItemsSection
					items={completedItems}
					onToggle={toggleItem}
					onDelete={deleteItem}
					onUpdate={updateItemFields}
					pendingIds={pendingIds}
				/>
			</DetailsPageLayout>

			<ItemConflictDialog
				isOpen={conflictState.isOpen}
				existingItem={conflictState.conflictingItem}
				newItemName={conflictState.pendingName}
				onConfirm={resolveConflict}
				onCancel={cancelConflict}
			/>

			<ShareModal
				isOpen={shareModalOpen}
				onClose={() => setShareModalOpen(false)}
				listId={list.id}
			/>

			{/* Archiwizacja: potwierdzenie */}
			<Dialog open={archiveConfirmOpen} onOpenChange={setArchiveConfirmOpen}>
				<DialogContent className="sm:max-w-[425px]">
					<DialogHeader>
						<DialogTitle>Zakończ zakupy</DialogTitle>
						<DialogDescription>
							Czy na pewno chcesz zakończyć zakupy i zarchiwizować listę?
							Będziesz mógł ją zobaczyć w Historii.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setArchiveConfirmOpen(false)}
							disabled={isArchiving}
						>
							Anuluj
						</Button>
						<Button onClick={handleArchiveConfirm} disabled={isArchiving}>
							{isArchiving ? "Zapisywanie..." : "Zakończ zakupy"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Zmień nazwę listy */}
			<Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
				<DialogContent className="sm:max-w-[425px]">
					<DialogHeader>
						<DialogTitle>Zmień nazwę listy</DialogTitle>
						<DialogDescription>Wprowadź nową nazwę listy.</DialogDescription>
					</DialogHeader>
					<div className="grid gap-4 py-4">
						<div className="grid gap-2">
							<Label htmlFor={renameListInputId}>Nazwa</Label>
							<Input
								id={renameListInputId}
								value={renameInputValue}
								onChange={(e) => setRenameInputValue(e.target.value)}
								placeholder="np. Zakupy tygodniowe"
								onKeyDown={(e) => {
									if (e.key === "Enter") {
										e.preventDefault();
										handleRenameConfirm();
									}
								}}
							/>
						</div>
					</div>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setRenameDialogOpen(false)}
							disabled={isRenaming}
						>
							Anuluj
						</Button>
						<Button
							onClick={handleRenameConfirm}
							disabled={isRenaming || !renameInputValue.trim()}
						>
							{isRenaming ? "Zapisywanie..." : "Zapisz"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Utwórz zestaw: placeholder (część zestawów) */}
			<Dialog
				open={createSetPlaceholderOpen}
				onOpenChange={setCreateSetPlaceholderOpen}
			>
				<DialogContent className="sm:max-w-[425px]">
					<DialogHeader>
						<DialogTitle>Utwórz zestaw z listy</DialogTitle>
						<DialogDescription>
							Funkcja dostępna wkrótce (w ramach zakładki Zestawy).
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button onClick={() => setCreateSetPlaceholderOpen(false)}>
							OK
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}
