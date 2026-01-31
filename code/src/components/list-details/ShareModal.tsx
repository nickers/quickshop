import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
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
import { supabaseClient } from "@/db/supabase.client";
import { listsService } from "@/services/lists.service";
import type { ListMemberWithProfile } from "@/types/domain.types";

const LIST_MEMBERS_QUERY_KEY = "list-members";

function isValidEmail(value: string): boolean {
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

interface ShareModalProps {
	isOpen: boolean;
	onClose: () => void;
	listId: string;
}

export function ShareModal({
	isOpen,
	onClose,
	listId,
}: ShareModalProps) {
	const queryClient = useQueryClient();
	const [email, setEmail] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [isInviting, setIsInviting] = useState(false);
	const [currentUserId, setCurrentUserId] = useState<string | null>(null);

	useEffect(() => {
		if (!isOpen) return;
		const loadUser = async () => {
			const {
				data: { user },
			} = await supabaseClient.auth.getUser();
			setCurrentUserId(user?.id ?? null);
		};
		loadUser();
	}, [isOpen]);

	const { data: members = [], isLoading: isLoadingMembers } = useQuery({
		queryKey: [LIST_MEMBERS_QUERY_KEY, listId],
		queryFn: () => listsService.getListMembers(listId),
		enabled: isOpen && !!listId,
	});

	const handleInvite = async () => {
		const trimmed = email.trim();
		setError(null);
		if (!trimmed) {
			setError("Wpisz adres e-mail.");
			return;
		}
		if (!isValidEmail(trimmed)) {
			setError("Nieprawidłowy format adresu e-mail.");
			return;
		}
		setIsInviting(true);
		try {
			await listsService.shareListWithEmail(listId, trimmed);
			setEmail("");
			queryClient.invalidateQueries({ queryKey: [LIST_MEMBERS_QUERY_KEY, listId] });
		} catch (err) {
			const message =
				err instanceof Error ? err.message : "Nie udało się zaprosić.";
			if (message.includes("not found")) {
				setError(`Użytkownik z adresem ${trimmed} nie jest zarejestrowany.`);
			} else if (message.includes("already a member") || message.includes("already")) {
				setError("Ta osoba ma już dostęp do listy.");
			} else {
				setError(message);
			}
		} finally {
			setIsInviting(false);
		}
	};

	const handleRemoveMember = async (userId: string) => {
		try {
			await listsService.removeListMember(listId, userId);
			queryClient.invalidateQueries({ queryKey: [LIST_MEMBERS_QUERY_KEY, listId] });
		} catch (err) {
			console.error("Remove member failed:", err);
		}
	};

	const handleClose = () => {
		setEmail("");
		setError(null);
		onClose();
	};

	return (
		<Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Udostępnij listę</DialogTitle>
					<DialogDescription>
						Wpisz adres e-mail osoby, którą chcesz zaprosić do listy. Osoba musi
						mieć konto w aplikacji.
					</DialogDescription>
				</DialogHeader>

				<div className="grid gap-4 py-4">
					<div className="flex gap-2">
						<div className="grid flex-1 gap-2">
							<Label htmlFor="share-email">E-mail</Label>
							<Input
								id="share-email"
								type="email"
								placeholder="np. jan@example.com"
								value={email}
								onChange={(e) => {
									setEmail(e.target.value);
									setError(null);
								}}
								onKeyDown={(e) => {
									if (e.key === "Enter") {
										e.preventDefault();
										handleInvite();
									}
								}}
							/>
						</div>
						<div className="flex flex-col justify-end">
							<Button
								onClick={handleInvite}
								disabled={isInviting || !email.trim()}
							>
								{isInviting ? "Zapraszanie…" : "Zaproś"}
							</Button>
						</div>
					</div>
					{error && (
						<p className="text-sm text-destructive" role="alert">
							{error}
						</p>
					)}

					<div>
						<Label className="text-muted-foreground">Osoby z dostępem</Label>
						{isLoadingMembers ? (
							<p className="text-sm text-muted-foreground py-2">
								Ładowanie…
							</p>
						) : members.length === 0 ? (
							<p className="text-sm text-muted-foreground py-2">
								Brak zaproszonych osób.
							</p>
						) : (
							<ul className="mt-2 space-y-2 max-h-[200px] overflow-y-auto">
								{members.map((m: ListMemberWithProfile) => (
									<li
										key={m.user_id}
										className="flex items-center justify-between gap-2 py-1.5 px-2 rounded-md bg-muted/50"
									>
										<span className="text-sm truncate">
											{m.full_name || m.email || "Brak nazwy"}
											{m.user_id === currentUserId && " (Ty)"}
										</span>
										<Button
											variant="ghost"
											size="sm"
											className="shrink-0 text-destructive hover:text-destructive"
											onClick={() => handleRemoveMember(m.user_id)}
										>
											Usuń
										</Button>
									</li>
								))}
							</ul>
						)}
					</div>
				</div>

				<DialogFooter>
					<Button variant="outline" onClick={handleClose}>
						Zamknij
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
