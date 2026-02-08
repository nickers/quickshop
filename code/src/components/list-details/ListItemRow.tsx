import { Check, GripVertical, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { useId, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import type { ListItem } from "@/types/domain.types";

const LONG_PRESS_MS = 500;
const SWIPE_ACTION_THRESHOLD_PX = 80;

function useIsTouchDevice() {
	const [isTouch] = useState(() =>
		typeof window !== "undefined"
			? window.matchMedia("(pointer: coarse)").matches
			: false,
	);
	return isTouch;
}

interface ListItemRowProps {
	item: ListItem;
	onToggle: (id: string, isCompleted: boolean) => void;
	onDelete: (id: string) => void;
	onUpdate?: (
		id: string,
		data: {
			name?: string;
			quantity?: string | null;
			note?: string | null;
		},
	) => void;
	/** Elementy niesynchronizowane – obniżona opacity (optimistic UI) */
	isPending?: boolean;
	/** Opcjonalne atrybuty i listenery dla drag handle (drag-and-drop) */
	dragHandleProps?: {
		attributes?: Record<string, unknown>;
		listeners?: Record<string, unknown>;
		setActivatorNodeRef?: (element: HTMLElement | null) => void;
	};
	/** Czy wiersz jest właśnie przeciągany */
	isDragging?: boolean;
}

export function ListItemRow({
	item,
	onToggle,
	onDelete,
	onUpdate,
	isPending = false,
	dragHandleProps,
	isDragging = false,
}: ListItemRowProps) {
	const isTouch = useIsTouchDevice();
	const editNameId = useId();
	const editQuantityId = useId();
	const editNoteId = useId();
	const [editOpen, setEditOpen] = useState(false);
	const [editName, setEditName] = useState(item.name);
	const [editQuantity, setEditQuantity] = useState(item.quantity ?? "");
	const [editNote, setEditNote] = useState(item.note ?? "");
	const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	const [swipeOffset, setSwipeOffset] = useState(0);
	const swipeStartX = useRef(0);
	const swipeOffsetRef = useRef(0);
	const isBought = item.is_bought ?? false;

	const openEdit = () => {
		setEditName(item.name);
		setEditQuantity(item.quantity ?? "");
		setEditNote(item.note ?? "");
		setEditOpen(true);
	};

	const closeEdit = () => setEditOpen(false);

	const submitEdit = () => {
		if (!onUpdate) return;
		const trimmedName = editName.trim();
		if (!trimmedName) return;
		onUpdate(item.id, {
			name: trimmedName,
			quantity: editQuantity.trim() || null,
			note: editNote.trim() || null,
		});
		closeEdit();
	};

	const clearLongPressTimer = () => {
		if (longPressTimerRef.current) {
			clearTimeout(longPressTimerRef.current);
			longPressTimerRef.current = null;
		}
	};

	const handleTouchStart = (e: React.TouchEvent) => {
		swipeStartX.current = e.touches[0].clientX;
		if (onUpdate) {
			longPressTimerRef.current = setTimeout(() => {
				longPressTimerRef.current = null;
				openEdit();
			}, LONG_PRESS_MS);
		}
	};

	const handleTouchMove = (e: React.TouchEvent) => {
		clearLongPressTimer();
		const x = e.touches[0].clientX;
		const diff = swipeStartX.current - x;
		const offset = diff > 0 ? Math.min(diff, 120) : 0;
		swipeOffsetRef.current = offset;
		setSwipeOffset(offset);
	};

	const handleTouchEnd = () => {
		clearLongPressTimer();
		const offset = swipeOffsetRef.current;
		setSwipeOffset(0);
		swipeOffsetRef.current = 0;
		if (offset >= SWIPE_ACTION_THRESHOLD_PX) {
			if (isBought) {
				onDelete(item.id);
			} else {
				onToggle(item.id, true);
			}
		}
	};

	const handleContextMenu = (e: React.MouseEvent) => {
		if (!onUpdate) return;
		e.preventDefault();
		openEdit();
	};

	const grip = (
		<div
			ref={dragHandleProps?.setActivatorNodeRef}
			className="text-muted-foreground cursor-grab active:cursor-grabbing shrink-0 touch-none"
			aria-hidden
			{...(dragHandleProps?.attributes ?? {})}
			{...(dragHandleProps?.listeners ?? {})}
		>
			<GripVertical className="h-4 w-4" />
		</div>
	);

	const rowContent = (
		<>
			<Checkbox
				checked={isBought}
				onCheckedChange={(checked) => onToggle(item.id, checked === true)}
			/>

			{/* Long-press and context menu target; div with role for touch/desktop a11y */}
			{/* biome-ignore lint/a11y/useSemanticElements: custom long-press/context target, not a form fieldset */}
			<div
				className="flex-1 min-w-0 touch-manipulation"
				role="group"
				aria-label={item.name}
				onTouchStart={isTouch ? handleTouchStart : undefined}
				onTouchMove={isTouch ? handleTouchMove : undefined}
				onTouchEnd={isTouch ? handleTouchEnd : undefined}
				onTouchCancel={
					isTouch
						? () => {
								clearLongPressTimer();
								setSwipeOffset(0);
							}
						: undefined
				}
				onContextMenu={handleContextMenu}
			>
				<div
					className={cn(
						"font-medium truncate",
						isBought && "line-through text-muted-foreground",
					)}
				>
					{item.name}
				</div>
				{(item.quantity || item.note) && (
					<div className="text-sm text-muted-foreground truncate">
						{[item.quantity, item.note].filter(Boolean).join(" · ")}
					</div>
				)}
			</div>

			{grip}

			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<button
						type="button"
						className="p-2 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
						aria-label="Otwórz menu pozycji"
						data-testid="list-item-row-menu"
					>
						<MoreVertical className="h-4 w-4" />
					</button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end">
					{onUpdate && (
						<DropdownMenuItem onSelect={openEdit} data-testid="list-item-menu-edit">
							<Pencil className="mr-2 h-4 w-4" />
							Edycja
						</DropdownMenuItem>
					)}
					<DropdownMenuItem
						className="text-destructive focus:text-destructive"
						onSelect={() => onDelete(item.id)}
						data-testid="list-item-menu-delete"
					>
						<Trash2 className="mr-2 h-4 w-4" />
						Usuń
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</>
	);

	if (isTouch) {
		return (
			<>
				<div className="mb-2 rounded-lg overflow-hidden relative">
					{/* Swipe action: background + icon – warstwa POD wierszem (z-0), odsłaniana przy swipe; opacity-100 żeby nic nie przeświecało */}
					<div
						className={cn(
							"absolute inset-y-0 right-0 z-0 w-24 flex items-center justify-center opacity-100",
							isBought
								? "bg-destructive text-destructive-foreground"
								: "bg-primary text-primary-foreground",
						)}
						aria-hidden
					>
						{isBought ? (
							<Trash2 className="h-6 w-6" />
						) : (
							<Check className="h-6 w-6" />
						)}
					</div>
					{/* Wiersz: zawsze pełne krycie (solid bg), bez opacity – inaczej tło akcji prześwieca */}
					<div
						className={cn(
							"relative z-[1] flex items-center gap-3 p-3 border rounded-lg transition-opacity transition-transform",
							isBought ? "bg-muted border-muted-foreground/25" : "bg-card",
							isPending && "ring-1 ring-muted-foreground/30",
							isDragging && "shadow-md z-10",
						)}
						style={{ transform: `translateX(-${swipeOffset}px)` }}
						data-testid="list-item-row"
						data-item-id={item.id}
					>
						{rowContent}
					</div>
				</div>

				{onUpdate && (
					<Dialog open={editOpen} onOpenChange={setEditOpen}>
						<DialogContent className="sm:max-w-[425px]" data-testid="list-item-edit-dialog">
							<DialogHeader>
								<DialogTitle>Edytuj produkt</DialogTitle>
								<DialogDescription>Zmień nazwę, ilość lub notatkę.</DialogDescription>
							</DialogHeader>
							<div className="grid gap-4 py-4">
								<div className="grid gap-2">
									<Label htmlFor={editNameId}>Nazwa produktu</Label>
									<Input
										id={editNameId}
										value={editName}
										onChange={(e) => setEditName(e.target.value)}
										placeholder="np. Mleko"
										maxLength={100}
										data-testid="list-item-edit-name"
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
										data-testid="list-item-edit-quantity"
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
										data-testid="list-item-edit-note"
									/>
								</div>
							</div>
							<DialogFooter>
								<Button variant="outline" onClick={closeEdit}>
									Anuluj
								</Button>
								<Button onClick={submitEdit} data-testid="list-item-edit-submit">
									Zapisz
								</Button>
							</DialogFooter>
						</DialogContent>
					</Dialog>
				)}
			</>
		);
	}

	return (
		<>
			<div
				className={cn(
					"flex items-center gap-3 p-3 bg-card border rounded-lg mb-2 transition-opacity",
					isBought && "bg-muted/40 border-muted-foreground/25",
					isPending && "opacity-70",
					isDragging && "opacity-80 shadow-md z-10",
				)}
				data-testid="list-item-row"
				data-item-id={item.id}
			>
				{rowContent}
			</div>

			{onUpdate && (
				<Dialog open={editOpen} onOpenChange={setEditOpen}>
					<DialogContent className="sm:max-w-[425px]" data-testid="list-item-edit-dialog">
						<DialogHeader>
							<DialogTitle>Edytuj produkt</DialogTitle>
							<DialogDescription>Zmień nazwę, ilość lub notatkę.</DialogDescription>
						</DialogHeader>
						<div className="grid gap-4 py-4">
							<div className="grid gap-2">
								<Label htmlFor={editNameId}>Nazwa produktu</Label>
								<Input
									id={editNameId}
									value={editName}
									onChange={(e) => setEditName(e.target.value)}
									placeholder="np. Mleko"
									maxLength={100}
									data-testid="list-item-edit-name"
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
									data-testid="list-item-edit-quantity"
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
									data-testid="list-item-edit-note"
								/>
							</div>
						</div>
						<DialogFooter>
							<Button variant="outline" onClick={closeEdit}>
								Anuluj
							</Button>
							<Button onClick={submitEdit} data-testid="list-item-edit-submit">
								Zapisz
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			)}
		</>
	);
}
