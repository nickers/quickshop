import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { supabaseClient } from "@/db/supabase.client";

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

	return (
		<div className="container mx-auto p-4">
			<h1 className="text-3xl font-bold mb-6">Moje Listy Zakupów</h1>
			<p className="text-gray-600">
				Widok list zakupów będzie wkrótce zaimplementowany.
			</p>
		</div>
	);
}
