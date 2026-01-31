import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SetDetailsHeader } from "@/components/set-details/SetDetailsHeader";
import { SetItemsList } from "@/components/set-details/SetItemsList";
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
import { useSetDetails } from "@/hooks/useSetDetails";

export const Route = createFileRoute("/sets/$setId")({
	component: SetDetailsPage,
});

function SetDetailsPage() {
	const { setId } = Route.useParams();
	const navigate = useNavigate();
	const [renameDialogOpen, setRenameDialogOpen] = useState(false);
	const [renameValue, setRenameValue] = useState("");
	const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
	const [isRenaming, setIsRenaming] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);

	const {
		set,
		items,
		isLoading,
		error,
		addItem,
		updateItem,
		deleteItem,
		pendingIds,
		isSubmitting,
		renameSet,
		deleteSet,
	} = useSetDetails(setId);

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

	const handleRenameOpen = () => {
		setRenameValue(set?.name ?? "");
		setRenameDialogOpen(true);
	};

	const handleRenameConfirm = async () => {
		const trimmed = renameValue.trim();
		if (!trimmed || !renameSet) return;
		setIsRenaming(true);
		try {
			await renameSet(trimmed);
			setRenameDialogOpen(false);
		} catch (err) {
			console.error("Rename set failed:", err);
		} finally {
			setIsRenaming(false);
		}
	};

	const handleDeleteConfirm = async () => {
		if (!deleteSet) return;
		setIsDeleting(true);
		try {
			await deleteSet();
			setDeleteConfirmOpen(false);
			navigate({ to: "/sets" });
		} catch (err) {
			console.error("Delete set failed:", err);
		} finally {
			setIsDeleting(false);
		}
	};

	if (isLoading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
			</div>
		);
	}

	if (error || !set) {
		return (
			<div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
				<p className="mb-4 text-red-600">
					Nie znaleziono zestawu lub wystąpił błąd.
				</p>
				<Button onClick={() => navigate({ to: "/sets" })} variant="outline">
					Wróć do zestawów
				</Button>
			</div>
		);
	}

	return (
		<div className="flex flex-col min-h-screen pb-20 relative bg-background">
			<SetDetailsHeader
				set={set}
				onRename={handleRenameOpen}
				onDeleteSet={() => setDeleteConfirmOpen(true)}
			/>

			<div className="flex-1 overflow-y-auto">
				<SetItemsList
					items={items}
					pendingIds={pendingIds}
					onUpdate={updateItem}
					onDelete={deleteItem}
				/>
			</div>

			<StickyInputBar onAddItem={addItem} isSubmitting={isSubmitting} />

			{/* Zmień nazwę zestawu */}
			<Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
				<DialogContent className="sm:max-w-[425px]">
					<DialogHeader>
						<DialogTitle>Zmień nazwę zestawu</DialogTitle>
						<DialogDescription>
							Wprowadź nową nazwę zestawu (szablonu).
						</DialogDescription>
					</DialogHeader>
					<div className="grid gap-4 py-4">
						<div className="grid gap-2">
							<Label htmlFor="rename-set-input">Nazwa</Label>
							<Input
								id="rename-set-input"
								value={renameValue}
								onChange={(e) => setRenameValue(e.target.value)}
								placeholder="np. Śniadanie"
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
							disabled={isRenaming || !renameValue.trim()}
						>
							{isRenaming ? "Zapisywanie..." : "Zapisz"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Usuń zestaw – potwierdzenie */}
			<Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
				<DialogContent className="sm:max-w-[425px]">
					<DialogHeader>
						<DialogTitle>Usuń zestaw</DialogTitle>
						<DialogDescription>
							Czy na pewno chcesz usunąć zestaw „{set.name}”? Ta operacja jest
							nieodwracalna.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setDeleteConfirmOpen(false)}
							disabled={isDeleting}
						>
							Anuluj
						</Button>
						<Button
							variant="destructive"
							onClick={handleDeleteConfirm}
							disabled={isDeleting}
						>
							{isDeleting ? "Usuwanie..." : "Usuń zestaw"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
