import { Router } from "express";
import { requireAuth } from "../middlewares/supabaseAuthMiddleware";
import { db } from "@workspace/db";
import { listingsTable, profilesTable, categoriesTable, reviewsTable } from "@workspace/db";
import { eq, and, gte, lte, ilike, or, sql, desc } from "drizzle-orm";

const router = Router();

async function enrichListing(listing: any) {
  const [sellerProfile] = await db.select().from(profilesTable).where(eq(profilesTable.clerkUserId, listing.sellerUserId));
  let category = null;
  if (listing.categoryId) {
    const [cat] = await db.select().from(categoriesTable).where(eq(categoriesTable.id, listing.categoryId));
    category = cat || null;
  }
  const reviews = await db.select().from(reviewsTable).where(eq(reviewsTable.listingId, listing.id));
  const reviewCount = reviews.length;
  const averageRating = reviewCount > 0 ? reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviewCount : null;
  return { ...listing, sellerProfile: sellerProfile || null, category, reviewCount, averageRating };
}

router.get("/listings/featured", async (req: any, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 8, 50);
    const listings = await db.select().from(listingsTable)
      .where(and(eq(listingsTable.isActive, true), eq(listingsTable.isFeatured, true)))
      .orderBy(desc(listingsTable.createdAt))
      .limit(limit);
    const enriched = await Promise.all(listings.map(enrichListing));
    res.json(enriched);
  } catch (err) {
    req.log.error({ err }, "Failed to get featured listings");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/listings/nearby", async (req: any, res) => {
  try {
    const { wilaya, city, limit: limitStr } = req.query as any;
    if (!wilaya) return res.status(400).json({ error: "wilaya is required" });
    const limit = Math.min(Number(limitStr) || 12, 50);
    const conditions: any[] = [eq(listingsTable.isActive, true), eq(listingsTable.wilaya, wilaya)];
    if (city) conditions.push(eq(listingsTable.city, city));
    const listings = await db.select().from(listingsTable)
      .where(and(...conditions))
      .orderBy(desc(listingsTable.createdAt))
      .limit(limit);
    const enriched = await Promise.all(listings.map(enrichListing));
    res.json(enriched);
  } catch (err) {
    req.log.error({ err }, "Failed to get nearby listings");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/listings/my", requireAuth, async (req: any, res) => {
  try {
    const listings = await db.select().from(listingsTable)
      .where(eq(listingsTable.sellerUserId, req.userId))
      .orderBy(desc(listingsTable.createdAt));
    const enriched = await Promise.all(listings.map(enrichListing));
    res.json(enriched);
  } catch (err) {
    req.log.error({ err }, "Failed to get my listings");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/listings", async (req: any, res) => {
  try {
    const { categoryId, wilaya, city, minPrice, maxPrice, search, listingType, page: pageStr, limit: limitStr } = req.query as any;
    const page = Math.max(1, Number(pageStr) || 1);
    const limit = Math.min(Number(limitStr) || 20, 100);
    const offset = (page - 1) * limit;

    const conditions: any[] = [eq(listingsTable.isActive, true)];
    if (categoryId) conditions.push(eq(listingsTable.categoryId, Number(categoryId)));
    if (wilaya) conditions.push(eq(listingsTable.wilaya, wilaya));
    if (city) conditions.push(eq(listingsTable.city, city));
    if (listingType) conditions.push(eq(listingsTable.listingType, listingType));
    if (minPrice) conditions.push(gte(listingsTable.price, minPrice));
    if (maxPrice) conditions.push(lte(listingsTable.price, maxPrice));
    if (search) {
      conditions.push(or(
        ilike(listingsTable.titleAr, `%${search}%`),
        ilike(listingsTable.titleFr, `%${search}%`),
        ilike(listingsTable.titleEn, `%${search}%`),
        ilike(listingsTable.descriptionAr, `%${search}%`),
      ));
    }

    const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(listingsTable).where(and(...conditions));
    const total = Number(count);
    const listings = await db.select().from(listingsTable)
      .where(and(...conditions))
      .orderBy(desc(listingsTable.createdAt))
      .limit(limit)
      .offset(offset);
    const enriched = await Promise.all(listings.map(enrichListing));
    res.json({ listings: enriched, total, page, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    req.log.error({ err }, "Failed to list listings");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/listings/:listingId", async (req: any, res) => {
  try {
    const id = Number(req.params.listingId);
    const [listing] = await db.select().from(listingsTable).where(eq(listingsTable.id, id));
    if (!listing) return res.status(404).json({ error: "Not found" });
    await db.update(listingsTable).set({ viewCount: sql`${listingsTable.viewCount} + 1` }).where(eq(listingsTable.id, id));
    const enriched = await enrichListing(listing);
    res.json(enriched);
  } catch (err) {
    req.log.error({ err }, "Failed to get listing");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/listings", requireAuth, async (req: any, res) => {
  try {
    const body = req.body;
    const [listing] = await db.insert(listingsTable).values({
      sellerUserId: req.userId,
      ...body,
      images: body.images || [],
    }).returning();
    const enriched = await enrichListing(listing);
    res.status(201).json(enriched);
  } catch (err) {
    req.log.error({ err }, "Failed to create listing");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/listings/:listingId", requireAuth, async (req: any, res) => {
  try {
    const id = Number(req.params.listingId);
    const [listing] = await db.select().from(listingsTable).where(eq(listingsTable.id, id));
    if (!listing) return res.status(404).json({ error: "Not found" });
    if (listing.sellerUserId !== req.userId) return res.status(403).json({ error: "Forbidden" });
    const [updated] = await db.update(listingsTable).set({ ...req.body, updatedAt: new Date() }).where(eq(listingsTable.id, id)).returning();
    const enriched = await enrichListing(updated);
    res.json(enriched);
  } catch (err) {
    req.log.error({ err }, "Failed to update listing");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/listings/:listingId", requireAuth, async (req: any, res) => {
  try {
    const id = Number(req.params.listingId);
    const [listing] = await db.select().from(listingsTable).where(eq(listingsTable.id, id));
    if (!listing) return res.status(404).json({ error: "Not found" });
    if (listing.sellerUserId !== req.userId) return res.status(403).json({ error: "Forbidden" });
    await db.delete(listingsTable).where(eq(listingsTable.id, id));
    res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "Failed to delete listing");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
