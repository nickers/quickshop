import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { supabaseClient } from "@/db/supabase.client";

export const Route = createFileRoute("/sets/$setId")({
	component: SetDetailsPage,
});

function SetDetailsPage() {
	const navigate = useNavigate();

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

	return (
		<div className="py-8 text-center text-muted-foreground">
			<p className="text-lg">Szczegóły zestawu – wkrótce</p>
			<p className="mt-2 text-sm">Tu będzie edycja szablonu.</p>
		</div>
	);
}
