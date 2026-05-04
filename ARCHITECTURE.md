# Djamel E Shop — دليل البنية للذكاء الاصطناعي

> هذا الملف موجه للذكاء الاصطناعي الذي سيعمل على هذا المشروع مستقبلاً.
> يحتوي على شرح كامل لبنية المشروع، الملفات، والقرارات التقنية.

---

## 🗂️ نظرة عامة على البنية

```
/home/runner/workspace/
├── artifacts/
│   ├── djamel-eshop/       ← الواجهة الأمامية (React + Vite + Tailwind v4)
│   ├── api-server/         ← الخادم الخلفي (Express.js + TypeScript)
│   └── mockup-sandbox/     ← بيئة تجريب مكونات UI (Vite dev server)
├── lib/
│   ├── db/                 ← قاعدة البيانات (Drizzle ORM + PostgreSQL)
│   ├── api-spec/           ← OpenAPI spec (orval codegen)
│   ├── api-client-react/   ← React Query hooks (auto-generated)
│   └── api-zod/            ← Zod schemas (auto-generated)
├── scripts/
│   └── post-merge.sh       ← يُشغَّل بعد كل merge للـ task agents
├── ARCHITECTURE.md         ← هذا الملف
├── replit.md               ← ملخص المشروع (يُحمَّل تلقائياً في الذاكرة)
├── PROJECT_OVERVIEW.md     ← وصف تفصيلي للموقع
└── pnpm-workspace.yaml     ← إعدادات monorepo
```

---

## 🖥️ الواجهة الأمامية — `artifacts/djamel-eshop/`

### التقنيات
- **React 19** + **TypeScript**
- **Vite** (dev server على PORT من .env)
- **Tailwind CSS v4** (مع `@theme inline` في index.css)
- **Wouter** للتوجيه (لا React Router)
- **Clerk** للمصادقة (`@clerk/react`)
- **TanStack Query** لطلبات API
- **shadcn/ui** مكونات UI

### هيكل `src/`

```
src/
├── App.tsx                 ← المدخل الرئيسي: Clerk + Routes + QueryClient
├── main.tsx                ← ReactDOM.createRoot
├── index.css               ← CSS متغيرات + Tailwind + الأنميشن المخصص
├── pages/
│   ├── home.tsx            ← الصفحة الرئيسية (Hero + تصنيفات + إعلانات)
│   ├── sign-in.tsx         ← تسجيل الدخول
│   ├── sign-up.tsx         ← إنشاء حساب (الزر يتحول بنفسجي عند اكتمال البيانات)
│   ├── listings.tsx        ← قائمة الإعلانات مع فلاتر
│   ├── listing-detail.tsx  ← تفاصيل إعلان واحد
│   ├── create-listing.tsx  ← إنشاء إعلان جديد (محمي)
│   ├── dashboard.tsx       ← لوحة التحكم (محمية)
│   ├── messages.tsx        ← نظام الرسائل (محمي)
│   ├── orders.tsx          ← الطلبات (محمي)
│   ├── profile.tsx         ← تعديل الملف الشخصي (محمي)
│   ├── public-profile.tsx  ← عرض ملف مستخدم عام /profiles/:userId
│   └── not-found.tsx       ← صفحة 404
├── components/
│   ├── layout/
│   │   ├── AppLayout.tsx   ← الهيكل العام (Navbar + children + Footer)
│   │   ├── Navbar.tsx      ← شريط التنقل (active states + mobile sidebar)
│   │   └── Footer.tsx      ← الفوتر
│   ├── ui/                 ← مكونات shadcn/ui (لا تعدلها مباشرة)
│   └── ErrorBoundary.tsx   ← حماية من الـ crashes
├── contexts/
│   ├── index.tsx           ← AppProviders (يجمع كل الـ providers)
│   ├── I18nContext.tsx     ← السياق لغوي (ar/fr/en)
│   └── ThemeContext.tsx    ← السياق الوضع المظلم/الفاتح
├── hooks/
│   └── use-toast.ts        ← hook للإشعارات
└── lib/
    └── utils.ts            ← دوال مساعدة (cn, etc.)
```

### التوجيه (Routing)

