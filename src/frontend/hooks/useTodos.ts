import { arrayMove } from "@dnd-kit/sortable";
import { useState, useOptimistic, useCallback, startTransition } from "react";
import type { SelectTodo, InsertTodo } from "../../server/db/schema/db-helper-types.js";
import { fetchApi, honoClient } from "../clients/hono.js";

export function useTodos($todos: SelectTodo[]) {
	// initialize state
	const [todos, setTodos] = useState($todos);
	const [optimisticTodos, setOptimisticTodos] = useOptimistic<SelectTodo[], SelectTodo[]>(
		todos,
		(_state, newOptimisticTodos) => newOptimisticTodos
	);

	// define functions
	const deleteTodo = useCallback(
		(todo: SelectTodo) => {
			startTransition(async () => {
				setOptimisticTodos(optimisticTodos.filter(t => t.id !== todo.id));
				await fetchApi({
					endpoint: honoClient.api.todos.$delete,
					json: { todoId: todo.id },
				});
				const allTodos = await fetchApi({ endpoint: honoClient.api.todos.$get });

				startTransition(() => {
					setTodos(allTodos);
				});
			});
		},
		[optimisticTodos, setOptimisticTodos]
	);
	const createTodo = useCallback(
		({
			description,
			headline,
			onSuccess,
			onError,
		}: Pick<InsertTodo, "description" | "headline"> & {
			onSuccess?: (newTodo: SelectTodo) => void;
			onError?: (error: Error) => void;
		}) => {
			startTransition(async () => {
				setOptimisticTodos([
					...optimisticTodos,
					{
						created_at: new Date(),
						description,
						done: false,
						headline,
						id: optimisticTodos.length + 1,
						position: optimisticTodos.length + 1,
					},
				]);

				let newTodo;
				try {
					newTodo = await fetchApi({
						endpoint: honoClient.api.todos.$post,
						json: {
							headline,
							description,
							done: false,
						},
					});
				} catch (unknownError) {
					const error =
						unknownError instanceof Error ? unknownError : (
							new Error("Could not create Todo")
						);
					if (onError) onError(error);
					throw error;
				}

				const allTodos = await fetchApi({ endpoint: honoClient.api.todos.$get });
				startTransition(() => {
					setTodos(allTodos);
					if (onSuccess) onSuccess(newTodo);
				});
			});
		},
		[setOptimisticTodos, optimisticTodos]
	);
	const toggleTodoDone = useCallback(
		(todo: SelectTodo) => {
			const newOptimisticTodos = optimisticTodos.map(t =>
				t.id === todo.id ? { ...t, done: !t.done } : t
			);
			startTransition(async () => {
				setOptimisticTodos(newOptimisticTodos);
				await fetchApi({
					endpoint: honoClient.api.todos[":todoId"].$patch,
					param: { todoId: todo.id.toString() },
					json: {
						done: !todo.done,
					},
				});
				const allTodos = await fetchApi({ endpoint: honoClient.api.todos.$get });
				startTransition(() => {
					setTodos(allTodos);
				});
			});
		},
		[optimisticTodos, setOptimisticTodos]
	);
	const switchTodoPosition = useCallback(
		({ fromId, toId }: { fromId: number; toId: number }) => {
			startTransition(async () => {
				const fromTodoIdx = optimisticTodos.findIndex(todo => todo.id === fromId);
				const toTodoIdx = optimisticTodos.findIndex(todo => todo.id === toId);
				console.log(arrayMove(optimisticTodos, fromTodoIdx, toTodoIdx));

				setOptimisticTodos(arrayMove(optimisticTodos, fromTodoIdx, toTodoIdx));
				await fetchApi({
					endpoint: honoClient.api.todos["@arrayMove"].$patch,
					json: { toId, fromId },
				});
				const allTodos = await fetchApi({
					endpoint: honoClient.api.todos.$get,
				});
				startTransition(() => {
					setTodos(allTodos);
				});
			});
		},
		[optimisticTodos, setOptimisticTodos]
	);

	return {
		optimisticTodos,
		createTodo,
		deleteTodo,
		toggleTodoDone,
		switchTodoPosition,
	};
}
