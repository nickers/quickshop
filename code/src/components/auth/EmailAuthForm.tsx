import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useId } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AuthCredentials, AuthMode } from "@/types/auth.types";

const authSchema = z.object({
	email: z.string().email("Nieprawidłowy format email"),
	pass: z.string().min(6, "Hasło musi mieć minimum 6 znaków"),
});

interface EmailAuthFormProps {
	mode: AuthMode;
	onSubmit: (credentials: AuthCredentials) => Promise<void>;
	isLoading: boolean;
}

export function EmailAuthForm({
	mode,
	onSubmit,
	isLoading,
}: EmailAuthFormProps) {
	const emailId = useId();
	const passwordId = useId();

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<AuthCredentials>({
		resolver: zodResolver(authSchema),
	});

	const buttonText = mode === "signin" ? "Zaloguj się" : "Zarejestruj się";
	const titleText = mode === "signin" ? "Logowanie" : "Rejestracja";

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
			<div className="space-y-2">
				<h2 className="text-2xl font-semibold text-center">{titleText}</h2>
			</div>

			<div className="space-y-2">
				<Label htmlFor={emailId}>Email</Label>
				<Input
					id={emailId}
					type="email"
					placeholder="twoj@email.com"
					disabled={isLoading}
					{...register("email")}
				/>
				{errors.email && (
					<p className="text-sm text-red-500">{errors.email.message}</p>
				)}
			</div>

			<div className="space-y-2">
				<Label htmlFor={passwordId}>Hasło</Label>
				<Input
					id={passwordId}
					type="password"
					placeholder="••••••••"
					disabled={isLoading}
					{...register("pass")}
				/>
				{errors.pass && (
					<p className="text-sm text-red-500">{errors.pass.message}</p>
				)}
			</div>

			<Button type="submit" className="w-full" disabled={isLoading}>
				{isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
				{buttonText}
			</Button>
		</form>
	);
}
