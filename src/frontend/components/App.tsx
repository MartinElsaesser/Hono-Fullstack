import { useCallback, useState } from "react";
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
	SortableContext,
	sortableKeyboardCoordinates,
	useSortable,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Switch } from "./Switch.js";
import type { SelectTodo } from "../../server/db/schema/db-helper-types.js";

import "./App.css";
import { useTodos } from "../hooks/useTodos.js";

export default function App({ $todos }: { $todos: SelectTodo[] }) {
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
	const { optimisticTodos, createTodo, deleteTodo, toggleTodoDone, switchTodoPosition } =
		useTodos($todos);

	const handleDragEnd = useCallback(
		(event: DragEndEvent) => {
			const { active, over } = event;
			console.log("test");

			if (over?.id && active.id !== over.id) {
				const fromId = active.id as number;
				const toId = over.id as number;
				switchTodoPosition({ fromId, toId });
			}
		},
		[switchTodoPosition]
	);

	return (
		<main className="responsive no-scroll">
			<h1 className="small center-align">Todo List</h1>
			<fieldset>
				<legend>Create a new todo</legend>
				<div className="field small border label">
					<input value={headline} onChange={e => setHeadline(e.target.value)} />
					<label>Todo Headline</label>
				</div>
				<div className="field small border label textarea">
					<textarea
						value={description}
						onChange={e => setDescription(e.target.value)}
					></textarea>
					<label>Todo Description</label>
					{/* <span className="helper">Enter the todo description</span> */}
				</div>
				<button
					className="responsive small-round no-margin"
					onClick={() => {
						if (!canCreateTodo) return;
						setDescription("");
						setHeadline("");
						createTodo({ description, headline });
					}}
					disabled={!canCreateTodo}
				>
					Create new todo
					<i className="small">arrow_right</i>
				</button>
			</fieldset>

			<div className="field middle-align no-margin">
				<div className="right-margin">
					<div>Only show unfinished todos</div>
				</div>
				<Switch
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
					items={optimisticTodos.map(todo => todo.id)}
					strategy={verticalListSortingStrategy}
				>
					{optimisticTodos
						.filter(t => (onlyUnfinishedTodos ? t.done === false : true))
						.map(todo => (
							<SortableTodo
								key={todo.id}
								todo={todo}
								onDoneChanged={todo => toggleTodoDone(todo)}
								onDelete={todo => deleteTodo(todo)}
							/>
						))}
				</SortableContext>
			</DndContext>
		</main>
	);
}

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

	const className = todo.done ? "medium-opacity row" : "row";
	return (
		<div className={className} ref={setNodeRef} style={style}>
			<div className="max">
				<h4 className="small">{todo.headline}</h4>
				<pre className="no-styles">{todo.description} </pre>
			</div>

			<nav className="group no-space">
				<Switch checked={todo.done} onChange={() => onDoneChanged(todo)}></Switch>
				<button className="no-round error small" onClick={() => onDelete(todo)}>
					<i>delete</i>
				</button>
				<button
					className="no-round secondary small no-touch-action"
					{...listeners}
					{...attributes}
				>
					<i>drag_indicator</i>
				</button>
			</nav>
		</div>
	);
}
