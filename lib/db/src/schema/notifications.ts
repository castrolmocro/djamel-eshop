import { pgTable, serial, text, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";

export const notificationsTable = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  type: text("type").notNull(),
  titleAr: text("title_ar").notNull(),
  titleFr: text("title_fr"),
  titleEn: text("title_en"),
  bodyAr: text("body_ar"),
  bodyFr: text("body_fr"),
  bodyEn: text("body_en"),
  fromUserId: text("from_user_id"),
  fromUserName: text("from_user_name"),
  fromUserAvatar: text("from_user_avatar"),
  linkUrl: text("link_url"),
  isRead: boolean("is_read").notNull().default(false),
  meta: jsonb("meta"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type Notification = typeof notificationsTable.$inferSelect;
