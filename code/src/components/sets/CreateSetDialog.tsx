import { type FormEvent, useId, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { CreateSetDTO, ShoppingSet } from "@/types/domain.types";

interface CreateSetDialogProps {
	isOpen: boolean;
	onClose: () => void;
	onCreateSet: (data: CreateSetDTO) => Promise<ShoppingSet>;
	isCreating: boolean;
}

/**
 * Dialog for creating a new empty set (template).
 * On success: invalidate sets and optionally navigate to /sets/:setId.
 */
export function CreateSetDialog({
	isOpen,
	onClose,
	onCreateSet,
	isCreating,
}: CreateSetDialogProps) {
	const navigate = useNavigate();
	const [name, setName] = useState("");
	const [error, setError] = useState<string | null>(null);
	const setNameId = useId();

	const isNameValid = name.trim().length > 0 && name.trim().length <= 100;

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();
		const trimmedName = name.trim();
		if (!trimmedName) {
			setError("Nazwa zestawu jest wymagana");
			return;
		}
		if (trimmedName.length > 100) {
			setError("Nazwa zestawu może mieć maksymalnie 100 znaków");
			return;
		}
		setError(null);
		try {
			const newSet = await onCreateSet({ name: trimmedName });
			setName("");
			setError(null);
			onClose();
			navigate({ to: "/sets/$setId", params: { setId: newSet.id } });
		} catch (err) {
			setError(
				err instanceof Error
					? err.message
					: "Nie udało się utworzyć zestawu. Spróbuj ponownie.",
			);
		}
	};

	const handleClose = () => {
		setName("");
		setError(null);
		onClose();
	};

	return (
		<Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Nowy zestaw</DialogTitle>
					<DialogDescription>
						Utwórz pusty zestaw (szablon). Dodasz do niego produkty w widoku
						szczegółów.
					</DialogDescription>
				</DialogHeader>
				<form onSubmit={handleSubmit}>
					<div className="grid gap-4 py-4">
						<div className="grid gap-2">
							<Label htmlFor={setNameId}>Nazwa zestawu</Label>
							<Input
								id={setNameId}
								type="text"
								placeholder="np. Śniadanie"
								value={name}
								onChange={(e) => {
									setName(e.target.value);
									if (error) setError(null);
								}}
								className={error ? "border-destructive" : ""}
								disabled={isCreating}
								autoFocus
								maxLength={100}
							/>
							{error && (
								<p className="text-sm text-destructive" role="alert">
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
