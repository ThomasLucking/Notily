import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import type * as schema from "./schema";

let _db: PostgresJsDatabase<typeof schema> | null = null;

export async function getDb() {
	if (!_db) {
		const connectionString = process.env.DATABASE_URL;
		if (!connectionString) {
			throw new Error("DATABASE_URL environment variable is required");
		}
		const { drizzle } = await import("drizzle-orm/postgres-js");
		const postgres = (await import("postgres")).default;
		const s = await import("./schema");
		const client = postgres(connectionString);
		_db = drizzle(client, { schema: s });
	}
	return _db;
}
