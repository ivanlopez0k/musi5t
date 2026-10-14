import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { albums } from "./albums";

export const songs = pgTable("songs", {
  id: uuid("id").primaryKey().defaultRandom(),
  mbid: uuid("mbid").notNull().unique(), // MusicBrainz Recording ID
  title: text("title").notNull(),
  artistName: text("artist_name").notNull(),
  albumId: uuid("album_id").references(() => albums.id, { onDelete: "set null" }),
  coverUrl: text("cover_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
