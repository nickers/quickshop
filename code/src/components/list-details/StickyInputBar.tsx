import { Plus } from "lucide-react";
import { useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface StickyInputBarProps {
	onAddItem: (name: string) => void;
	isSubmitting: boolean;
}

export function StickyInputBar({
	onAddItem,
	isSubmitting,
}: StickyInputBarProps) {
	const errorId = useId();
	const [value, setValue] = useState("");
	const [showError, setShowError] = useState(false);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		const trimmed = value.trim();
		if (!trimmed) {
			setShowError(true);
			setTimeout(() => setShowError(false), 600);
			return;
		}
		setShowError(false);
		onAddItem(trimmed);
		setValue("");
	};

	return (
		<div className="sticky bottom-0 left-0 right-0 bg-background border-t p-4 pb-safe-area-bottom">
			<form
				onSubmit={handleSubmit}
				className="flex gap-2 max-w-screen-md mx-auto"
			>
				<Input
					value={value}
					onChange={(e) => {
						setValue(e.target.value);
						if (showError) setShowError(false);
					}}
					placeholder="Dodaj produkt..."
					disabled={isSubmitting}
					className={cn(
						"flex-1 transition-[box-shadow] duration-150",
						showError &&
							"animate-pulse border-destructive ring-2 ring-destructive/30",
					)}
					maxLength={100}
					aria-invalid={showError}
					aria-describedby={showError ? errorId : undefined}
				/>
				<Button
					type="submit"
					size="icon"
					disabled={isSubmitting || !value.trim()}
					aria-label="Dodaj produkt"
				>
					<Plus className="h-5 w-5" />
				</Button>
			</form>
			{showError && (
				<p id={errorId} className="text-sm text-destructive mt-1" role="alert">
					Wpisz nazwę produktu
				</p>
			)}
		</div>
	);
}
