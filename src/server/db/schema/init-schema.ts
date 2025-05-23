import * as fs from "fs";
import { pool } from "../db.js";

// loads DDL statements from schema.sql file
// and runs them on the database

void (async function connectToDbAndUploadSchema() {
	const client = await pool.connect();

	const sql = fs.readFileSync(`${import.meta.dirname}/schema.sql`, "utf8");

	await client.query(sql);
	client.release();
	await pool.end();

	console.log("Initialized Database Schema");
})();
