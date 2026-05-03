import { Router } from "express";
import { getAuth } from "@clerk/express";
import { db } from "@workspace/db";
import { listingsTable, ordersTable, conversationsTable, messagesTable, reviewsTable } from "@workspace/db";
import { eq, and, or, sql } from "drizzle-orm";

const router = Router();

const requireAuth = (req: any, res: any, next: any) => {
  const auth = getAuth(req);
  const userId = auth?.sessionClaims?.userId || auth?.userId;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });
  req.userId = userId;
  next();
};

router.get("/dashboard/stats", requireAuth, async (req: any, res) => {
  try {
    const uid = req.userId;

    const [{ totalListings }] = await db.select({ totalListings: sql<number>`count(*)` }).from(listingsTable).where(eq(listingsTable.sellerUserId, uid));
    const [{ activeListings }] = await db.select({ activeListings: sql<number>`count(*)` }).from(listingsTable).where(and(eq(listingsTable.sellerUserId, uid), eq(listingsTable.isActive, true)));
    const [{ totalOrders }] = await db.select({ totalOrders: sql<number>`count(*)` }).from(ordersTable).where(or(eq(ordersTable.buyerUserId, uid), eq(ordersTable.sellerUserId, uid)));
    const [{ pendingOrders }] = await db.select({ pendingOrders: sql<number>`count(*)` }).from(ordersTable).where(and(or(eq(ordersTable.buyerUserId, uid), eq(ordersTable.sellerUserId, uid)), eq(ordersTable.status, "pending")));
    const [{ totalSales }] = await db.select({ totalSales: sql<number>`count(*)` }).from(ordersTable).where(eq(ordersTable.sellerUserId, uid));
    const [{ totalPurchases }] = await db.select({ totalPurchases: sql<number>`count(*)` }).from(ordersTable).where(eq(ordersTable.buyerUserId, uid));

    // unread messages
    const myConversations = await db.select().from(conversationsTable).where(or(eq(conversationsTable.buyerUserId, uid), eq(conversationsTable.sellerUserId, uid)));
    let unreadMessages = 0;
    for (const conv of myConversations) {
      const [{ cnt }] = await db.select({ cnt: sql<number>`count(*)` }).from(messagesTable)
        .where(and(eq(messagesTable.conversationId, conv.id), eq(messagesTable.isRead, "false"), sql`${messagesTable.senderUserId} != ${uid}`));
      unreadMessages += Number(cnt);
    }

    // average rating
    const myListings = await db.select().from(listingsTable).where(eq(listingsTable.sellerUserId, uid));
    let averageRating = null;
    if (myListings.length > 0) {
      const listingIds = myListings.map((l) => l.id);
      const reviews = await db.select().from(reviewsTable).where(sql`${reviewsTable.listingId} = ANY(${sql`ARRAY[${sql.join(listingIds.map(id => sql`${id}`), sql`, `)}]::int[]`})`);
      if (reviews.length > 0) {
        averageRating = reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length;
      }
    }

    res.json({
      totalListings: Number(totalListings),
      activeListings: Number(activeListings),
      totalOrders: Number(totalOrders),
      pendingOrders: Number(pendingOrders),
      totalSales: Number(totalSales),
      totalPurchases: Number(totalPurchases),
      unreadMessages,
      averageRating,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get dashboard stats");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/dashboard/activity", requireAuth, async (req: any, res) => {
  try {
    const uid = req.userId;
    const activity: any[] = [];

    const recentOrders = await db.select().from(ordersTable)
      .where(or(eq(ordersTable.buyerUserId, uid), eq(ordersTable.sellerUserId, uid)))
      .limit(5);
    for (const order of recentOrders) {
      activity.push({
        id: `order-${order.id}`,
        type: order.status === "pending" ? "new_order" : "order_status_change",
        titleAr: order.sellerUserId === uid ? `طلب جديد #${order.id}` : `تحديث طلب #${order.id}`,
        titleFr: order.sellerUserId === uid ? `Nouvelle commande #${order.id}` : `Mise à jour commande #${order.id}`,
        referenceId: order.id,
        createdAt: order.createdAt,
      });
    }

    const myConvs = await db.select().from(conversationsTable).where(or(eq(conversationsTable.buyerUserId, uid), eq(conversationsTable.sellerUserId, uid))).limit(5);
    for (const conv of myConvs) {
      const [lastMsg] = await db.select().from(messagesTable)
        .where(and(eq(messagesTable.conversationId, conv.id), sql`${messagesTable.senderUserId} != ${uid}`))
        .orderBy(sql`${messagesTable.createdAt} desc`)
        .limit(1);
      if (lastMsg) {
        activity.push({
          id: `msg-${lastMsg.id}`,
          type: "new_message",
          titleAr: "رسالة جديدة",
          titleFr: "Nouveau message",
          referenceId: conv.id,
          createdAt: lastMsg.createdAt,
        });
      }
    }

    activity.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    res.json(activity.slice(0, 10));
  } catch (err) {
    req.log.error({ err }, "Failed to get recent activity");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
