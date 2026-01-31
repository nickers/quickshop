import { Link, useRouterState } from "@tanstack/react-router";
import { History, Layers, ListTodo } from "lucide-react";

const navItems = [
	{ to: "/lists", label: "Listy", icon: ListTodo },
	{ to: "/sets", label: "Zestawy", icon: Layers },
	{ to: "/history", label: "Historia", icon: History },
] as const;

export function BottomNav() {
	const pathname = useRouterState({ select: (s) => s.location.pathname });

	return (
		<nav
			className="fixed bottom-0 left-0 right-0 z-40 border-t bg-background pb-[env(safe-area-inset-bottom)]"
			aria-label="Główna nawigacja"
		>
			<div className="container mx-auto flex max-w-md justify-around">
				{navItems.map(({ to, label, icon: Icon }) => {
					const isCurrent = pathname === to;
					return (
						<Link
							key={to}
							to={to}
							className={`flex flex-col items-center gap-1 py-3 px-4 text-xs transition-colors ${
								isCurrent
									? "text-primary font-medium"
									: "text-muted-foreground hover:text-foreground"
							}`}
						>
							<Icon className="h-6 w-6" aria-hidden />
							<span>{label}</span>
						</Link>
					);
				})}
			</div>
		</nav>
	);
}
