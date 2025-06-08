import { createTRPCClient, httpBatchLink } from "@trpc/client";
import type { AppRouter } from "../../server/trpc/index.js";
import { runsOnServer } from "../../lib/runsOnServer.js";
import superjson from "superjson";

const origin = runsOnServer() ? "" : document.location.origin;

// Pass AppRouter as generic here. 👇 This lets the `trpc` object know
// what procedures are available on the server and their input/output types.
export const trpc = createTRPCClient<AppRouter>({
	links: [
		httpBatchLink({
			url: `${origin}/trpc`,
			transformer: superjson,
		}),
	],
});
