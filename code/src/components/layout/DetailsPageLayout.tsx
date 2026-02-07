import type { ReactNode } from "react";

interface DetailsPageLayoutProps {
	header: ReactNode;
	children: ReactNode;
	footer: ReactNode;
	testId?: string;
}

export function DetailsPageLayout({
	header,
	children,
	footer,
	testId,
}: DetailsPageLayoutProps) {
	return (
		<div
			className="fixed inset-0 flex flex-col bg-background touch-manipulation z-10"
			data-testid={testId}
		>
			<div className="flex-shrink-0">{header}</div>
			<div className="flex-1 overflow-y-auto min-h-0 overscroll-none scroll-smooth-ios">
				{children}
				<div className="h-4" aria-hidden="true" />
			</div>
			<div className="flex-shrink-0">{footer}</div>
		</div>
	);
}