| المسار | الصفحة | محمي؟ |
|--------|---------|-------|
| `/` | الرئيسية (يحول لـ dashboard إذا مسجل) | لا |
| `/sign-in` | تسجيل الدخول | لا |
| `/sign-up` | إنشاء حساب | لا |
| `/listings` | كل الإعلانات | لا |
| `/listings/:id` | تفاصيل إعلان | لا |
| `/listings/create` | إنشاء إعلان | نعم |
| `/dashboard` | لوحة التحكم | نعم |
| `/messages` | الرسائل | نعم |
| `/orders` | الطلبات | نعم |
| `/profile` | تعديل الملف | نعم |
| `/profiles/:userId` | الملف العام لأي مستخدم | لا |

### ألوان الموقع (حافظ عليها!)
- **Primary (برتقالي)**: `hsl(15 85% 52%)` — الزر الرئيسي والعلامة
- **Accent (ذهبي/أصفر)**: `hsl(38 90% 58%)` — التسليط
- **Violet (بنفسجي)**: `violet-600` / `violet-700` — زر إنشاء الحساب عند الاكتمال
- **Background**: `hsl(38 40% 97%)` — كريمي فاتح (light)
- **Background dark**: `hsl(20 18% 9%)` — بني داكن (dark)

### الأنميشن المتاحة في CSS
```css
.animate-fade-in-up      /* يظهر من الأسفل */
.animate-fade-in-down    /* يظهر من الأعلى */
.animate-fade-in-left    /* يظهر من اليمين (RTL) */
.animate-fade-in-right   /* يظهر من اليسار */
.animate-scale-in        /* يكبر من المنتصف */
.animate-shake           /* اهتزاز (للأخطاء) */
.animate-float           /* طفو خفيف */
.animate-glow            /* توهج */
.stagger-children        /* تأخير تلقائي للعناصر الفرعية */
.pulse-badge             /* نبض خفيف */
.card-hover              /* hover effect للبطاقات */
.gradient-text           /* نص بتدرج برتقالي-ذهبي */
.glass-card              /* زجاج شفاف */
.shimmer                 /* تأثير التحميل */
```

### نقاط مهمة للتطوير
1. **لا تستخدم React Router** — الموقع يعتمد على `wouter`
2. **API calls** تستخدم hooks من `@workspace/api-client-react` (auto-generated)
3. **للـ API endpoints الجديدة** التي لا hook لها: استخدم `fetch` مباشرة مع `import.meta.env.VITE_API_URL`
4. **الأيقونات** كلها من `lucide-react`
5. **RTL support**: الموقع يدعم RTL/LTR حسب اللغة. استخدم `dir` من `useI18n()`
6. **Tailwind v4**: لا `tailwind.config.js` — كل الإعداد في `index.css` تحت `@theme inline`

---

## ⚙️ الخادم الخلفي — `artifacts/api-server/`

### التقنيات
- **Express.js** + **TypeScript**
- **Clerk Express** للمصادقة
- **Pino** للـ logging
- **Drizzle ORM** للقاعدة

### هيكل `src/`

```
src/
├── app.ts              ← Express app (CORS + Clerk middleware + routes)
├── index.ts            ← تشغيل السيرفر على PORT
├── routes/
│   ├── index.ts        ← تجميع كل الـ routers
│   ├── health.ts       ← GET /api/health
│   ├── profiles.ts     ← GET/PUT /api/profiles/me, GET /api/profiles/:userId
│   ├── follows.ts      ← نظام المتابعة (follow/unfollow/stats/listings)
│   ├── listings.ts     ← CRUD الإعلانات
│   ├── categories.ts   ← قائمة التصنيفات
│   ├── messages.ts     ← المحادثات والرسائل
│   ├── orders.ts       ← إدارة الطلبات
│   ├── reviews.ts      ← التقييمات
│   ├── dashboard.ts    ← إحصائيات لوحة التحكم
│   └── seed.ts         ← POST /api/seed لبذر البيانات
├── middlewares/
│   └── clerkProxyMiddleware.ts  ← Proxy لـ Clerk API
└── lib/
    └── logger.ts       ← إعداد Pino logger
```

### نمط المصادقة في الـ routes
```typescript
const requireAuth = (req: any, res: any, next: any) => {
  const auth = getAuth(req);
  const userId = auth?.sessionClaims?.userId || auth?.userId;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });
  req.userId = userId;
  next();
};
```

### API Endpoints المتاحة

