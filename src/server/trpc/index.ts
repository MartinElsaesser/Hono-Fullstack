import { router } from "./trpc.js";

import { todoAppRouter } from "./routers/todoAppRouter.js";

export const appRouter = router({
	todoApp: todoAppRouter,
});

// Export type router type signature,
// NOT the router itself.
export type AppRouter = typeof appRouter;
