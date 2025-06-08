import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { Hono } from "hono";

import { cors } from "hono/cors";
import socketIOServer from "./socket-io-server.js";
import { reactRenderer } from "@hono/react-renderer";
import Island from "../config/islands/server.js";
import App from "../frontend/components/App.js";
import { getAllTodos } from "./db/services/TodoService.js";
import { setTimeout } from "node:timers/promises";
import { trpcServer } from "@hono/trpc-server";
import { appRouter } from "./trpc/index.js";

const app = new Hono();

/* register middleware */
app.use(cors({ origin: "*" }));
app.get("/static/*", serveStatic({ root: "./" }));

app.get(
	"/*",
	reactRenderer(
		({ children }) => {
			return (
				<html>
					<head>
						<link
							href="https://cdn.jsdelivr.net/npm/beercss@3.11.10/dist/cdn/beer.min.css"
							rel="stylesheet"
						/>
						<script
							type="module"
							src="https://cdn.jsdelivr.net/npm/beercss@3.11.10/dist/cdn/beer.min.js"
						></script>
						<script
							type="module"
							src="https://cdn.jsdelivr.net/npm/material-dynamic-colors@1.1.2/dist/cdn/material-dynamic-colors.min.js"
						></script>
						<link rel="stylesheet" href="/static/css/index.css" />
						<link rel="stylesheet" href="/static/build/client.css" />
						<meta name="viewport" content="width=device-width, initial-scale=1.0" />
					</head>
					<body>
						{children}
						<script type="module" src="/static/build/client.js"></script>
					</body>
				</html>
			);
		},
		{ docType: true }
	)
);

// slow down all api requests by 2 seconds
app.use("/trpc/*", async (c, next) => {
	console.log(`pause 2 seconds for`, c.req.path);
	await setTimeout(2000);
	await next();
});

app.use(
	"/trpc/*", // TODO: does this work with nested routes?
	// eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-call
	trpcServer({
		router: appRouter,
	})
);

/* adhoc routes */
app.get("/", async c => {
	const todos = await getAllTodos();
	return c.render(
		<>
			<header className="fill">
				<nav>
					<button className="circle transparent">
						<i>menu</i>
					</button>
					<h6>Todo List</h6>
				</nav>
			</header>
			<Island>
				<App $todos={todos} />
			</Island>
		</>
	);
});

/* start up server */
const port = 3000;
const server = serve({ fetch: app.fetch, port }, _info => {
	console.log(`Server started on http://localhost:${port}`);
});

/* register socket.io */
socketIOServer.attach(server);
