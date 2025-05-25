// source: https://nodejs.org/api/module.html#enabling
import { register } from "node:module";
register("./css-hook.mjs", import.meta.url);
