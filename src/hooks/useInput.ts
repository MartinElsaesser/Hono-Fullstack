import { useState, type ChangeEvent } from "react";

export function useInput(initState: string) {
	// utility to bind a value to an input
	// sets the value and onChange properties on the input
	const [hook, setHook] = useState<string>(initState);

	function handleChange(e: ChangeEvent<HTMLInputElement>) {
		const target = e.target;
		setHook(target.value);
	}

	return {
		value: hook,
		onChange: handleChange,
	};
}
