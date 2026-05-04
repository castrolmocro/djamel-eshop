import { useState, useEffect } from "react";
import { useSignIn, useClerk } from "@clerk/react";
import { Link, useLocation } from "wouter";
import { Eye, EyeOff, Loader2, ShoppingBag, CheckCircle, Shield, Zap } from "lucide-react";

const basePath = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";

type OAuthProvider = "oauth_google" | "oauth_facebook" | "oauth_twitter";

const oauthProviders: { id: OAuthProvider; label: string; icon: React.ReactNode }[] = [
  {
    id: "oauth_google",
    label: "Google",
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden>
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
      </svg>
    ),
  },
  {
    id: "oauth_facebook",
    label: "Facebook",
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden fill="#1877F2">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    ),
  },
  {
    id: "oauth_twitter",
    label: "Twitter / X",
    icon: (
      <svg viewBox="0 0 24 24" width="17" height="17" aria-hidden fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.74l7.73-8.835L1.254 2.25H8.08l4.259 5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    ),
  },
];

export default function SignInPage() {
  const { signIn, setActive } = useSignIn();
  const { handleRedirectCallback } = useClerk();
  const [, navigate] = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<OAuthProvider | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.has("__clerk_status")) {
      handleRedirectCallback({
        afterSignInUrl: `${basePath}/`,
        afterSignUpUrl: `${basePath}/`,
      }).catch(() => {});
    }
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!signIn) {
      setError("حدث خطأ في تهيئة نظام المصادقة، أعد تحميل الصفحة");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const result = await signIn.create({ identifier: email, password });
      if (result.status === "complete") {
        await setActive!({ session: result.createdSessionId });
        navigate("/");
      } else {
        setError("حدث خطأ غير متوقع، حاول مجدداً");
      }
    } catch (err: any) {
      setError(err?.errors?.[0]?.longMessage ?? err?.errors?.[0]?.message ?? "بريد أو كلمة مرور غير صحيحة");
    } finally {
      setLoading(false);
    }
  }

  async function handleOAuth(provider: OAuthProvider) {
    if (!signIn) return;
    setOauthLoading(provider);
    setError("");
    try {
      await signIn.authenticateWithRedirect({
        strategy: provider,
        redirectUrl: `${basePath}/sign-in`,
        redirectUrlComplete: `${basePath}/`,
      });
    } catch (err: any) {
      setError(err?.errors?.[0]?.message ?? "فشل تسجيل الدخول بهذه الطريقة");
      setOauthLoading(null);
    }
  }

  return (
    <div className="min-h-[calc(100dvh-4rem)] flex" dir="rtl">

      {/* Brand Panel */}
      <div className="hidden lg:flex lg:w-[46%] relative flex-col justify-between p-10 overflow-hidden bg-gradient-to-br from-[hsl(15_85%_40%)] via-[hsl(15_85%_52%)] to-[hsl(38_90%_58%)]">
        {/* Geometric overlay pattern */}
        <div className="absolute inset-0 opacity-[0.08]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
        {/* Top: logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-10">
            <div className="h-12 w-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center shadow-lg">
              <ShoppingBag className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-white font-black text-xl leading-none">Djamel E Shop</h1>
              <p className="text-white/70 text-xs mt-0.5">السوق المحلي الجزائري</p>
            </div>
          </div>

          <h2 className="text-white text-3xl font-black leading-tight mb-4">
            مرحباً بعودتك<br/>إلى السوق
          </h2>
          <p className="text-white/75 text-sm leading-relaxed">
            سجّل دخولك للوصول إلى إعلاناتك ورسائلك وطلباتك بكل سهولة
          </p>
        </div>

        {/* Middle: features */}
        <div className="relative z-10 space-y-4">
          {[
            { icon: <Shield className="h-4 w-4" />, text: "حساب آمن ومحمي بالكامل" },
            { icon: <Zap className="h-4 w-4" />, text: "بيع واشترِ بسرعة عبر الجزائر" },
            { icon: <CheckCircle className="h-4 w-4" />, text: "آلاف الإعلانات في كل الولايات" },
          ].map((f, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-white/15 flex items-center justify-center text-white shrink-0">
                {f.icon}
              </div>
              <p className="text-white/85 text-sm">{f.text}</p>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <p className="relative z-10 text-white/40 text-xs">
          © 2025 Djamel E Shop · الجزائر
        </p>
      </div>

      {/* Form Panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-background">
        <div className="w-full max-w-sm">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center">
              <ShoppingBag className="h-5 w-5 text-white" />
            </div>
            <span className="font-black text-foreground text-lg">Djamel E Shop</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-black text-foreground mb-1">تسجيل الدخول</h2>
            <p className="text-muted-foreground text-sm">أدخل بياناتك للمتابعة</p>
          </div>

          {/* OAuth */}
          <div className="grid grid-cols-2 gap-2.5 mb-6">
            {oauthProviders.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => handleOAuth(p.id)}
                disabled={!!oauthLoading}
                className="flex items-center justify-center gap-2 h-10 rounded-xl border border-border bg-card text-foreground text-xs font-medium hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                {oauthLoading === p.id ? <Loader2 className="h-4 w-4 animate-spin" /> : p.icon}
                <span>{p.label}</span>
              </button>
            ))}
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground">أو بالبريد الإلكتروني</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-foreground">البريد الإلكتروني</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="example@email.com"
                required
                dir="ltr"
                className="w-full h-11 px-4 rounded-xl border border-input bg-card text-foreground text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-left placeholder:text-muted-foreground"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-foreground">كلمة المرور</label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  dir="ltr"
                  className="w-full h-11 px-4 rounded-xl border border-input bg-card text-foreground text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-left placeholder:text-muted-foreground"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-xl bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-xl bg-primary text-primary-foreground font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {loading ? "جاري الدخول..." : "تسجيل الدخول"}
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            ليس لديك حساب؟{" "}
            <Link href="/sign-up" className="text-primary font-bold hover:underline">
              أنشئ حساباً
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
