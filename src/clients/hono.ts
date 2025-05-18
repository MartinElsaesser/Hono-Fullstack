import {
	hc,
	type ClientResponse,
	type InferRequestType,
	type InferResponseType,
} from "hono/client";
import type { ApiRoutes } from "../server.js";
import { parse } from "superjson";

export const honoClient = hc<ApiRoutes>("http://localhost:3000");

type HonoEndpoint = (args: any, options: any | undefined) => Promise<ClientResponse<unknown>>;

export async function fetchApi<TEndpoint extends HonoEndpoint>({
	endpoint,
	input,
}: {
	endpoint: TEndpoint;
	input: InferRequestType<TEndpoint>;
}): Promise<InferResponseType<TEndpoint>["_type"]> {
	const res = await endpoint(input, undefined);

	if (!res.ok) throw new Error("Data fetching error");
	type todosType = InferResponseType<typeof endpoint>["_type"];
	const allTodos = parse<todosType>(await res.text());
	return allTodos;
}
