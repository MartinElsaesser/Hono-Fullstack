export function Switch({
	checked,
	onChange,
}: {
	checked: boolean;
	onChange: React.ChangeEventHandler<HTMLInputElement>;
}) {
	return (
		<label className="switch">
			<input type="checkbox" checked={checked} onChange={onChange} />
			<span></span>
		</label>
	);
}
