import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { HistoryList } from "@/components/history/HistoryList";
import { Button } from "@/components/ui/button";
import { supabaseClient } from "@/db/supabase.client";
import { useHistory } from "@/hooks/useHistory";

export const Route = createFileRoute("/history")({
	component: HistoryPage,
});

function HistoryPage() {
	const navigate = useNavigate();
	const { entries, isLoading, error, refetch } = useHistory();

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

	if (isLoading) {
		return (
			<div className="flex items-center justify-center py-12">
				<div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex flex-col items-center justify-center py-12 text-center">
				<p className="mb-4 text-destructive">
					Nie udało się pobrać historii. Sprawdź połączenie z internetem.
				</p>
				<Button onClick={() => refetch()} variant="outline">
					Spróbuj ponownie
				</Button>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<HistoryList entries={entries} />
		</div>
	);
}
