import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { ActiveItemsList } from "@/components/list-details/ActiveItemsList";
import { CompletedItemsSection } from "@/components/list-details/CompletedItemsSection";
import { ItemConflictDialog } from "@/components/list-details/ItemConflictDialog";
import { ListDetailsHeader } from "@/components/list-details/ListDetailsHeader";
import { StickyInputBar } from "@/components/list-details/StickyInputBar";
import { Button } from "@/components/ui/button";
import { supabaseClient } from "@/db/supabase.client";
import { useListDetails } from "@/hooks/useListDetails";

export const Route = createFileRoute("/lists/$listId")({
	component: ListDetailsPage,
});

function ListDetailsPage() {
	const { listId } = Route.useParams();
	const navigate = useNavigate();

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
		isLoading,
		error,
		addItem,
		toggleItem,
		deleteItem,
		conflictState,
		resolveConflict,
		cancelConflict,
		isSubmitting,
	} = useListDetails(listId);

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
				onShare={() => console.log("Share not implemented")}
				onArchive={() => console.log("Archive not implemented")}
				onCreateSet={() => console.log("Create Set not implemented")}
			/>

			<div className="flex-1 overflow-y-auto">
				<ActiveItemsList
					items={activeItems}
					onToggle={toggleItem}
					onDelete={deleteItem}
				/>

				<CompletedItemsSection
					items={completedItems}
					onToggle={toggleItem}
					onDelete={deleteItem}
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
		</div>
	);
}
