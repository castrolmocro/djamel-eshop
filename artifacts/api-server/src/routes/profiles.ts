import { Router } from "express";
import { requireAuth } from "../middlewares/supabaseAuthMiddleware";
import { db } from "@workspace/db";
import { profilesTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

router.get("/profiles/me", requireAuth, async (req: any, res) => {
  try {
    const [profile] = await db.select().from(profilesTable).where(eq(profilesTable.clerkUserId, req.userId));
    if (!profile) {
      const [created] = await db.insert(profilesTable).values({
        clerkUserId: req.userId,
        displayName: "مستخدم جديد",
        country: "DZ",
        preferredLanguage: "ar",
        isStore: false,
      }).returning();
      return res.json(created);
    }
    res.json(profile);
  } catch (err) {
    req.log.error({ err }, "Failed to get profile");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/profiles/me", requireAuth, async (req: any, res) => {
  try {
    const body = req.body;
    const [existing] = await db.select().from(profilesTable).where(eq(profilesTable.clerkUserId, req.userId));
    if (!existing) {
      const [created] = await db.insert(profilesTable).values({
        clerkUserId: req.userId,
        displayName: body.displayName || "مستخدم جديد",
        ...body,
      }).returning();
      return res.json(created);
    }
    const [updated] = await db.update(profilesTable)
      .set({ ...body, updatedAt: new Date() })
      .where(eq(profilesTable.clerkUserId, req.userId))
      .returning();
    res.json(updated);
  } catch (err) {
    req.log.error({ err }, "Failed to update profile");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/profiles/:userId", async (req: any, res) => {
  try {
    const [profile] = await db.select().from(profilesTable).where(eq(profilesTable.clerkUserId, req.params.userId));
    if (!profile) return res.status(404).json({ error: "Profile not found" });
    res.json(profile);
  } catch (err) {
    req.log.error({ err }, "Failed to get profile");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
