import { betterAuth } from "better-auth";
import { db } from "../server/db/db.js";

export const auth = betterAuth({
	database: {
		db: db,
		type: "postgres",
	},
	emailAndPassword: {
		enabled: true,
	},
});
