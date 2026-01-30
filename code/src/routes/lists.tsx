import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { supabaseClient } from "@/db/supabase.client";
import { useListsView } from "@/hooks/useListsView";
import { ListsHeader } from "@/components/lists/ListsHeader";
import { ListsGrid } from "@/components/lists/ListsGrid";
import { CreateListDialog } from "@/components/lists/CreateListDialog";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/lists")({
	component: ListsView,
});

function ListsView() {
	const navigate = useNavigate();

	// Check if user is authenticated
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

	// Use custom hook for lists management
	const {
		lists,
		isLoading,
		error,
		currentUserId,
		isCreateDialogOpen,
		setIsCreateDialogOpen,
		handleCreateList,
		handleDeleteList,
		handleListClick,
		isCreating,
		refetch,
	} = useListsView();

	return (
		<div className="container mx-auto p-4 pb-20">
			<ListsHeader onCreateClick={() => setIsCreateDialogOpen(true)} />

			{/* Loading state */}
			{isLoading && (
				<div className="flex items-center justify-center py-12">
					<div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
				</div>
			)}

			{/* Error state */}
			{error && !isLoading && (
				<div className="flex flex-col items-center justify-center py-12 text-center">
					<p className="mb-4 text-red-600">
						Nie udało się pobrać list. Sprawdź połączenie z internetem.
					</p>
					<Button onClick={() => refetch()} variant="outline">
						Spróbuj ponownie
					</Button>
				</div>
			)}

			{/* Lists grid */}
			{!isLoading && !error && (
				<ListsGrid
					lists={lists}
					currentUserId={currentUserId}
					onListClick={handleListClick}
					onDeleteClick={handleDeleteList}
				/>
			)}

			{/* Create list dialog */}
			<CreateListDialog
				isOpen={isCreateDialogOpen}
				onClose={() => setIsCreateDialogOpen(false)}
				onCreateList={handleCreateList}
				isCreating={isCreating}
			/>
		</div>
	);
}
