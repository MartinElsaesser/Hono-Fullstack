export function Switch({
	round,
	checked,
	onChange,
	size = "medium",
}: {
	round?: boolean;
	checked: boolean;
	onChange: React.ChangeEventHandler<HTMLInputElement>;
	size: "small" | "medium";
}) {
	const className = round ? "slider round" : "slider";
	return (
		<label className={"switch " + size}>
			<input type="checkbox" checked={checked} onChange={onChange} />
			<span className={className}></span>
		</label>
	);
}
