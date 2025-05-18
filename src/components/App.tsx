import { useCallback, useState } from "react";
import { honoClient } from "../clients/hono.js";
import {
	DndContext,
	closestCenter,
	KeyboardSensor,
	PointerSensor,
	useSensor,
	useSensors,
	type DragEndEvent,
} from "@dnd-kit/core";
import {
	arrayMove,
	SortableContext,
	sortableKeyboardCoordinates,
	useSortable,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Switch } from "./Switch.js";
import type { SelectTodo } from "../db/schema/db-helper-types.js";
import { parse } from "superjson";
import type { InferRequestType, InferResponseType } from "hono/client";

async function fetchAllTodos() {
	const allTodosResponse = await honoClient.api.todos.$get({});
	if (!allTodosResponse.ok) throw new Error("Failed to fetch todos");
	type todosType = InferResponseType<typeof honoClient.api.todos.$get>["_type"];
	const allTodos = parse<todosType>(await allTodosResponse.text());
	return allTodos;
}

function App({ $todos }: { $todos: SelectTodo[] }) {
	const sensors = useSensors(
		useSensor(PointerSensor),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		})
	);
	const [headline, setHeadline] = useState("");
	const [description, setDescription] = useState("");
	const [onlyUnfinishedTodos, setOnlyUnfinishedTodos] = useState(false);
	const canCreateTodo = headline.length > 0 && description.length > 0;

	const [todos, setTodos] = useState($todos);

	const handleDoneChanged = useCallback(async (todo: SelectTodo) => {
		const response = await honoClient.api.todos[":todoId"].$patch({
			param: { todoId: todo.id.toString() },
			json: {
				done: !todo.done,
			},
		});
		if (!response.ok) throw new Error("Failed to toggle todo done status");
		const allTodos = await fetchAllTodos();
		setTodos(allTodos);
	}, []);
	const handleDragEnd = useCallback(async (event: DragEndEvent) => {
		const { active, over } = event;

		if (active.id !== over.id) {
			const fromId = active.id as number;
			const toId = over!.id as number;

			// const fromTodoIdx = todos.findIndex(todo => todo.id === fromId);
			// const toTodoIdx = todos.findIndex(todo => todo.id === toId);

			const response = await honoClient.api.todos["@arrayMove"].$patch({
				json: { toId, fromId },
			});
			if (!response.ok) throw new Error("Failed to swap todo positions");
			const allTodos = await fetchAllTodos();
			setTodos(allTodos);
		}
	}, []);
	const handleDelete = useCallback(async (todo: SelectTodo) => {
		const deleteTodoResponse = await honoClient.api.todos.$delete({
			json: { todoId: todo.id },
		});
		if (!deleteTodoResponse.ok) throw new Error("Failed to delete todo");
		const allTodos = await fetchAllTodos();
		setTodos(allTodos);
	}, []);
	const createTodo = useCallback(async () => {
		if (!canCreateTodo) return;

		const createdTodoResponse = await honoClient.api.todos.$post({
			json: {
				headline,
				description,
				done: false,
			},
		});

		if (!createdTodoResponse.ok) throw new Error("Failed to delete todo");
		const allTodos = await fetchAllTodos();
		setTodos(allTodos);

		setDescription("");
		setHeadline("");
	}, [canCreateTodo, description, headline]);

	return (
		<div className="app">
			<h1>Todo List</h1>
			<div className="card card__create">
				<div>Create a new todo</div>
				<div className="input-grow">
					<input
						type="text"
						placeholder="Enter the todo headline"
						value={headline}
						onChange={e => setHeadline(e.target.value)}
					/>
					<button
						className="button__add"
						onClick={() => createTodo()}
						disabled={!canCreateTodo}
					>
						Create &#x27A4;
					</button>
				</div>
				<textarea
					placeholder="Enter the todo description"
					value={description}
					onChange={e => setDescription(e.target.value)}
				></textarea>
			</div>

			<div>
				Only show not done todos &nbsp;
				<Switch
					round={true}
					size="small"
					checked={onlyUnfinishedTodos}
					onChange={() => setOnlyUnfinishedTodos(!onlyUnfinishedTodos)}
				></Switch>
			</div>
			<DndContext
				sensors={sensors}
				collisionDetection={closestCenter}
				onDragEnd={handleDragEnd}
			>
				<SortableContext
					items={todos.map(todo => todo.id)}
					strategy={verticalListSortingStrategy}
				>
					{todos
						.filter(t => (onlyUnfinishedTodos ? t.done === false : true))
						.map(todo => (
							<SortableTodo
								key={todo.id}
								todo={todo}
								onDoneChanged={handleDoneChanged}
								onDelete={handleDelete}
							/>
						))}
				</SortableContext>
			</DndContext>
		</div>
	);
}

export default App;
function SortableTodo({
	todo,
	onDoneChanged,
	onDelete,
}: {
	todo: SelectTodo;
	onDoneChanged: (todo: SelectTodo) => void;
	onDelete: (todo: SelectTodo) => void;
}) {
	const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
		id: todo.id,
		data: {
			position: todo.position,
		},
	});

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
	};

	const className = todo.done ? "card card__grab card__done" : "card card__grab";
	return (
		<div className={className} ref={setNodeRef} style={style}>
			<div className="card--left">
				<h3>{todo.headline}</h3>
				<div className="card--description">{todo.description} </div>
			</div>
			<div className="card--right">
				<Switch
					size="medium"
					round={true}
					checked={todo.done}
					onChange={() => onDoneChanged(todo)}
				></Switch>
				<button className="button__symbol button__danger" onClick={() => onDelete(todo)}>
					&#128465;
				</button>
				<button {...listeners} {...attributes} className="button__symbol button__handle">
					<svg viewBox="0 0 20 20" width="12">
						<path d="M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 14zm6-8a2 2 0 1 0-.001-4.001A2 2 0 0 0 13 6zm0 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 14z"></path>
					</svg>
				</button>
			</div>
		</div>
	);
}
