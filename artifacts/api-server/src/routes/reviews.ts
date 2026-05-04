import { Router } from "express";
import { requireAuth } from "../middlewares/supabaseAuthMiddleware";
import { db } from "@workspace/db";
import { reviewsTable, profilesTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

router.get("/listings/:listingId/reviews", async (req: any, res) => {
  try {
    const listingId = Number(req.params.listingId);
    const reviews = await db.select().from(reviewsTable).where(eq(reviewsTable.listingId, listingId));
    const enriched = await Promise.all(reviews.map(async (review) => {
      const [reviewerProfile] = await db.select().from(profilesTable).where(eq(profilesTable.clerkUserId, review.reviewerUserId));
      return { ...review, reviewerProfile: reviewerProfile || null };
    }));
    res.json(enriched);
  } catch (err) {
    req.log.error({ err }, "Failed to get reviews");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/listings/:listingId/reviews", requireAuth, async (req: any, res) => {
  try {
    const listingId = Number(req.params.listingId);
    const { rating, comment } = req.body;
    const [review] = await db.insert(reviewsTable).values({
      listingId,
      reviewerUserId: req.userId,
      rating: Number(rating),
      comment,
    }).returning();
    const [reviewerProfile] = await db.select().from(profilesTable).where(eq(profilesTable.clerkUserId, req.userId));
    res.status(201).json({ ...review, reviewerProfile: reviewerProfile || null });
  } catch (err) {
    req.log.error({ err }, "Failed to create review");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
