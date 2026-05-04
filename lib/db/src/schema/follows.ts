import { pgTable, serial, text, timestamp, unique } from "drizzle-orm/pg-core";

export const followsTable = pgTable("follows", {
  id: serial("id").primaryKey(),
  followerUserId: text("follower_user_id").notNull(),
  followingUserId: text("following_user_id").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (t) => [
  unique().on(t.followerUserId, t.followingUserId),
]);

export type Follow = typeof followsTable.$inferSelect;
