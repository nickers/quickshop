import { useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";
import Header from "@/components/Header";
import { BottomNav } from "./BottomNav";

const DASHBOARD_PATHS = ["/lists", "/sets", "/history"] as const;

function useShowAppChrome() {
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const isDashboard = DASHBOARD_PATHS.some((p) => pathname === p);
	return { showHeader: isDashboard, showBottomNav: isDashboard };
}

interface MainLayoutProps {
	children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
	const { showHeader, showBottomNav } = useShowAppChrome();

	return (
		<>
			{showHeader && <Header />}
			<main className="container mx-auto max-w-md min-h-screen px-4 pb-24">
				{children}
			</main>
			{showBottomNav && <BottomNav />}
		</>
	);
}
