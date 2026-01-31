import { MoreVertical, Pencil, Trash2 } from "lucide-react";
import { useId, useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { SetItem } from "@/types/domain.types";

interface SetItemRowProps {
	item: SetItem;
	onUpdate: (
		itemId: string,
		data: { name?: string; quantity?: string | null; note?: string | null },
	) => void;
	onDelete: (itemId: string) => void;
	isPending?: boolean;
}

export function SetItemRow({
	item,
	onUpdate,
	onDelete,
	isPending = false,
}: SetItemRowProps) {
	const editNameId = useId();
	const editQuantityId = useId();
	const editNoteId = useId();
	const [editOpen, setEditOpen] = useState(false);
	const [editName, setEditName] = useState(item.name);
	const [editQuantity, setEditQuantity] = useState(item.quantity ?? "");
	const [editNote, setEditNote] = useState(item.note ?? "");

	const openEdit = () => {
		setEditName(item.name);
		setEditQuantity(item.quantity ?? "");
		setEditNote(item.note ?? "");
		setEditOpen(true);
	};

	const submitEdit = () => {
		const nameTrimmed = editName.trim();
		if (!nameTrimmed) return;
		onUpdate(item.id, {
			name: nameTrimmed,
			quantity: editQuantity.trim() || null,
			note: editNote.trim() || null,
		});
		setEditOpen(false);
	};

	return (
		<>
			<div
				className={cn(
					"flex items-center gap-3 p-3 bg-card border rounded-lg mb-2 transition-opacity",
					isPending && "opacity-70",
				)}
			>
				<div className="flex-1 min-w-0">
					<div className="font-medium truncate">{item.name}</div>
					{(item.quantity || item.note) && (
						<div className="text-sm text-muted-foreground truncate">
							{[item.quantity, item.note].filter(Boolean).join(" · ")}
						</div>
					)}
				</div>

				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<button
							type="button"
							className="p-2 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
							aria-label="Otwórz menu pozycji"
						>
							<MoreVertical className="h-4 w-4" />
						</button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuItem onSelect={openEdit}>
							<Pencil className="mr-2 h-4 w-4" />
							Edycja
						</DropdownMenuItem>
						<DropdownMenuItem
							className="text-destructive focus:text-destructive"
							onSelect={() => onDelete(item.id)}
						>
							<Trash2 className="mr-2 h-4 w-4" />
							Usuń
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>

			<Dialog open={editOpen} onOpenChange={setEditOpen}>
				<DialogContent className="sm:max-w-[425px]">
					<DialogHeader>
						<DialogTitle>Edytuj pozycję</DialogTitle>
						<DialogDescription>
							Zmień nazwę, ilość lub notatkę.
						</DialogDescription>
					</DialogHeader>
					<div className="grid gap-4 py-4">
						<div className="grid gap-2">
							<Label htmlFor={editNameId}>Nazwa</Label>
							<Input
								id={editNameId}
								value={editName}
								onChange={(e) => setEditName(e.target.value)}
								placeholder="np. Mleko"
								maxLength={100}
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor={editQuantityId}>Ilość (opcjonalnie)</Label>
							<Input
								id={editQuantityId}
								value={editQuantity}
								onChange={(e) => setEditQuantity(e.target.value)}
								placeholder="np. 2 szt"
								maxLength={50}
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor={editNoteId}>Notatka (opcjonalnie)</Label>
							<Input
								id={editNoteId}
								value={editNote}
								onChange={(e) => setEditNote(e.target.value)}
								placeholder="np. bez laktozy"
								maxLength={100}
							/>
						</div>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setEditOpen(false)}>
							Anuluj
						</Button>
						<Button onClick={submitEdit} disabled={!editName.trim()}>
							Zapisz
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}
