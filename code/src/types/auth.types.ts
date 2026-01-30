// Types for authentication views and forms

export type AuthMode = "signin" | "signup";

export interface AuthCredentials {
	email: string;
	pass: string; // "pass" instead of "password" to avoid collision with HTML attributes
}

export interface AuthError {
	message: string;
	code?: string;
}
