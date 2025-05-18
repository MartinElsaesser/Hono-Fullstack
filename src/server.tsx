import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { Hono } from "hono";
import socketIOServer from "./socket-io-server.js";
import { reactRenderer } from "@hono/react-renderer";
import TodoApp, { type Todo } from "./components/TodoApp.js";
import Counter from "./components/Counter.js";
import Island from "./islands/server.js";
import apiRouter from "./routers/apiRouter.js";
import App from "./components/App.js";
import { getAllTodos } from "./db/services/TodoService.js";

const app = new Hono();

/* register middleware */
app.get("/static/*", serveStatic({ root: "./" }));

app.get(
	"/*",
	reactRenderer(
		({ children }) => {
			return (
				<html>
					<head>
						<link rel="stylesheet" href="/static/css/index.css" />
					</head>
					<body>
						{children}
						<script type="module" src="/static/js/build/client.js"></script>
					</body>
				</html>
			);
		},
		{ docType: true }
	)
);

/* register routers */
const apiRoutes = app.route("/api", apiRouter);

/* adhoc routes */
app.get("/", async c => {
	const todos = await getAllTodos();
	return c.render(
		<div id="root">
			<Island>
				<App $todos={todos} />
			</Island>
		</div>
	);
});

app.get("/todos", c => {
	const todos: Todo[] = [
		{ head: "Milk the cow", done: false },
		{ head: "Watch Youtube", done: false },
		{ head: "Build todo app", done: false },
	];
	return c.render(
		<Island>
			<TodoApp $todos={todos}></TodoApp>
		</Island>
	);
});

/* start up server */
const port = 3000;
const server = serve({ fetch: app.fetch, port }, info => {
	console.log(`Server started on http://localhost:${port}`);
});

/* register socket.io */
socketIOServer.attach(server);

export type ApiRoutes = typeof apiRoutes;
