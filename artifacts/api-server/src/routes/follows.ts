import { Router } from "express";
import { getAuth } from "@clerk/express";
import { db } from "@workspace/db";
import { followsTable, profilesTable, listingsTable } from "@workspace/db";
import { eq, and, count, desc, inArray } from "drizzle-orm";
import { createNotification } from "./notifications";

const router = Router();

const requireAuth = (req: any, res: any, next: any) => {
  const auth = getAuth(req);
  const userId = auth?.sessionClaims?.userId || auth?.userId;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });
  req.userId = userId;
  next();
};

router.post("/follows/:userId", requireAuth, async (req: any, res) => {
  try {
    const targetUserId = req.params.userId;
    if (targetUserId === req.userId) {
      return res.status(400).json({ error: "Cannot follow yourself" });
    }

    const existing = await db.select().from(followsTable)
      .where(and(
        eq(followsTable.followerUserId, req.userId),
        eq(followsTable.followingUserId, targetUserId)
      )).limit(1);

    if (existing.length > 0) {
      return res.json({ message: "Already following" });
    }

    await db.insert(followsTable).values({
      followerUserId: req.userId,
      followingUserId: targetUserId,
    });

    const [followerProfile] = await db.select().from(profilesTable)
      .where(eq(profilesTable.clerkUserId, req.userId)).limit(1);

    await createNotification({
      userId: targetUserId,
      type: "new_follower",
      titleAr: `${followerProfile?.displayName || "مستخدم"} بدأ بمتابعتك`,
      titleFr: `${followerProfile?.displayName || "Utilisateur"} vous suit`,
      titleEn: `${followerProfile?.displayName || "User"} started following you`,
      fromUserId: req.userId,
      fromUserName: followerProfile?.displayName,
      fromUserAvatar: followerProfile?.avatarUrl ?? undefined,
      linkUrl: `/profiles/${req.userId}`,
    });

    res.json({ message: "Followed successfully" });
  } catch (err) {
    req.log.error({ err }, "Failed to follow user");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/follows/:userId", requireAuth, async (req: any, res) => {
  try {
    const targetUserId = req.params.userId;

    await db.delete(followsTable)
      .where(and(
        eq(followsTable.followerUserId, req.userId),
        eq(followsTable.followingUserId, targetUserId)
      ));

    res.json({ message: "Unfollowed successfully" });
  } catch (err) {
    req.log.error({ err }, "Failed to unfollow user");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/follows/status/:userId", requireAuth, async (req: any, res) => {
  try {
    const targetUserId = req.params.userId;

    const existing = await db.select().from(followsTable)
      .where(and(
        eq(followsTable.followerUserId, req.userId),
        eq(followsTable.followingUserId, targetUserId)
      )).limit(1);

    res.json({ isFollowing: existing.length > 0 });
  } catch (err) {
    req.log.error({ err }, "Failed to get follow status");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/profiles/:userId/follow-stats", async (req: any, res) => {
  try {
    const userId = req.params.userId;

    const [followersRes, followingRes, listingsRes] = await Promise.all([
      db.select({ count: count() }).from(followsTable).where(eq(followsTable.followingUserId, userId)),
      db.select({ count: count() }).from(followsTable).where(eq(followsTable.followerUserId, userId)),
      db.select({ count: count() }).from(listingsTable).where(eq(listingsTable.sellerUserId, userId)),
    ]);

    res.json({
      followersCount: Number(followersRes[0]?.count ?? 0),
      followingCount: Number(followingRes[0]?.count ?? 0),
      listingsCount: Number(listingsRes[0]?.count ?? 0),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get follow stats");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/profiles/:userId/followers", async (req: any, res) => {
  try {
    const userId = req.params.userId;
    const limit = Math.min(Number(req.query.limit) || 30, 100);
    const offset = Number(req.query.offset) || 0;

    const rows = await db.select()
      .from(followsTable)
      .where(eq(followsTable.followingUserId, userId))
      .orderBy(desc(followsTable.createdAt))
      .limit(limit)
      .offset(offset);

    const userIds = rows.map(r => r.followerUserId);
    if (userIds.length === 0) return res.json([]);

    const profiles = await db.select().from(profilesTable)
      .where(inArray(profilesTable.clerkUserId, userIds));

    res.json(profiles);
  } catch (err) {
    req.log.error({ err }, "Failed to get followers");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/profiles/:userId/following", async (req: any, res) => {
  try {
    const userId = req.params.userId;
    const limit = Math.min(Number(req.query.limit) || 30, 100);
    const offset = Number(req.query.offset) || 0;

    const rows = await db.select()
      .from(followsTable)
      .where(eq(followsTable.followerUserId, userId))
      .orderBy(desc(followsTable.createdAt))
      .limit(limit)
      .offset(offset);

    const userIds = rows.map(r => r.followingUserId);
    if (userIds.length === 0) return res.json([]);

    const profiles = await db.select().from(profilesTable)
      .where(inArray(profilesTable.clerkUserId, userIds));

    res.json(profiles);
  } catch (err) {
    req.log.error({ err }, "Failed to get following");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/profiles/:userId/listings", async (req: any, res) => {
  try {
    const userId = req.params.userId;
    const listings = await db.select().from(listingsTable)
      .where(and(
        eq(listingsTable.sellerUserId, userId),
        eq(listingsTable.isActive, true)
      ))
      .orderBy(desc(listingsTable.createdAt))
      .limit(24);
    res.json(listings);
  } catch (err) {
    req.log.error({ err }, "Failed to get user listings");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/follows/my-following", requireAuth, async (req: any, res) => {
  try {
    const following = await db.select().from(followsTable)
      .where(eq(followsTable.followerUserId, req.userId))
      .orderBy(desc(followsTable.createdAt));

    const userIds = following.map(f => f.followingUserId);
    if (userIds.length === 0) return res.json([]);

    const profiles = await db.select().from(profilesTable)
      .where(inArray(profilesTable.clerkUserId, userIds));

    res.json(profiles);
  } catch (err) {
    req.log.error({ err }, "Failed to get following list");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
