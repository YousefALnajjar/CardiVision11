import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

let poolInstance: pg.Pool | null = null;

export function getPool(): pg.Pool {
  if (!poolInstance) {
    const dbUrl = process.env.DATABASE_URL;

    if (!dbUrl) {
      console.warn("⚠️ DATABASE_URL environment variable is missing. PostgreSQL pool cannot be initialized yet.");
      throw new Error("DATABASE_URL environment variable is required to connect to PostgreSQL.");
    }

    poolInstance = new Pool({
      connectionString: dbUrl,
      ssl: dbUrl.includes("sslmode=disable") ? false : { rejectUnauthorized: false },
      connectionTimeoutMillis: 10000,
      idleTimeoutMillis: 30000
    });
  }
  return poolInstance;
}

let dbInstance: ReturnType<typeof drizzle<typeof schema>> | null = null;

export function getDb() {
  if (!dbInstance) {
    const pool = getPool();
    dbInstance = drizzle(pool, { schema });
  }
  return dbInstance;
}

export { schema };
