import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { parsePositiveIntSchema, positiveIntSchema } from "../schemas/utilitySchemas.js";
import { todoSchema } from "../schemas/todo.js";
import {
	createTodo,
	getAllTodos,
	updateTodo,
	deleteTodo,
	getTodoById,
	moveTodoBetweenPositions,
} from "../db/services/TodoService.js";
import { stringify } from "superjson";

function superjsonStringify<T>(data: T): string & { _type: T } {
	return stringify(data) as string & { _type: T };
}

const apiRouter = new Hono()
	// get all todos
	.get("/todos", async c => {
		const todos = await getAllTodos();
		return c.text(superjsonStringify(todos));
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
			return c.text(superjsonStringify(todo));
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
			return c.text(superjsonStringify(todo));
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
			return c.text(superjsonStringify(result));
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
			// throw new Error(`Cannot update todo ${todoId}`);
			const todo = await updateTodo({ todoId, todo: todoData });
			return c.text(superjsonStringify(todo));
		}
	)

	// delete a todo
	.delete("/todos", zValidator("json", z.object({ todoId: z.number() })), async c => {
		// get validated data
		const { todoId } = await c.req.valid("json");
		const todo = await deleteTodo({ todoId });

		return c.text(superjsonStringify(todo));
	});

export default apiRouter;
