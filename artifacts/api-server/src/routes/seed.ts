import { Router } from "express";
import { db } from "@workspace/db";
import { categoriesTable } from "@workspace/db";
import { sql } from "drizzle-orm";

const router = Router();

const DEFAULT_CATEGORIES = [
  { nameAr: "إلكترونيات", nameFr: "Électronique", nameEn: "Electronics", icon: "Smartphone", slug: "electronics" },
  { nameAr: "ملابس وأزياء", nameFr: "Vêtements & Mode", nameEn: "Clothing & Fashion", icon: "Shirt", slug: "clothing" },
  { nameAr: "منزل وديكور", nameFr: "Maison & Décoration", nameEn: "Home & Decor", icon: "Home", slug: "home-decor" },
  { nameAr: "سيارات ومركبات", nameFr: "Voitures & Véhicules", nameEn: "Vehicles", icon: "Car", slug: "vehicles" },
  { nameAr: "عقارات", nameFr: "Immobilier", nameEn: "Real Estate", icon: "Building", slug: "real-estate" },
  { nameAr: "خدمات", nameFr: "Services", nameEn: "Services", icon: "Wrench", slug: "services" },
  { nameAr: "رياضة ولياقة", nameFr: "Sport & Fitness", nameEn: "Sports & Fitness", icon: "Dumbbell", slug: "sports" },
  { nameAr: "كتب وتعليم", nameFr: "Livres & Éducation", nameEn: "Books & Education", icon: "BookOpen", slug: "books" },
  { nameAr: "طعام وبقالة", nameFr: "Alimentation", nameEn: "Food & Grocery", icon: "UtensilsCrossed", slug: "food" },
  { nameAr: "بناء ومواد", nameFr: "Construction", nameEn: "Construction", icon: "Hammer", slug: "construction" },
  { nameAr: "حيوانات أليفة", nameFr: "Animaux de compagnie", nameEn: "Pets", icon: "PawPrint", slug: "pets" },
  { nameAr: "أخرى", nameFr: "Autres", nameEn: "Other", icon: "Package", slug: "other" },
];

export async function seedCategories() {
  try {
    const existing = await db.select().from(categoriesTable);
    if (existing.length > 0) return;
    await db.insert(categoriesTable).values(DEFAULT_CATEGORIES);
    console.log("✅ Categories seeded successfully");
  } catch (err) {
    console.error("❌ Failed to seed categories:", err);
  }
}

router.post("/seed", async (req: any, res) => {
  try {
    await db.delete(categoriesTable);
    await db.insert(categoriesTable).values(DEFAULT_CATEGORIES);
    res.json({ success: true, message: "Database seeded successfully", count: DEFAULT_CATEGORIES.length });
  } catch (err) {
    req.log.error({ err }, "Failed to seed");
    res.status(500).json({ error: "Seed failed" });
  }
});

export default router;
