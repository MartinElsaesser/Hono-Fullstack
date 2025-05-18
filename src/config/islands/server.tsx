import React from "react";
import { registeredIslands } from "./shared.js";
import superjson from "superjson";

export default function Island({ children }: { children: React.ReactElement }) {
	try {
		// check if children is a valid react element
		if (!React.isValidElement(children)) {
			throw Error("only components are valid children");
		}

		// throw error if children is not a functional component
		if (typeof children.type !== "function") {
			throw new Error(`Island component "${children.type}" is not a functional component`);
		}

		// check if children is a registered island
		const islandIndex = registeredIslands.findIndex(island => island === children.type);
		if (islandIndex === -1) {
			throw new Error(
				`Island component "${children.type.name}" is not registered as an island. Please add it to the registeredIslands array.`
			);
		}

		return (
			<div
				data-island-index={islandIndex}
				data-island-props={superjson.stringify(children.props)}
			>
				{children}
			</div>
		);
	} catch (error: unknown) {
		// display errors
		let message = "";

		if (typeof error === "string") {
			message = error;
		} else if (error instanceof Error) {
			message = error.message;
		}

		return (
			<div style={{ color: "red", background: "lightgrey" }}>
				Island Error &gt;&gt; {message}
			</div>
		);
	}
}
