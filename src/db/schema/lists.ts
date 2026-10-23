import { boolean, index, pgTable, smallint, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { users } from "./users";
import { albums } from "./albums";

export const userLists = pgTable(
  "user_lists",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description"),
    isPublic: boolean("is_public").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("idx_user_lists_user_id").on(table.userId),
    index("idx_user_lists_created_at").on(table.createdAt),
    index("idx_user_lists_public_created_at").on(table.isPublic, table.createdAt),
  ]
);

export const userListItems = pgTable(
  "user_list_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    listId: uuid("list_id")
      .notNull()
      .references(() => userLists.id, { onDelete: "cascade" }),
    albumId: uuid("album_id")
      .notNull()
      .references(() => albums.id, { onDelete: "cascade" }),
    position: smallint("position").notNull(),
    notes: text("notes"),
    coverUrl: text("cover_url"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("user_list_items_list_pos_idx").on(table.listId, table.position),
    index("idx_user_list_items_list_id").on(table.listId),
    index("idx_user_list_items_album_id").on(table.albumId),
  ]
);
