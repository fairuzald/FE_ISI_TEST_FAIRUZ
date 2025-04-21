import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

const defaultDatabaseUrl =
  "postgres://postgres:postgres@localhost:5437/todoapp";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || defaultDatabaseUrl,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on("error", (err) => {
  console.error("Unexpected error on idle client", err);
});

export const db = drizzle(pool, { schema });

export * from "./schema";
