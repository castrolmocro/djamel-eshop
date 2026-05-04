# Djamel E Shop — السوق المحلي الجزائري

## نظرة عامة
منصة سوق محلي جزائري تتيح للأفراد والمتاجر والمصانع نشر منتجاتهم وخدماتهم.

## التقنيات الأساسية
- **Frontend**: React 19 + Vite + TypeScript + Tailwind CSS v4 + Wouter + Supabase Auth + TanStack Query
- **Backend**: Express.js + TypeScript + Supabase JWT verification (jsonwebtoken)
- **Database**: PostgreSQL + Drizzle ORM
- **Auth**: Supabase Auth (email/password + OTP email verification)
- **Monorepo**: pnpm workspaces

## هيكل المشروع
```
artifacts/djamel-eshop/   → الواجهة الأمامية
artifacts/api-server/     → الخادم الخلفي
lib/db/                   → قاعدة البيانات + Schema
lib/api-spec/             → OpenAPI spec (orval codegen)
lib/api-client-react/     → React Query hooks (auto-generated)
```

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
profiles (clerkUserId column now stores Supabase UUIDs), listings, categories, orders, conversations, reviews, follows, notifications

## ألوان الموقع (حافظ عليها)
- Primary: برتقالي `hsl(15 85% 52%)`
- Accent: ذهبي `hsl(38 90% 58%)`
- Violet: `violet-600` للأزرار عند اكتمال النماذج

## متغيرات البيئة المطلوبة
انسخ `.env.example` إلى `.env` وأدخل قيم Supabase:

### Frontend (Vite)
- `VITE_SUPABASE_URL` — رابط مشروع Supabase
- `VITE_SUPABASE_ANON_KEY` — المفتاح العام (anon key)

### Backend
- `SUPABASE_JWT_SECRET` — من Supabase Dashboard → Settings → API → JWT Settings
- `DATABASE_URL` — رابط قاعدة بيانات PostgreSQL

### الاختياري
- `VITE_API_URL` — يُترك فارغاً في التطوير (Vite proxy يتولى /api)
- `PORT` — المنفذ للخادم (افتراضي: 8080)

## نظام المصادقة (Supabase)
- **Frontend**: `@supabase/supabase-js` — `src/lib/supabase.ts` + `src/contexts/AuthContext.tsx`
- **Backend**: JWT verification using `jsonwebtoken` — `src/middlewares/supabaseAuthMiddleware.ts`
- **Token flow**: Frontend gets Supabase JWT → sends as `Authorization: Bearer <token>` → backend verifies with `SUPABASE_JWT_SECRET`
- **User properties**: `user.id` (UUID), `user.email`, `user.user_metadata.first_name`, `user.user_metadata.full_name`, `user.user_metadata.avatar_url`

## تدفق العمل
```
pnpm --filter @workspace/djamel-eshop dev    → Frontend (port 5000)
pnpm --filter @workspace/api-server dev       → Backend (port 8080)
```
