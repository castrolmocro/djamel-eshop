import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";

export function requireAuth(req: any, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization as string | undefined;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const token = authHeader.slice(7);
  const secret = process.env.SUPABASE_JWT_SECRET;
  if (!secret) {
    return res.status(500).json({ error: "Auth not configured: missing SUPABASE_JWT_SECRET" });
  }
  try {
    const decoded = jwt.verify(token, secret) as any;
    req.userId = decoded.sub as string;
    req.userEmail = decoded.email as string | undefined;
    next();
  } catch {
    return res.status(401).json({ error: "Unauthorized" });
  }
}
