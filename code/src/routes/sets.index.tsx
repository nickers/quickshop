import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AddSetToListDialog } from "@/components/sets/AddSetToListDialog";
import { CreateSetDialog } from "@/components/sets/CreateSetDialog";
import { SetsGrid } from "@/components/sets/SetsGrid";
import { SetsHeader } from "@/components/sets/SetsHeader";
import { Button } from "@/components/ui/button";
import { supabaseClient } from "@/db/supabase.client";
import { useSetsView } from "@/hooks/useSetsView";

export const Route = createFileRoute("/sets/")({
	component: SetsIndexPage,
});

function SetsIndexPage() {
	const navigate = useNavigate();
	const [addDialogOpen, setAddDialogOpen] = useState(false);
	const [addDialogSetId, setAddDialogSetId] = useState<string | null>(null);
	const [addDialogSetName, setAddDialogSetName] = useState("");
	const [createDialogOpen, setCreateDialogOpen] = useState(false);

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

	const { sets, isLoading, error, refetch, createSet, isCreatingSet } =
		useSetsView();

	const handleAddToList = (setId: string) => {
		const set = sets.find((s) => s.id === setId);
		setAddDialogSetId(setId);
		setAddDialogSetName(set?.name ?? "");
		setAddDialogOpen(true);
	};

	const handleAddDialogClose = (open: boolean) => {
		setAddDialogOpen(open);
		if (!open) {
			setAddDialogSetId(null);
			setAddDialogSetName("");
		}
	};

	if (isLoading) {
		return (
			<div className="flex justify-center items-center min-h-[50vh]">
				<div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex flex-col justify-center items-center py-12 text-center">
				<p className="mb-4 text-destructive">
					Nie udało się pobrać zestawów. Sprawdź połączenie z internetem.
				</p>
				<Button onClick={() => refetch()} variant="outline">
					Spróbuj ponownie
				</Button>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<SetsHeader onCreateClick={() => setCreateDialogOpen(true)} />

			<SetsGrid
				sets={sets}
				onAddToList={handleAddToList}
				onCreateSet={() => setCreateDialogOpen(true)}
				onSetClick={(setId) =>
					navigate({ to: "/sets/$setId", params: { setId } })
				}
			/>

			<AddSetToListDialog
				open={addDialogOpen}
				onOpenChange={handleAddDialogClose}
				setId={addDialogSetId}
				setName={addDialogSetName}
			/>

			<CreateSetDialog
				isOpen={createDialogOpen}
				onClose={() => setCreateDialogOpen(false)}
				onCreateSet={(data) => createSet(data)}
				isCreating={isCreatingSet}
			/>
		</div>
	);
}
