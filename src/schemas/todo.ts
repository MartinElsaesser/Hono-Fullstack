import { z } from "zod";
import type { Todo } from "../db/schema/db-types.js";
import type { Insertable } from "kysely";

export const todoSchema = z.object({
	created_at: z.union([z.string(), z.date()]).optional(),
	description: z.string(),
	done: z.boolean(),
	headline: z.string(),
	id: z.number().int().positive().optional(),
	position: z.number().int().positive().optional(),
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
}) satisfies z.ZodType<Insertable<Todo>, z.ZodTypeDef, any>;
