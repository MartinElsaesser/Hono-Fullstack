import "./Expansion.css";
export function Expansion() {
	return (
		<>
			<details>
				<summary>
					<article className="primary no-elevate">
						<nav>
							<div className="max">Custom summary</div>
							<i>expand_more</i>
						</nav>
					</article>
				</summary>
				<article className="border">First</article>
				<article className="border">Second</article>
				<article className="border">Third</article>
			</details>
			<details>
				<summary>
					<article className="primary no-elevate">
						<nav>
							<div className="max">Custom summary</div>
							<i>expand_more</i>
						</nav>
					</article>
				</summary>
				<article className="border">First</article>
				<article className="border">Second</article>
				<article className="border">Third</article>
			</details>
		</>
	);
}
