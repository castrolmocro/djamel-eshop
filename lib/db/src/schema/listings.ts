import { pgTable, serial, text, boolean, integer, numeric, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { categoriesTable } from "./categories";

export const listingsTable = pgTable("listings", {
  id: serial("id").primaryKey(),
  sellerUserId: text("seller_user_id").notNull(),
  categoryId: integer("category_id").references(() => categoriesTable.id),
  titleAr: text("title_ar").notNull(),
  titleFr: text("title_fr"),
  titleEn: text("title_en"),
  descriptionAr: text("description_ar").notNull(),
  descriptionFr: text("description_fr"),
  descriptionEn: text("description_en"),
  price: numeric("price", { precision: 12, scale: 2 }),
  currency: text("currency").notNull().default("DZD"),
  listingType: text("listing_type").notNull().default("product"),
  condition: text("condition"),
  images: text("images").array().notNull().default([]),
  wilaya: text("wilaya").notNull(),
  city: text("city"),
  isActive: boolean("is_active").notNull().default(true),
  isFeatured: boolean("is_featured").notNull().default(false),
  viewCount: integer("view_count").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertListingSchema = createInsertSchema(listingsTable).omit({ id: true, createdAt: true, updatedAt: true, viewCount: true });
export type InsertListing = z.infer<typeof insertListingSchema>;
export type Listing = typeof listingsTable.$inferSelect;
