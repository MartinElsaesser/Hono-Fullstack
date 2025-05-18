import { hc, type InferRequestType } from "hono/client";
import type { ApiRoutes } from "../server.js";

export const honoClient = hc<ApiRoutes>("http://localhost:3000");
