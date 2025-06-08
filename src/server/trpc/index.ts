import z from "zod";
import { publicProcedure, router } from "./trpc.js";

export const appRouter = router({
	greetUser: publicProcedure.input(z.string()).query(opts => {
		const { input } = opts;
		return `Hello, ${input}!`;
	}),
});

// Export type router type signature,
// NOT the router itself.
export type AppRouter = typeof appRouter;
