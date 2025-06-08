import { arrayMove } from "@dnd-kit/sortable";
import { useCallback, useMemo } from "react";
import type { SelectTodo, InsertTodo } from "../../server/db/schema/db-helper-types.js";
import useSWR from "swr";
import { trpc } from "../clients/trpc.js";
export function useTodos($todos: SelectTodo[]) {
	const {
		data: todos,
		mutate,
		...rest
	} = useSWR(
		"fetchTodos",
		async () => {
			return trpc.getAllTodos.query();
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
					await trpc.deleteTodo.mutate({ todoId: todo.id });
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
					const newTodo = await trpc.createTodo.mutate({
						headline,
						description,
						done: false,
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
					await trpc.updateTodo.mutate({
						todoId: todo.id,
						partialTodo: { done: !todo.done },
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
					await trpc.moveTodoBetweenPositions.mutate({
						fromId,
						toId,
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
