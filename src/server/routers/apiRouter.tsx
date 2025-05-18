import { Hono, type Context, type TypedResponse } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { parsePositiveIntSchema, positiveIntSchema } from "../../schemas/utilitySchemas.js";
import { todoSchema } from "../../schemas/todo.js";
import {
	createTodo,
	getAllTodos,
	updateTodo,
	deleteTodo,
	getTodoById,
	moveTodoBetweenPositions,
} from "../db/services/TodoService.js";
import { stringify } from "superjson";
import type { ContentfulStatusCode } from "hono/utils/http-status";

export type BrandedString<T> = string & { _type: T };
export type InferBrandedString<T extends string> = T extends BrandedString<infer R> ? R : never; // true
function superjsonStringify<T>(data: T): BrandedString<T> {
	return stringify(data) as BrandedString<T>;
}

function json<T>(
	c: Context,
	data: T
): Response & TypedResponse<BrandedString<T>, ContentfulStatusCode, "text"> {
	return c.text(superjsonStringify(data));
}

const apiRouter = new Hono()
	// get all todos
	.get("/todos", async c => {
		const todos = await getAllTodos();
		return json(c, todos);
	})
	// get a specific todo
	.get(
		"/todos/:todoId",
		zValidator(
			"param",
			z.object({
				todoId: parsePositiveIntSchema,
			})
		),
		async c => {
			const { todoId } = await c.req.valid("param");
			const todo = await getTodoById({ todoId });
			return json(c, todo);
		}
	)
	// create a new todo
	.post(
		"/todos",
		zValidator(
			"json",
			z.object({
				description: z.string(),
				done: z.boolean(),
				headline: z.string(),
			})
		),
		async c => {
			const insertTodo = await c.req.valid("json");
			const todo = await createTodo({ todo: insertTodo });
			return json(c, todo);
		}
	)
	// shift todo positions for sortable list
	// TODO: refactor
	// TODO: add a documentation link
	.patch(
		"/todos/@arrayMove",
		zValidator(
			"json",
			z.object({
				fromId: positiveIntSchema,
				toId: positiveIntSchema,
			})
		),
		async c => {
			const { fromId, toId } = await c.req.valid("json");
			const result = await moveTodoBetweenPositions({ fromId, toId });
			return json(c, result);
		}
	)
	// update a todo
	.patch(
		"/todos/:todoId",
		zValidator(
			"json",
			todoSchema.omit({ id: true, position: true, created_at: true }).partial()
		),
		zValidator(
			"param",
			z.object({
				todoId: parsePositiveIntSchema,
			})
		),
		async c => {
			const todoData = await c.req.valid("json");
			const { todoId } = await c.req.valid("param");
			const todo = await updateTodo({ todoId, todo: todoData });
			return json(c, todo);
		}
	)

	// delete a todo
	.delete("/todos", zValidator("json", z.object({ todoId: z.number() })), async c => {
		// get validated data
		const { todoId } = await c.req.valid("json");
		const todo = await deleteTodo({ todoId });
		return json(c, todo);
	});

export default apiRouter;
