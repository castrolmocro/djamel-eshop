# Djamel E Shop — السوق المحلي الجزائري

## نظرة عامة
منصة سوق محلي جزائري تتيح للأفراد والمتاجر والمصانع نشر منتجاتهم وخدماتهم.

## التقنيات الأساسية
- **Frontend**: React 19 + Vite + TypeScript + Tailwind CSS v4 + Wouter + Clerk + TanStack Query
- **Backend**: Express.js + TypeScript + Clerk Express
- **Database**: PostgreSQL + Drizzle ORM
- **Auth**: Clerk (email/password + verification)
- **Monorepo**: pnpm workspaces

## هيكل المشروع
```
artifacts/djamel-eshop/   → الواجهة الأمامية
artifacts/api-server/     → الخادم الخلفي
lib/db/                   → قاعدة البيانات + Schema
lib/api-spec/             → OpenAPI spec (orval codegen)
lib/api-client-react/     → React Query hooks (auto-generated)
```

## الملف الأساسي للوثائق
راجع `ARCHITECTURE.md` للشرح الكامل للبنية والملفات.

## الصفحات
- `/` — الرئيسية
- `/sign-in`, `/sign-up` — المصادقة
- `/listings` — الإعلانات
- `/listings/:id` — تفاصيل إعلان
- `/listings/create` — نشر إعلان (محمي)
- `/dashboard` — لوحة التحكم (محمي)
- `/messages` — الرسائل (محمي)
- `/orders` — الطلبات (محمي)
- `/profile` — تعديل الملف (محمي)
- `/profiles/:userId` — الملف العام لأي مستخدم

## جداول قاعدة البيانات
profiles, listings, categories, orders, conversations, reviews, follows

## ألوان الموقع (حافظ عليها)
- Primary: برتقالي `hsl(15 85% 52%)`
- Accent: ذهبي `hsl(38 90% 58%)`
- Violet: `violet-600` للأزرار عند اكتمال النماذج

## متغيرات البيئة المطلوبة
- `VITE_CLERK_PUBLISHABLE_KEY` (frontend)
- `VITE_API_URL` (frontend)
- `DATABASE_URL` (backend)
- `CLERK_SECRET_KEY` (backend)

## آخر التحديثات (مايو 2026)
- إصلاح زر إنشاء الحساب (يتحول بنفسجي عند اكتمال البيانات)
- إضافة صفحات البروفايل العامة `/profiles/:userId`
- إضافة نظام المتابعة (follow/unfollow + stats)
- تحسين الـ Navbar (active states + mobile sidebar محسّن)
- إضافة أنميشن جديدة (fadeInUp, scaleIn, shake, float, glow, stagger)
- تحسين صفحتي تسجيل الدخول والتسجيل
- إضافة `follows` table في قاعدة البيانات
- إضافة API routes للمتابعة وإحصائيات البروفايل
