import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { AuthMode } from "@/types/auth.types";

interface AuthModeSwitchProps {
	currentMode: AuthMode;
	onModeChange: (mode: AuthMode) => void;
}

export function AuthModeSwitch({
	currentMode,
	onModeChange,
}: AuthModeSwitchProps) {
	return (
		<Tabs
			value={currentMode}
			onValueChange={(value) => onModeChange(value as AuthMode)}
			data-testid="auth-mode-switch"
		>
			<TabsList className="grid w-full grid-cols-2">
				<TabsTrigger value="signin" data-testid="auth-tab-signin">Logowanie</TabsTrigger>
				<TabsTrigger value="signup" data-testid="auth-tab-signup">Rejestracja</TabsTrigger>
			</TabsList>
		</Tabs>
	);
}
