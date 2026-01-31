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
import { cn } from "@/lib/utils";
import { supabaseClient } from "@/db/supabase.client";

function getTitle(pathname: string): string {
	if (pathname === "/sets" || pathname.startsWith("/sets/")) return "Zestawy";
	if (pathname === "/lists" || pathname.startsWith("/lists")) return "Listy";
	if (pathname === "/history") return "Historia";
	return "QuickShop";
}

export default function Header() {
	const [open, setOpen] = useState(false);
	const navigate = useNavigate();
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const title = getTitle(pathname);
	const isSetsRoute =
		pathname === "/sets" || pathname.startsWith("/sets/");

	const handleLogout = async () => {
		await supabaseClient.auth.signOut();
		setOpen(false);
		navigate({ to: "/auth" });
	};

	return (
		<header
			className={cn(
				"sticky top-0 z-30 flex items-center justify-between border-b bg-background px-4 py-3",
				isSetsRoute && "border-primary/30 bg-primary/5",
			)}
		>
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
