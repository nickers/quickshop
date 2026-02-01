import { GripVertical, MoreVertical, Pencil, Trash2 } from "lucide-react";
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
const SWIPE_DELETE_THRESHOLD_PX = 80;

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
		data: { quantity?: string | null; note?: string | null },
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
	const editQuantityId = useId();
	const editNoteId = useId();
	const [editOpen, setEditOpen] = useState(false);
	const [editQuantity, setEditQuantity] = useState(item.quantity ?? "");
	const [editNote, setEditNote] = useState(item.note ?? "");
	const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	const [swipeOffset, setSwipeOffset] = useState(0);
	const swipeStartX = useRef(0);
	const swipeOffsetRef = useRef(0);

	const openEdit = () => {
		setEditQuantity(item.quantity ?? "");
		setEditNote(item.note ?? "");
		setEditOpen(true);
	};

	const closeEdit = () => setEditOpen(false);

	const submitEdit = () => {
		if (!onUpdate) return;
		onUpdate(item.id, {
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
		if (offset >= SWIPE_DELETE_THRESHOLD_PX) {
			onDelete(item.id);
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
				checked={item.is_bought ?? false}
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
						item.is_bought && "line-through text-muted-foreground",
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
					>
						<MoreVertical className="h-4 w-4" />
					</button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end">
					{onUpdate && (
						<DropdownMenuItem onSelect={openEdit}>
							<Pencil className="mr-2 h-4 w-4" />
							Edycja
						</DropdownMenuItem>
					)}
					<DropdownMenuItem
						className="text-destructive focus:text-destructive"
						onSelect={() => onDelete(item.id)}
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
					{/* Swipe action: red background + trash */}
					<div
						className="absolute inset-y-0 right-0 w-24 flex items-center justify-center bg-destructive text-destructive-foreground"
						aria-hidden
					>
						<Trash2 className="h-6 w-6" />
					</div>
					<div
						className={cn(
							"relative flex items-center gap-3 p-3 bg-card border rounded-lg transition-opacity transition-transform",
							item.is_bought && "opacity-60 bg-muted/50",
							isPending && "opacity-70",
							isDragging && "opacity-80 shadow-md z-10",
						)}
						style={{ transform: `translateX(-${swipeOffset}px)` }}
						data-testid={`list-item-row-${item.id}`}
					>
						{rowContent}
					</div>
				</div>

				{onUpdate && (
					<Dialog open={editOpen} onOpenChange={setEditOpen}>
						<DialogContent className="sm:max-w-[425px]">
							<DialogHeader>
								<DialogTitle>Edytuj ilość i notatkę</DialogTitle>
								<DialogDescription>{item.name}</DialogDescription>
							</DialogHeader>
							<div className="grid gap-4 py-4">
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
								<Button variant="outline" onClick={closeEdit}>
									Anuluj
								</Button>
								<Button onClick={submitEdit}>Zapisz</Button>
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
					item.is_bought && "opacity-60 bg-muted/50",
					isPending && "opacity-70",
					isDragging && "opacity-80 shadow-md z-10",
				)}
				data-testid={`list-item-row-${item.id}`}
			>
				{rowContent}
			</div>

			{onUpdate && (
				<Dialog open={editOpen} onOpenChange={setEditOpen}>
					<DialogContent className="sm:max-w-[425px]">
						<DialogHeader>
							<DialogTitle>Edytuj ilość i notatkę</DialogTitle>
							<DialogDescription>{item.name}</DialogDescription>
						</DialogHeader>
						<div className="grid gap-4 py-4">
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
							<Button variant="outline" onClick={closeEdit}>
								Anuluj
							</Button>
							<Button onClick={submitEdit}>Zapisz</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			)}
		</>
	);
}
