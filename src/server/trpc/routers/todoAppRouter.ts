import z from "zod";
import { publicProcedure, router } from "../trpc.js";

import {
	createTodo,
	getAllTodos,
	updateTodo,
	deleteTodo,
	getTodoById,
	moveTodoBetweenPositions,
} from "../../db/services/TodoService.js";
import { todoSchema } from "../../../schemas/todo.js";

export const todoAppRouter = router({
	getAllTodos: publicProcedure.query(async _opts => {
		const todos = await getAllTodos();
		return todos;
	}),
	getTodoById: publicProcedure.input(z.object({ todoId: z.number() })).query(async opts => {
		const { input } = opts;
		const todo = await getTodoById(input);
		return todo;
	}),
	createTodo: publicProcedure
		.input(
			z.object({
				description: z.string(),
				done: z.boolean(),
				headline: z.string(),
			})
		)
		.mutation(async opts => {
			const { input } = opts;
			const todo = await createTodo({ todo: input });
			return todo;
		}),
	updateTodo: publicProcedure
		.input(
			z.object({
				todoId: z.number(),
				partialTodo: todoSchema
					.omit({ id: true, position: true, created_at: true })
					.partial(),
			})
		)
		.mutation(async opts => {
			const { input } = opts;
			const todo = await updateTodo({
				todoId: input.todoId,
				todo: input.partialTodo,
			});
			return todo;
		}),

	moveTodoBetweenPositions: publicProcedure
		.input(
			z.object({
				fromId: z.number(),
				toId: z.number(),
			})
		)
		.mutation(async opts => {
			const { input } = opts;
			const todo = await moveTodoBetweenPositions(input);
			return todo;
		}),
	deleteTodo: publicProcedure.input(z.object({ todoId: z.number() })).mutation(async opts => {
		const { input } = opts;
		await deleteTodo(input);
		return { success: true };
	}),
});
