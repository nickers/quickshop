import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AuthModeSwitch } from "@/components/auth/AuthModeSwitch";
import { EmailAuthForm } from "@/components/auth/EmailAuthForm";
import { GoogleAuthButton } from "@/components/auth/GoogleAuthButton";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { supabaseClient } from "@/db/supabase.client";
import type { AuthCredentials, AuthMode } from "@/types/auth.types";

export const Route = createFileRoute("/auth")({
	component: AuthView,
});

function AuthView() {
	const navigate = useNavigate();
	const [mode, setMode] = useState<AuthMode>("signin");
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	// Check if user is already logged in
	useEffect(() => {
		const checkSession = async () => {
			const {
				data: { session },
			} = await supabaseClient.auth.getSession();
			if (session) {
				navigate({ to: "/lists" });
			}
		};
		checkSession();
	}, [navigate]);

	const getAuthErrorMessage = (
		supabaseError: { message: string; code?: string },
		isSignUp: boolean,
	) => {
		const msg = supabaseError.message.toLowerCase();
		const code = (supabaseError.code ?? "").toLowerCase();
		// Logowanie: konkretne komunikaty
		if (!isSignUp) {
			if (
				msg.includes("invalid login") ||
				msg.includes("invalid credentials") ||
				code.includes("invalid") ||
				msg.includes("invalid_credentials")
			)
				return "Nieprawidłowy email lub hasło.";
		}
		// Rejestracja: ogólny komunikat (bez ujawniania „użytkownik istnieje")
		if (isSignUp) {
			if (
				msg.includes("already registered") ||
				msg.includes("already exists") ||
				msg.includes("user_already_exists")
			)
				return "Nie udało się utworzyć konta. Sprawdź dane lub spróbuj zalogować się.";
		}
		// Fallback
		if (msg.includes("email") && msg.includes("confirm"))
			return "Sprawdź swoją skrzynkę pocztową, aby potwierdzić adres email.";
		return "Wystąpił błąd. Spróbuj ponownie.";
	};

	const handleEmailAuth = async (credentials: AuthCredentials) => {
		setIsLoading(true);
		setError(null);

		try {
			const result =
				mode === "signin"
					? await supabaseClient.auth.signInWithPassword({
							email: credentials.email,
							password: credentials.pass,
						})
					: await supabaseClient.auth.signUp({
							email: credentials.email,
							password: credentials.pass,
						});

			if (result.error) {
				setError(
					getAuthErrorMessage(result.error, mode === "signup"),
				);
				return;
			}

			// Check if email confirmation is required
			if (mode === "signup" && result.data.user && !result.data.session) {
				setError(
					"Sprawdź swoją skrzynkę pocztową, aby potwierdzić adres email.",
				);
				return;
			}

			// Successful login/signup
			navigate({ to: "/lists" });
		} catch (err) {
			setError("Wystąpił nieoczekiwany błąd. Spróbuj ponownie.");
			console.error("Auth error:", err);
		} finally {
			setIsLoading(false);
		}
	};

	const handleGoogleAuth = async () => {
		setIsLoading(true);
		setError(null);

		try {
			const { error } = await supabaseClient.auth.signInWithOAuth({
				provider: "google",
				options: {
					redirectTo: `${window.location.origin}/lists`,
				},
			});

			if (error) {
				setError(
					"Logowanie przez Google nie powiodło się. Spróbuj ponownie.",
				);
			}
		} catch (err) {
			setError("Wystąpił nieoczekiwany błąd. Spróbuj ponownie.");
			console.error("Google auth error:", err);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
			<Card className="w-full max-w-md">
				<CardHeader className="space-y-1">
					<CardTitle className="text-3xl font-bold text-center">
						QuickShop
					</CardTitle>
					<CardDescription className="text-center">
						Zarządzaj swoimi listami zakupów
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<AuthModeSwitch
						currentMode={mode}
						onModeChange={(newMode) => {
							setMode(newMode);
							setError(null);
						}}
					/>

					{error && (
						<div
							className="flex items-start gap-2 p-3 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-md"
							role="alert"
						>
							<span className="flex-1">{error}</span>
							<button
								type="button"
								onClick={() => setError(null)}
								className="shrink-0 rounded p-0.5 hover:bg-red-200/50 dark:hover:bg-red-800/30 focus:outline-none focus:ring-2 focus:ring-red-500"
								aria-label="Zamknij komunikat błędu"
							>
								<svg
									className="h-4 w-4"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
									aria-hidden
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M6 18L18 6M6 6l12 12"
									/>
								</svg>
							</button>
						</div>
					)}

					<EmailAuthForm
						mode={mode}
						onSubmit={handleEmailAuth}
						isLoading={isLoading}
					/>

					<div className="relative">
						<div className="absolute inset-0 flex items-center">
							<Separator />
						</div>
						<div className="relative flex justify-center text-xs uppercase">
							<span className="bg-white dark:bg-gray-950 px-2 text-gray-500">
								lub
							</span>
						</div>
					</div>

					<GoogleAuthButton onClick={handleGoogleAuth} isLoading={isLoading} />
				</CardContent>
			</Card>
		</div>
	);
}
