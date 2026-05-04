import { pgTable, serial, text, boolean, jsonb, timestamp, integer, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const profilesTable = pgTable("profiles", {
  id: serial("id").primaryKey(),
  clerkUserId: text("clerk_user_id").notNull().unique(),
  displayName: text("display_name").notNull(),
  bio: text("bio"),
  avatarUrl: text("avatar_url"),
  coverImageUrl: text("cover_image_url"),
  phone: text("phone"),
  wilaya: text("wilaya"),
  city: text("city"),
  country: text("country").notNull().default("DZ"),
  website: text("website"),
  socialLinks: jsonb("social_links").$type<{
    facebook?: string;
    instagram?: string;
    twitter?: string;
    whatsapp?: string;
  }>(),
  preferredLanguage: text("preferred_language").notNull().default("ar"),
  isStore: boolean("is_store").notNull().default(false),
  isVerified: boolean("is_verified").notNull().default(false),
  storeName: text("store_name"),
  storeDescription: text("store_description"),
  totalSales: integer("total_sales").notNull().default(0),
  averageRating: numeric("average_rating", { precision: 3, scale: 2 }),
  reviewCount: integer("review_count").notNull().default(0),
  preferences: jsonb("preferences"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertProfileSchema = createInsertSchema(profilesTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertProfile = z.infer<typeof insertProfileSchema>;
export type Profile = typeof profilesTable.$inferSelect;
