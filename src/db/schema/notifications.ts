import { boolean, index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { users } from "./users";
import { posts, postReplies } from "./posts";

export const notifications = pgTable(
  "notifications",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    recipientId: uuid("recipient_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    actorId: uuid("actor_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(), // 'like' | 'reply' | 'follow'
    postId: uuid("post_id").references(() => posts.id, { onDelete: "cascade" }),
    replyId: uuid("reply_id").references(() => postReplies.id, { onDelete: "cascade" }),
    read: boolean("read").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("idx_notifications_recipient_created").on(table.recipientId, table.createdAt.desc()),
    index("idx_notifications_recipient_read").on(table.recipientId, table.read),
  ]
);
