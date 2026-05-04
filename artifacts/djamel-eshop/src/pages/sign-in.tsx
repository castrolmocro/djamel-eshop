import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Eye, EyeOff, Loader2, ShoppingBag, CheckCircle, Shield, Zap } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function SignInPage() {
  const [, navigate] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) {
        setError(signInError.message === "Invalid login credentials"
          ? "بريد أو كلمة مرور غير صحيحة"
          : signInError.message);
      } else {
        navigate("/");
      }
    } catch {
      setError("حدث خطأ غير متوقع، حاول مجدداً");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100dvh-4rem)] flex" dir="rtl">

      {/* Brand Panel */}
      <div className="hidden lg:flex lg:w-[46%] relative flex-col justify-between p-10 overflow-hidden bg-gradient-to-br from-[hsl(15_85%_40%)] via-[hsl(15_85%_52%)] to-[hsl(38_90%_58%)]">
        <div className="absolute inset-0 opacity-[0.08]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
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
        <p className="relative z-10 text-white/40 text-xs">© 2025 Djamel E Shop · الجزائر</p>
      </div>

      {/* Form Panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-background">
        <div className="w-full max-w-sm">
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
