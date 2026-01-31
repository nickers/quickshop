import { AlertCircle, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { SyncStatus } from "@/hooks/useListDetails";

interface SyncStatusIndicatorProps {
	status: SyncStatus;
	error?: Error | null;
	onRetry?: () => void;
}

export function SyncStatusIndicator({
	status,
	error,
	onRetry,
}: SyncStatusIndicatorProps) {
	if (status === "synced") {
		return (
			<div
				className="flex items-center gap-1 mt-0.5 text-green-600"
				title="Zsynchronizowano"
				aria-hidden
			>
				<Check className="h-4 w-4" />
			</div>
		);
	}

	if (status === "syncing") {
		return (
			<div
				className="flex items-center gap-1 mt-0.5 text-orange-500 animate-pulse"
				title="Synchronizacja..."
				aria-hidden
			>
				<Loader2 className="h-4 w-4 animate-spin" />
			</div>
		);
	}

	// error
	const trigger = (
		<button
			type="button"
			className="flex items-center gap-1 mt-0.5 text-destructive hover:opacity-80 rounded p-0.5"
			title="Błąd synchronizacji – kliknij, aby ponowić"
			aria-label="Błąd synchronizacji. Kliknij, aby zobaczyć szczegóły i ponowić."
		>
			<AlertCircle className="h-4 w-4" />
		</button>
	);

	if (!onRetry) {
		return (
			<div className="flex items-center gap-1 mt-0.5" title={error?.message}>
				{trigger}
			</div>
		);
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
			<DropdownMenuContent align="start" className="min-w-[200px]">
				<div className="px-2 py-2">
					<p className="text-sm text-muted-foreground mb-2">
						{error?.message ?? "Błąd synchronizacji."}
					</p>
					<Button
						size="sm"
						variant="outline"
						className="w-full"
						onClick={() => {
							onRetry();
							// Close dropdown when used from menu (Radix closes on item select; we're using a button inside content)
						}}
					>
						Ponów
					</Button>
				</div>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
