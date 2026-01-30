import { useState, type FormEvent } from "react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { CreateListDTO } from "@/types/domain.types";

interface CreateListDialogProps {
	isOpen: boolean;
	onClose: () => void;
	onCreateList: (data: CreateListDTO) => Promise<void>;
	isCreating: boolean;
}

/**
 * Dialog component for creating a new shopping list.
 * Includes form validation and error handling.
 */
export function CreateListDialog({
	isOpen,
	onClose,
	onCreateList,
	isCreating,
}: CreateListDialogProps) {
	const [name, setName] = useState("");
	const [error, setError] = useState<string | null>(null);

	// Validation
	const isNameValid = name.trim().length > 0 && name.trim().length <= 100;

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();

		// Client-side validation
		const trimmedName = name.trim();

		if (!trimmedName) {
			setError("Nazwa listy jest wymagana");
			return;
		}

		if (trimmedName.length > 100) {
			setError("Nazwa listy może mieć maksymalnie 100 znaków");
			return;
		}

		// Clear error and submit
		setError(null);

		try {
			await onCreateList({ name: trimmedName });
			// Reset form on success
			setName("");
			setError(null);
		} catch (err) {
			setError(
				err instanceof Error
					? err.message
					: "Nie udało się utworzyć listy. Spróbuj ponownie.",
			);
		}
	};

	const handleClose = () => {
		// Reset form when closing
		setName("");
		setError(null);
		onClose();
	};

	const handleNameChange = (value: string) => {
		setName(value);
		// Clear error when user starts typing
		if (error) {
			setError(null);
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={handleClose}>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Nowa lista zakupów</DialogTitle>
					<DialogDescription>
						Utwórz nową listę zakupów. Możesz dodać produkty po jej utworzeniu.
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit}>
					<div className="grid gap-4 py-4">
						<div className="grid gap-2">
							<Label htmlFor="list-name">Nazwa listy</Label>
							<Input
								id="list-name"
								type="text"
								placeholder="np. Zakupy tygodniowe"
								value={name}
								onChange={(e) => handleNameChange(e.target.value)}
								className={error ? "border-red-500" : ""}
								disabled={isCreating}
								autoFocus
								maxLength={100}
							/>
							{error && (
								<p className="text-sm text-red-500" role="alert">
									{error}
								</p>
							)}
							<p className="text-xs text-muted-foreground">
								{name.length}/100 znaków
							</p>
						</div>
					</div>

					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={handleClose}
							disabled={isCreating}
						>
							Anuluj
						</Button>
						<Button type="submit" disabled={!isNameValid || isCreating}>
							{isCreating ? "Tworzenie..." : "Utwórz"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
