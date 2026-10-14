import { integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const albums = pgTable("albums", {
  id: uuid("id").primaryKey().defaultRandom(),
  mbid: uuid("mbid").notNull().unique(), // MusicBrainz Release Group ID
  title: text("title").notNull(),
  artistName: text("artist_name").notNull(),
  releaseYear: integer("release_year"),
  defaultCoverUrl: text("default_cover_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
