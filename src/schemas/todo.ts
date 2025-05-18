import { z } from "zod";
import type { InsertTodo } from "../server/db/schema/db-helper-types.js";

export const todoSchema = z.object({
	created_at: z.union([z.string(), z.date()]).optional(),
	description: z.string(),
	done: z.boolean(),
	headline: z.string(),
	id: z.number().int().positive().optional(),
	position: z.number().int().positive().optional(),
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
}) satisfies z.ZodType<InsertTodo, z.ZodTypeDef, any>;