| Method | Path | Auth | الوصف |
|--------|------|------|-------|
| GET | `/api/health` | لا | فحص صحة السيرفر |
| GET | `/api/profiles/me` | نعم | ملفي الشخصي |
| PUT | `/api/profiles/me` | نعم | تحديث ملفي |
| GET | `/api/profiles/:userId` | لا | ملف مستخدم عام |
| GET | `/api/profiles/:userId/listings` | لا | إعلانات مستخدم |
| GET | `/api/profiles/:userId/follow-stats` | لا | إحصائيات المتابعة |
| POST | `/api/follows/:userId` | نعم | متابعة مستخدم |
| DELETE | `/api/follows/:userId` | نعم | إلغاء متابعة |
| GET | `/api/follows/status/:userId` | نعم | هل أتابع هذا المستخدم؟ |
| GET | `/api/follows/my-following` | نعم | قائمة من أتابعهم |
| GET | `/api/listings` | لا | قائمة الإعلانات مع فلاتر |
| GET | `/api/listings/featured` | لا | الإعلانات المميزة |
| GET | `/api/listings/nearby` | لا | الإعلانات القريبة |
| GET | `/api/listings/:id` | لا | تفاصيل إعلان |
| POST | `/api/listings` | نعم | نشر إعلان جديد |
| PUT | `/api/listings/:id` | نعم | تعديل إعلان |
| DELETE | `/api/listings/:id` | نعم | حذف إعلان |
| GET | `/api/categories` | لا | قائمة التصنيفات |
| GET | `/api/conversations` | نعم | قائمة المحادثات |
| GET | `/api/conversations/:id/messages` | نعم | رسائل محادثة |
| POST | `/api/conversations/:id/messages` | نعم | إرسال رسالة |
| GET | `/api/orders` | نعم | قائمة الطلبات |
| POST | `/api/orders` | نعم | إنشاء طلب |
| GET | `/api/dashboard/stats` | نعم | إحصائيات لوحة التحكم |
| GET | `/api/dashboard/activity` | نعم | النشاط الأخير |
| POST | `/api/seed` | لا | بذر التصنيفات |

---

## 🗄️ قاعدة البيانات — `lib/db/`

### التقنيات
- **PostgreSQL** (Replit Nix module: `postgresql-16`)
- **Drizzle ORM** للاستعلامات
- **drizzle-kit** للـ migrations (`db:push`)

### جداول البيانات

```
lib/db/src/schema/
├── index.ts          ← exports كل الجداول
├── profiles.ts       ← بروفيلات المستخدمين
├── categories.ts     ← تصنيفات الإعلانات (12 تصنيف)
├── listings.ts       ← الإعلانات
├── orders.ts         ← الطلبات
├── conversations.ts  ← المحادثات والرسائل
├── reviews.ts        ← التقييمات
└── follows.ts        ← نظام المتابعة (جديد)
```

#### جدول `profiles`
| عمود | النوع | الوصف |
|------|------|-------|
| id | serial PK | المعرّف |
| clerk_user_id | text UNIQUE | معرّف Clerk |
| display_name | text | الاسم المعروض |
| bio | text | نبذة |
| avatar_url | text | رابط الصورة |
| phone | text | الهاتف |
| wilaya | text | الولاية |
| city | text | المدينة |
| is_store | boolean | هل متجر؟ |
| store_name | text | اسم المتجر |

#### جدول `listings`
| عمود | النوع | الوصف |
|------|------|-------|
| id | serial PK | المعرّف |
| seller_user_id | text | معرّف البائع (Clerk) |
| category_id | integer FK | التصنيف |
| title_ar/fr/en | text | العنوان بثلاث لغات |
| description_ar/fr/en | text | الوصف |
| price | numeric | السعر |
| currency | text | العملة (DZD افتراضي) |
| listing_type | text | product / service |
| images | text[] | مصفوفة روابط الصور |
| wilaya | text | الولاية |
| is_active | boolean | نشط؟ |
| is_featured | boolean | مميز؟ |

#### جدول `follows` (جديد)
| عمود | النوع | الوصف |
|------|------|-------|
| id | serial PK | المعرّف |
| follower_user_id | text | معرّف المتابِع |
| following_user_id | text | معرّف المتابَع |
| created_at | timestamp | تاريخ المتابعة |
| UNIQUE | (follower, following) | لا تكرار |

