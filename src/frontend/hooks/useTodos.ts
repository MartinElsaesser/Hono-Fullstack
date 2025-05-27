import { arrayMove } from "@dnd-kit/sortable";
import { useCallback, useMemo } from "react";
import type { SelectTodo, InsertTodo } from "../../server/db/schema/db-helper-types.js";
import { fetchApi, honoClient } from "../clients/hono.js";
import useSWR from "swr";
export function useTodos($todos: SelectTodo[]) {
	const {
		data: todos,
		mutate,
		...rest
	} = useSWR(
		"fetchTodos",
		async () => {
			return fetchApi({
				endpoint: honoClient.api.todos.$get,
			});
		},
		{
			fallbackData: $todos,
			revalidateOnMount: false,
		}
	);

	const defaultMutateOptions = useMemo(
		() => ({
			populateCache: false,
			revalidate: true,
		}),
		[]
	);

	const deleteTodo = useCallback(
		async (todo: SelectTodo) => {
			// start
			const optimisticData = todos.filter(t => t.id !== todo.id);

			await mutate(
				async () => {
					await fetchApi({
						endpoint: honoClient.api.todos.$delete,
						json: { todoId: todo.id },
					});
					return undefined;
				},
				{
					optimisticData,
					...defaultMutateOptions,
				}
			);
			// end
		},
		[defaultMutateOptions, mutate, todos]
	);
	const createTodo = useCallback(
		async ({
			description,
			headline,
			onSuccess,
			onError,
		}: Pick<InsertTodo, "description" | "headline"> & {
			onSuccess?: (newTodo: SelectTodo) => void;
			onError?: (error: unknown) => void;
		}) => {
			// start
			const optimisticTodos = structuredClone(todos);
			optimisticTodos.push({
				id: optimisticTodos.length + 1,
				created_at: new Date(),
				description,
				done: false,
				headline,
				position: todos.length + 1,
			});

			await mutate(
				async () => {
					const newTodo = await fetchApi({
						endpoint: honoClient.api.todos.$post,
						json: {
							headline,
							description,
							done: false,
						},
					});

					if (onSuccess) onSuccess(newTodo);
					return undefined;
				},
				{
					optimisticData: optimisticTodos,
					rollbackOnError(error) {
						if (onError) onError(error);
						return true;
					},
					...defaultMutateOptions,
				}
			);
			// end
		},
		[defaultMutateOptions, mutate, todos]
	);
	const toggleTodoDone = useCallback(
		async (todo: SelectTodo) => {
			// start
			const optimisticData = todos.map(t => ({
				...t,
				done: t.id == todo.id ? !t.done : t.done,
			}));
			await mutate(
				async () => {
					await fetchApi({
						endpoint: honoClient.api.todos[":todoId"].$patch,
						param: { todoId: todo.id.toString() },
						json: {
							done: !todo.done,
						},
					});
					return undefined;
				},
				{
					optimisticData,
					...defaultMutateOptions,
				}
			);
			// end
		},
		[defaultMutateOptions, mutate, todos]
	);
	const switchTodoPosition = useCallback(
		async ({ fromId, toId }: { fromId: number; toId: number }) => {
			// start
			const fromTodoIdx = todos.findIndex(todo => todo.id === fromId);
			const toTodoIdx = todos.findIndex(todo => todo.id === toId);

			await mutate(
				async () => {
					await fetchApi({
						endpoint: honoClient.api.todos["@arrayMove"].$patch,
						json: { toId, fromId },
					});
					return undefined;
				},
				{
					optimisticData: arrayMove(todos, fromTodoIdx, toTodoIdx),
					...defaultMutateOptions,
				}
			);
			// end
		},
		[defaultMutateOptions, mutate, todos]
	);

	return {
		...rest,
		todos,
		createTodo,
		deleteTodo,
		toggleTodoDone,
		switchTodoPosition,
	};
}
