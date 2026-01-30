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
		>
			<TabsList className="grid w-full grid-cols-2">
				<TabsTrigger value="signin">Logowanie</TabsTrigger>
				<TabsTrigger value="signup">Rejestracja</TabsTrigger>
			</TabsList>
		</Tabs>
	);
}
