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

const maxConnections = process.env.DB_MAX_CONNECTIONS
  ? parseInt(process.env.DB_MAX_CONNECTIONS, 10)
  : process.env.NODE_ENV === "production"
    ? 25
    : 10;

const conn =
  globalForDb.conn ??
  postgres(connectionString, {
    max: maxConnections,
    idle_timeout: 20,
    connect_timeout: 10,
    prepare: false,
  });
if (process.env.NODE_ENV !== "production") globalForDb.conn = conn;

export const db = drizzle(conn, { schema });

export async function ensureArtistTables(): Promise<void> {
  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS artist_follows (
        user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        artist_name text NOT NULL,
        created_at timestamptz NOT NULL DEFAULT now(),
        PRIMARY KEY (user_id, artist_name)
      );
    `);
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS artist_ratings (
        user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        artist_name text NOT NULL,
        score smallint NOT NULL CHECK (score >= 1 AND score <= 10),
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now(),
        PRIMARY KEY (user_id, artist_name)
      );
    `);
  } catch {
    // Ignore if DB is offline during build/static analysis
  }
}

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
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS album_tracks (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        album_id uuid NOT NULL REFERENCES albums(id) ON DELETE CASCADE,
        position smallint NOT NULL,
        title text NOT NULL,
        duration_seconds integer NOT NULL DEFAULT 0,
        created_at timestamptz NOT NULL DEFAULT now(),
        UNIQUE (album_id, position)
      );
      CREATE INDEX IF NOT EXISTS idx_album_tracks_album_id ON album_tracks (album_id, position);
    `);
    await ensureArtistTables();
    await ensureAccountTokenTables();
    await ensureListTables();
    globalForDb.phase3Initialized = true;
  } catch {
    // Ignore if DB is offline during build/static analysis
  }
}

export async function ensureListTables(): Promise<void> {
  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS user_lists (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title text NOT NULL,
        description text,
        is_public boolean NOT NULL DEFAULT true,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now()
      );
      CREATE INDEX IF NOT EXISTS idx_user_lists_user_id ON user_lists (user_id);
      CREATE INDEX IF NOT EXISTS idx_user_lists_created_at ON user_lists (created_at);
      CREATE INDEX IF NOT EXISTS idx_user_lists_public_created_at ON user_lists (is_public, created_at);

      CREATE TABLE IF NOT EXISTS user_list_items (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        list_id uuid NOT NULL REFERENCES user_lists(id) ON DELETE CASCADE,
        album_id uuid NOT NULL REFERENCES albums(id) ON DELETE CASCADE,
        position smallint NOT NULL,
        notes text,
        cover_url text,
        created_at timestamptz NOT NULL DEFAULT now()
      );
      CREATE UNIQUE INDEX IF NOT EXISTS user_list_items_list_pos_idx ON user_list_items (list_id, position);
      CREATE INDEX IF NOT EXISTS idx_user_list_items_list_id ON user_list_items (list_id);
      CREATE INDEX IF NOT EXISTS idx_user_list_items_album_id ON user_list_items (album_id);
    `);
  } catch {
    // Ignore if DB is offline during build/static analysis
  }
}

export async function ensureAccountTokenTables(): Promise<void> {
  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS account_tokens (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token_hash text NOT NULL,
        type text NOT NULL,
        expires_at timestamptz NOT NULL,
        used_at timestamptz,
        created_at timestamptz NOT NULL DEFAULT now()
      );
      CREATE INDEX IF NOT EXISTS idx_account_tokens_lookup ON account_tokens (token_hash, type);
    `);
  } catch {
    // Ignore if DB is offline during build/static analysis
  }
}

