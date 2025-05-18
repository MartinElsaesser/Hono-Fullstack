import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { Hono } from "hono";

import { cors } from "hono/cors";
import socketIOServer from "./socket-io-server.js";
import { reactRenderer } from "@hono/react-renderer";
import Island from "../config/islands/server.js";
import apiRouter from "./routers/apiRouter.js";
import App from "../frontend/components/App.js";
import { getAllTodos } from "./db/services/TodoService.js";
import { setTimeout } from "node:timers/promises";

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

// slow down all api requests by 2 seconds
app.use("/api/*", async (_c, next) => {
	console.log("wait");
	await setTimeout(2000);
	await next();
});

/* register routers */
const _apiRoutes = app.route("/api", apiRouter);

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

/* start up server */
const port = 3000;
const server = serve({ fetch: app.fetch, port }, _info => {
	console.log(`Server started on http://localhost:${port}`);
});

/* register socket.io */
socketIOServer.attach(server);

export type ApiRoutes = typeof _apiRoutes;