### تحديث قاعدة البيانات
```bash
# بعد تعديل أي ملف في lib/db/src/schema/
cd lib/db && pnpm db:push
```

---

## 🔄 نظام Auto-generated API Client

الـ hooks في `@workspace/api-client-react` تُولَّد تلقائياً من OpenAPI spec.

**إضافة endpoint جديد:**
1. أضف الـ route في `artifacts/api-server/src/routes/`
2. أضف الـ endpoint في `lib/api-spec/openapi.yaml`
3. شغّل `pnpm --filter @workspace/api-spec run codegen`
4. استخدم الـ hook المُولَّد في الواجهة

**بديل أسرع** (للـ endpoints التي لا hooks لها): استخدم `fetch` مباشرة:
```typescript
const API_BASE = import.meta.env.VITE_API_URL || "";
const res = await fetch(`${API_BASE}/api/endpoint`, {
  credentials: "include",
  headers: { "Content-Type": "application/json" },
});
```

---

## 🌐 دعم متعدد اللغات (i18n)

الموقع يدعم ثلاث لغات:
- **العربية** (`ar`) — الافتراضية، RTL
- **الفرنسية** (`fr`) — LTR
- **الإنجليزية** (`en`) — LTR

```typescript
const { t, language, dir } = useI18n();
// t('key') — مفاتيح ترجمة محددة مسبقاً
// language === 'ar' | 'fr' | 'en'
// dir === 'rtl' | 'ltr'

// نمط النصوص المخصصة:
const label = (ar: string, fr: string, en: string) =>
  language === "ar" ? ar : language === "fr" ? fr : en;
```

---

## 🔐 نظام المصادقة (Clerk)

- المستخدمون يسجلون عبر Clerk (email + password + verification)
- `useUser()` يعطي بيانات المستخدم الحالي
- `useSignUp()` / `useSignIn()` لعمليات التسجيل
- Protected routes تستخدم مكون `ProtectedRoute` في `App.tsx`
- الـ profile يُنشأ تلقائياً عند أول دخول (في `GET /api/profiles/me`)

### متغيرات البيئة المطلوبة
```env
# Frontend (Vite)
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
VITE_API_URL=http://localhost:PORT   # أو رابط الـ API

# Backend (Express)
DATABASE_URL=postgresql://...
CLERK_SECRET_KEY=sk_test_...
PORT=8080
```

---

## 🚀 تشغيل المشروع محلياً

```bash
# تثبيت الحزم
pnpm install

# تشغيل الخادم الخلفي
pnpm --filter @workspace/api-server dev

# تشغيل الواجهة الأمامية
pnpm --filter @workspace/djamel-eshop dev

# تحديث قاعدة البيانات (بعد تعديل schema)
cd lib/db && pnpm db:push

# بذر التصنيفات
curl -X POST http://localhost:PORT/api/seed

# إعادة توليد API client (بعد تعديل openapi.yaml)
pnpm --filter @workspace/api-spec run codegen
```

---

## 📝 قرارات تقنية مهمة

1. **Wouter بدل React Router** — أخف وأسرع للمشاريع الصغيرة
2. **Tailwind v4** — لا `tailwind.config.js`، كل شيء في CSS
3. **Drizzle بدل Prisma** — أسرع وأقل ضخامة
4. **Clerk بدل Auth.js** — أسهل للـ email verification والـ social login
5. **Orval للـ codegen** — يولّد hooks من OpenAPI تلقائياً
6. **Monorepo بـ pnpm workspaces** — مشاركة الأنواع والـ schemas بين frontend وbackend

---

## 🛠️ إصلاح المشاكل الشائعة

### الموقع يظهر فارغ
→ تأكد من `VITE_CLERK_PUBLISHABLE_KEY` في متغيرات البيئة

### فشل API calls
→ تأكد من `VITE_API_URL` وأن الـ api-server يعمل

### الجدول غير موجود في DB
→ شغّل `cd lib/db && pnpm db:push`

### التصنيفات فارغة
→ أرسل `POST /api/seed` مرة واحدة

### مشكلة Clerk "Invalid publishable key"
→ الـ key يجب أن يبدأ بـ `pk_test_` أو `pk_live_`

---

*آخر تحديث: مايو 2026 — تم إضافة: نظام المتابعة، صفحات البروفايل العامة، تحسينات الأنميشن، إصلاح ألوان الأزرار*
