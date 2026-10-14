import { check, pgTable, smallint, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { users } from "./users";
import { albums } from "./albums";
import { songs } from "./songs";

export const userTopAlbums = pgTable(
  "user_top_albums",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    albumId: uuid("album_id")
      .notNull()
      .references(() => albums.id, { onDelete: "cascade" }),
    position: smallint("position").notNull(),
    coverReleaseMbid: uuid("cover_release_mbid"), // Selected edition MBID
    coverUrl: text("cover_url").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("user_top_albums_user_pos_idx").on(table.userId, table.position),
    uniqueIndex("user_top_albums_user_album_idx").on(table.userId, table.albumId),
    check("valid_album_position", sql`${table.position} >= 1 AND ${table.position} <= 5`),
  ]
);

export const userTopSongs = pgTable(
  "user_top_songs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    songId: uuid("song_id")
      .notNull()
      .references(() => songs.id, { onDelete: "cascade" }),
    position: smallint("position").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("user_top_songs_user_pos_idx").on(table.userId, table.position),
    uniqueIndex("user_top_songs_user_song_idx").on(table.userId, table.songId),
    check("valid_song_position", sql`${table.position} >= 1 AND ${table.position} <= 5`),
  ]
);
