import type { QueryClient } from "@tanstack/react-query";
import {
	createRootRouteWithContext,
	Outlet,
	useRouterState,
} from "@tanstack/react-router";
import { MainLayout } from "@/components/layout/MainLayout";

interface MyRouterContext {
	queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
	component: RootComponent,
});

function isAppRoute(pathname: string) {
	return (
		pathname.startsWith("/lists") ||
		pathname.startsWith("/sets") ||
		pathname === "/history"
	);
}

function RootComponent() {
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const useMainLayout = isAppRoute(pathname);

	return (
		<>
			{useMainLayout ? (
				<MainLayout>
					<Outlet />
				</MainLayout>
			) : (
				<Outlet />
			)}
		</>
	);
}
