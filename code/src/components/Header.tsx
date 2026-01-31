import { useNavigate, useRouterState } from "@tanstack/react-router";
import { LogOut, User } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabaseClient } from "@/db/supabase.client";

const ROUTE_TITLES: Record<string, string> = {
	"/lists": "Listy",
	"/sets": "Zestawy",
	"/history": "Historia",
};

export default function Header() {
	const [open, setOpen] = useState(false);
	const navigate = useNavigate();
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const title = ROUTE_TITLES[pathname] ?? "QuickShop";

	const handleLogout = async () => {
		await supabaseClient.auth.signOut();
		setOpen(false);
		navigate({ to: "/auth" });
	};

	return (
		<header className="sticky top-0 z-30 flex items-center justify-between border-b bg-background px-4 py-3">
			<h1 className="text-lg font-semibold">{title}</h1>
			<DropdownMenu open={open} onOpenChange={setOpen}>
				<DropdownMenuTrigger asChild>
					<Button variant="ghost" size="icon" aria-label="Menu użytkownika">
						<User className="h-5 w-5" />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end">
					<DropdownMenuItem onClick={handleLogout}>
						<LogOut className="mr-2 h-4 w-4" />
						Wyloguj się
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</header>
	);
}
