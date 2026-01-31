import { Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface StickyInputBarProps {
	onAddItem: (name: string) => void;
	isSubmitting: boolean;
}

export function StickyInputBar({
	onAddItem,
	isSubmitting,
}: StickyInputBarProps) {
	const [value, setValue] = useState("");

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!value.trim()) return;
		onAddItem(value.trim());
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
					onChange={(e) => setValue(e.target.value)}
					placeholder="Dodaj produkt..."
					disabled={isSubmitting}
					className="flex-1"
					maxLength={100}
				/>
				<Button
					type="submit"
					size="icon"
					disabled={isSubmitting || !value.trim()}
				>
					<Plus className="h-5 w-5" />
				</Button>
			</form>
		</div>
	);
}
