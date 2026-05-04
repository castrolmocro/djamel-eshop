import { Router } from "express";
import { requireAuth } from "../middlewares/supabaseAuthMiddleware";
import { db } from "@workspace/db";
import { ordersTable, listingsTable, profilesTable } from "@workspace/db";
import { eq, or } from "drizzle-orm";

const router = Router();

async function enrichOrder(order: any) {
  let listing = null;
  if (order.listingId) {
    const [l] = await db.select().from(listingsTable).where(eq(listingsTable.id, order.listingId));
    listing = l || null;
  }
  const [buyerProfile] = await db.select().from(profilesTable).where(eq(profilesTable.clerkUserId, order.buyerUserId));
  const [sellerProfile] = await db.select().from(profilesTable).where(eq(profilesTable.clerkUserId, order.sellerUserId));
  return { ...order, listing, buyerProfile: buyerProfile || null, sellerProfile: sellerProfile || null };
}

router.get("/orders", requireAuth, async (req: any, res) => {
  try {
    const role = req.query.role || "buyer";
    let orders;
    if (role === "seller") {
      orders = await db.select().from(ordersTable).where(eq(ordersTable.sellerUserId, req.userId));
    } else {
      orders = await db.select().from(ordersTable).where(eq(ordersTable.buyerUserId, req.userId));
    }
    const enriched = await Promise.all(orders.map(enrichOrder));
    res.json(enriched);
  } catch (err) {
    req.log.error({ err }, "Failed to list orders");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/orders", requireAuth, async (req: any, res) => {
  try {
    const { listingId, quantity = 1, notes } = req.body;
    const [listing] = await db.select().from(listingsTable).where(eq(listingsTable.id, Number(listingId)));
    if (!listing) return res.status(404).json({ error: "Listing not found" });
    const totalPrice = listing.price ? (Number(listing.price) * quantity).toString() : null;
    const [order] = await db.insert(ordersTable).values({
      buyerUserId: req.userId,
      sellerUserId: listing.sellerUserId,
      listingId: Number(listingId),
      quantity,
      totalPrice,
      notes,
      status: "pending",
    }).returning();
    const enriched = await enrichOrder(order);
    res.status(201).json(enriched);
  } catch (err) {
    req.log.error({ err }, "Failed to create order");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/orders/:orderId", requireAuth, async (req: any, res) => {
  try {
    const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, Number(req.params.orderId)));
    if (!order) return res.status(404).json({ error: "Not found" });
    if (order.buyerUserId !== req.userId && order.sellerUserId !== req.userId) return res.status(403).json({ error: "Forbidden" });
    const enriched = await enrichOrder(order);
    res.json(enriched);
  } catch (err) {
    req.log.error({ err }, "Failed to get order");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/orders/:orderId/status", requireAuth, async (req: any, res) => {
  try {
    const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, Number(req.params.orderId)));
    if (!order) return res.status(404).json({ error: "Not found" });
    if (order.sellerUserId !== req.userId && order.buyerUserId !== req.userId) return res.status(403).json({ error: "Forbidden" });
    const [updated] = await db.update(ordersTable).set({ status: req.body.status, updatedAt: new Date() })
      .where(eq(ordersTable.id, Number(req.params.orderId))).returning();
    const enriched = await enrichOrder(updated);
    res.json(enriched);
  } catch (err) {
    req.log.error({ err }, "Failed to update order status");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
