import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { supabaseClient } from "@/db/supabase.client";

export const Route = createFileRoute("/")({
	component: IndexView,
});

function IndexView() {
	const navigate = useNavigate();

	useEffect(() => {
		const checkAuthAndRedirect = async () => {
			const {
				data: { session },
			} = await supabaseClient.auth.getSession();

			if (session) {
				navigate({ to: "/lists" });
			} else {
				navigate({ to: "/auth" });
			}
		};

		checkAuthAndRedirect();
	}, [navigate]);

	return (
		<div className="min-h-screen flex items-center justify-center">
			<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
		</div>
	);
}
