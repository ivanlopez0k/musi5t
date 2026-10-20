import { index, integer, pgTable, smallint, text, timestamp, unique, uuid } from "drizzle-orm/pg-core";

export const albums = pgTable("albums", {
  id: uuid("id").primaryKey().defaultRandom(),
  mbid: uuid("mbid").notNull().unique(), // MusicBrainz Release Group ID
  title: text("title").notNull(),
  artistName: text("artist_name").notNull(),
  releaseYear: integer("release_year"),
  defaultCoverUrl: text("default_cover_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const albumTracks = pgTable(
  "album_tracks",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    albumId: uuid("album_id")
      .notNull()
      .references(() => albums.id, { onDelete: "cascade" }),
    position: smallint("position").notNull(),
    title: text("title").notNull(),
    durationSeconds: integer("duration_seconds").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    unique("album_tracks_album_position_unique").on(table.albumId, table.position),
    index("idx_album_tracks_album_id").on(table.albumId, table.position),
  ]
);
