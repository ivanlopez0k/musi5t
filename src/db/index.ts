import { drizzle } from "drizzle-orm/postgres-js";
import { sql } from "drizzle-orm";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/musi5t";

// For serverless / dev hot-reload singleton connection
const globalForDb = globalThis as unknown as {
  conn: postgres.Sql | undefined;
  phase3Initialized?: boolean;
};

const conn = globalForDb.conn ?? postgres(connectionString);
if (process.env.NODE_ENV !== "production") globalForDb.conn = conn;

export const db = drizzle(conn, { schema });

export async function ensurePhase3Tables(): Promise<void> {
  if (globalForDb.phase3Initialized) return;
  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS post_replies (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        post_id uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
        author_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        body text NOT NULL,
        created_at timestamptz NOT NULL DEFAULT now(),
        deleted_at timestamptz
      );
    `);
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS album_ratings (
        user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        album_id uuid NOT NULL REFERENCES albums(id) ON DELETE CASCADE,
        score smallint NOT NULL CHECK (score >= 1 AND score <= 10),
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now(),
        PRIMARY KEY (user_id, album_id)
      );
    `);
    globalForDb.phase3Initialized = true;
  } catch {
    // Ignore if DB is offline during build/static analysis
  }
}

