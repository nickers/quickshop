import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ActiveItemsList } from "@/components/list-details/ActiveItemsList";
import { CompletedItemsSection } from "@/components/list-details/CompletedItemsSection";
import { ItemConflictDialog } from "@/components/list-details/ItemConflictDialog";
import { ListDetailsHeader } from "@/components/list-details/ListDetailsHeader";
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
import { supabaseClient } from "@/db/supabase.client";
import { useListDetails } from "@/hooks/useListDetails";

export const Route = createFileRoute("/lists/$listId")({
	component: ListDetailsPage,
});

function ListDetailsPage() {
	const { listId } = Route.useParams();
	const navigate = useNavigate();
	const [archiveConfirmOpen, setArchiveConfirmOpen] = useState(false);
	const [sharePlaceholderOpen, setSharePlaceholderOpen] = useState(false);
	const [isArchiving, setIsArchiving] = useState(false);

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
		conflictState,
		resolveConflict,
		cancelConflict,
		isSubmitting,
		archiveList,
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
		<div className="flex flex-col min-h-screen pb-20 relative bg-background">
			<ListDetailsHeader
				list={list}
				onShare={() => setSharePlaceholderOpen(true)}
				onArchive={() => setArchiveConfirmOpen(true)}
				onCreateSet={() => {}}
				onRename={() => {}}
			/>

			<div className="flex-1 overflow-y-auto">
				<ActiveItemsList
					items={activeItems}
					onToggle={toggleItem}
					onDelete={deleteItem}
					pendingIds={pendingIds}
				/>

				<CompletedItemsSection
					items={completedItems}
					onToggle={toggleItem}
					onDelete={deleteItem}
					pendingIds={pendingIds}
				/>
			</div>

			<StickyInputBar onAddItem={addItem} isSubmitting={isSubmitting} />

			<ItemConflictDialog
				isOpen={conflictState.isOpen}
				existingItem={conflictState.conflictingItem}
				newItemName={conflictState.pendingName}
				onConfirm={resolveConflict}
				onCancel={cancelConflict}
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

			{/* Udostępnij: placeholder (ShareModal – część 8) */}
			<Dialog
				open={sharePlaceholderOpen}
				onOpenChange={setSharePlaceholderOpen}
			>
				<DialogContent className="sm:max-w-[425px]">
					<DialogHeader>
						<DialogTitle>Udostępnij listę</DialogTitle>
						<DialogDescription>
							Udostępnianie listy – wkrótce (część 8).
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button onClick={() => setSharePlaceholderOpen(false)}>OK</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
