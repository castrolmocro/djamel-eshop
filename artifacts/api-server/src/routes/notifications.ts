import { Router } from "express";
import { getAuth } from "@clerk/express";
import { db } from "@workspace/db";
import { notificationsTable } from "@workspace/db";
import { eq, and, desc, count } from "drizzle-orm";

const router = Router();

const requireAuth = (req: any, res: any, next: any) => {
  const auth = getAuth(req);
  const userId = auth?.sessionClaims?.userId || auth?.userId;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });
  req.userId = userId;
  next();
};

router.get("/notifications", requireAuth, async (req: any, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 20, 50);
    const notifications = await db
      .select()
      .from(notificationsTable)
      .where(eq(notificationsTable.userId, req.userId))
      .orderBy(desc(notificationsTable.createdAt))
      .limit(limit);
    res.json(notifications);
  } catch (err) {
    req.log.error({ err }, "Failed to get notifications");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/notifications/unread-count", requireAuth, async (req: any, res) => {
  try {
    const [result] = await db
      .select({ count: count() })
      .from(notificationsTable)
      .where(and(
        eq(notificationsTable.userId, req.userId),
        eq(notificationsTable.isRead, false)
      ));
    res.json({ count: Number(result?.count ?? 0) });
  } catch (err) {
    req.log.error({ err }, "Failed to get unread count");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/notifications/mark-all-read", requireAuth, async (req: any, res) => {
  try {
    await db
      .update(notificationsTable)
      .set({ isRead: true })
      .where(and(
        eq(notificationsTable.userId, req.userId),
        eq(notificationsTable.isRead, false)
      ));
    res.json({ message: "All marked as read" });
  } catch (err) {
    req.log.error({ err }, "Failed to mark notifications as read");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/notifications/:id/read", requireAuth, async (req: any, res) => {
  try {
    await db
      .update(notificationsTable)
      .set({ isRead: true })
      .where(and(
        eq(notificationsTable.id, Number(req.params.id)),
        eq(notificationsTable.userId, req.userId)
      ));
    res.json({ message: "Marked as read" });
  } catch (err) {
    req.log.error({ err }, "Failed to mark notification as read");
    res.status(500).json({ error: "Internal server error" });
  }
});

export async function createNotification(opts: {
  userId: string;
  type: string;
  titleAr: string;
  titleFr?: string;
  titleEn?: string;
  bodyAr?: string;
  bodyFr?: string;
  bodyEn?: string;
  fromUserId?: string;
  fromUserName?: string;
  fromUserAvatar?: string;
  linkUrl?: string;
  meta?: any;
}) {
  try {
    await db.insert(notificationsTable).values(opts);
  } catch {}
}

export default router;
