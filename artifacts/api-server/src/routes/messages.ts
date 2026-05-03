import { Router } from "express";
import { getAuth } from "@clerk/express";
import { db } from "@workspace/db";
import { conversationsTable, messagesTable, profilesTable, listingsTable } from "@workspace/db";
import { eq, and, or, desc, sql } from "drizzle-orm";

const router = Router();

const requireAuth = (req: any, res: any, next: any) => {
  const auth = getAuth(req);
  const userId = auth?.sessionClaims?.userId || auth?.userId;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });
  req.userId = userId;
  next();
};

router.get("/conversations", requireAuth, async (req: any, res) => {
  try {
    const conversations = await db.select().from(conversationsTable)
      .where(or(
        eq(conversationsTable.buyerUserId, req.userId),
        eq(conversationsTable.sellerUserId, req.userId)
      ))
      .orderBy(desc(conversationsTable.createdAt));

    const enriched = await Promise.all(conversations.map(async (conv) => {
      const otherPartyId = conv.buyerUserId === req.userId ? conv.sellerUserId : conv.buyerUserId;
      const [otherParty] = await db.select().from(profilesTable).where(eq(profilesTable.clerkUserId, otherPartyId));
      const [lastMessage] = await db.select().from(messagesTable)
        .where(eq(messagesTable.conversationId, conv.id))
        .orderBy(desc(messagesTable.createdAt))
        .limit(1);
      const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(messagesTable)
        .where(and(
          eq(messagesTable.conversationId, conv.id),
          eq(messagesTable.isRead, "false"),
        ));
      let listing = null;
      if (conv.listingId) {
        const [l] = await db.select().from(listingsTable).where(eq(listingsTable.id, conv.listingId));
        listing = l || null;
      }
      return { ...conv, otherParty: otherParty || null, lastMessage: lastMessage || null, unreadCount: Number(count), listing };
    }));

    res.json(enriched);
  } catch (err) {
    req.log.error({ err }, "Failed to list conversations");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/conversations", requireAuth, async (req: any, res) => {
  try {
    const { listingId, sellerUserId, initialMessage } = req.body;
    if (!sellerUserId) return res.status(400).json({ error: "sellerUserId required" });
    if (sellerUserId === req.userId) return res.status(400).json({ error: "Cannot message yourself" });

    const conditions: any[] = [
      eq(conversationsTable.buyerUserId, req.userId),
      eq(conversationsTable.sellerUserId, sellerUserId),
    ];
    if (listingId) conditions.push(eq(conversationsTable.listingId, Number(listingId)));

    const [existing] = await db.select().from(conversationsTable).where(and(...conditions));
    if (existing) {
      if (initialMessage) {
        await db.insert(messagesTable).values({
          conversationId: existing.id,
          senderUserId: req.userId,
          content: initialMessage,
          isRead: "false",
        });
      }
      return res.status(201).json({ ...existing, unreadCount: 0 });
    }

    const [conversation] = await db.insert(conversationsTable).values({
      listingId: listingId ? Number(listingId) : null,
      buyerUserId: req.userId,
      sellerUserId,
    }).returning();

    if (initialMessage) {
      await db.insert(messagesTable).values({
        conversationId: conversation.id,
        senderUserId: req.userId,
        content: initialMessage,
        isRead: "false",
      });
    }

    res.status(201).json({ ...conversation, unreadCount: 0 });
  } catch (err) {
    req.log.error({ err }, "Failed to create conversation");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/conversations/:conversationId/messages", requireAuth, async (req: any, res) => {
  try {
    const convId = Number(req.params.conversationId);
    const [conv] = await db.select().from(conversationsTable).where(eq(conversationsTable.id, convId));
    if (!conv) return res.status(404).json({ error: "Not found" });
    if (conv.buyerUserId !== req.userId && conv.sellerUserId !== req.userId) return res.status(403).json({ error: "Forbidden" });

    // mark messages as read
    await db.update(messagesTable).set({ isRead: "true" })
      .where(and(
        eq(messagesTable.conversationId, convId),
        eq(messagesTable.isRead, "false"),
      ));

    const messages = await db.select().from(messagesTable)
      .where(eq(messagesTable.conversationId, convId))
      .orderBy(messagesTable.createdAt);
    res.json(messages);
  } catch (err) {
    req.log.error({ err }, "Failed to get messages");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/conversations/:conversationId/messages", requireAuth, async (req: any, res) => {
  try {
    const convId = Number(req.params.conversationId);
    const [conv] = await db.select().from(conversationsTable).where(eq(conversationsTable.id, convId));
    if (!conv) return res.status(404).json({ error: "Not found" });
    if (conv.buyerUserId !== req.userId && conv.sellerUserId !== req.userId) return res.status(403).json({ error: "Forbidden" });

    const [message] = await db.insert(messagesTable).values({
      conversationId: convId,
      senderUserId: req.userId,
      content: req.body.content,
      isRead: "false",
    }).returning();
    res.status(201).json(message);
  } catch (err) {
    req.log.error({ err }, "Failed to send message");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
