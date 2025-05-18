import {
	hc,
	type ClientResponse,
	type InferRequestType,
	type InferResponseType,
} from "hono/client";
import type { ApiRoutes } from "../server.js";
import { parse } from "superjson";
import type { InferBrandedString } from "../routers/apiRouter.js";

export const honoClient = hc<ApiRoutes>("http://localhost:3000");

type HonoEndpoint = (
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	args: any,
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	options: any | undefined
) => Promise<ClientResponse<unknown>>;

export async function fetchApi<TEndpoint extends HonoEndpoint>({
	endpoint,
	...input
}: {
	endpoint: TEndpoint;
} & InferRequestType<TEndpoint>): Promise<InferBrandedString<InferResponseType<TEndpoint>>> {
	const res = await endpoint(input, undefined);

	if (!res.ok) throw new Error("Data fetching error");
	type todosType = InferBrandedString<InferResponseType<TEndpoint>>;
	const allTodos = parse<todosType>(await res.text());
	return allTodos;
}
