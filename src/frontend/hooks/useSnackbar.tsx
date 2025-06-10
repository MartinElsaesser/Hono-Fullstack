import { useState, useCallback, type PropsWithChildren } from "react";

const delay = (time: number) => new Promise((resolve, _reject) => setTimeout(resolve, time));

export function useSnackbar() {
	const [snackbarState, setSnackbarState] = useState<SnackbarProps>({
		active: false,
		position: "top",
		style: undefined,
	});

	const showSnackbar = useCallback(
		async ({
			children,
			duration,
			style,
			position,
		}: Omit<SnackbarProps, "active"> & { duration: number }) => {
			setSnackbarState({ active: true, children, style, position });
			await delay(duration);
			setSnackbarState(prev => ({ ...prev, active: false }));
		},
		[setSnackbarState]
	);
	return {
		snackbarState,
		showSnackbar,
	};
}

export type SnackbarProps = PropsWithChildren<{
	active: boolean;
	position?: "top" | "bottom";
	style?: "error" | "primary" | "secondary" | "tertiary";
}>;

export function Snackbar({ children, active, position, style }: SnackbarProps) {
	const className = `snackbar ${position || ""} ${active ? "active" : ""} ${style || ""}`;
	return <div className={className}>{children}</div>;
}
