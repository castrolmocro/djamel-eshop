import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Eye, EyeOff, Loader2, ShoppingBag, CheckCircle2, Star, TrendingUp, Users } from "lucide-react";
import { supabase } from "@/lib/supabase";

type Step = "form" | "verify" | "done";

export default function SignUpPage() {
  const [, navigate] = useLocation();
  const [step, setStep] = useState<Step>("form");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isFormComplete =
    firstName.trim().length > 0 &&
    lastName.trim().length > 0 &&
    email.trim().length > 0 &&
    password.length >= 8;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            full_name: `${firstName} ${lastName}`.trim(),
          },
        },
      });
      if (signUpError) {
        setError(signUpError.message);
      } else {
        setStep("verify");
      }
    } catch {
      setError("حدث خطأ، حاول مجدداً");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { error: verifyError } = await supabase.auth.verifyOtp({
        email,
        token: code,
        type: "signup",
      });
      if (verifyError) {
        setError("رمز غير صحيح، حاول مجدداً");
      } else {
        setStep("done");
        setTimeout(() => navigate("/"), 1500);
      }
    } catch {
      setError("رمز غير صحيح");
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
            انضم إلى أكبر<br/>سوق محلي 🇩🇿
          </h2>
          <p className="text-white/75 text-sm leading-relaxed">
            أنشئ حسابك مجاناً وابدأ البيع والشراء مع آلاف المستخدمين عبر كل ولايات الجزائر
          </p>
        </div>
        <div className="relative z-10 space-y-4">
          {[
            { icon: <Star className="h-4 w-4" />, text: "تسجيل مجاني بدون رسوم" },
            { icon: <TrendingUp className="h-4 w-4" />, text: "انشر إعلانك في ثوانٍ" },
            { icon: <Users className="h-4 w-4" />, text: "مجتمع متنامٍ من البائعين والمشترين" },
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
      <div className="flex-1 flex items-center justify-center px-6 py-10 bg-background overflow-y-auto">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center">
              <ShoppingBag className="h-5 w-5 text-white" />
            </div>
            <span className="font-black text-foreground text-lg">Djamel E Shop</span>
          </div>

          {step === "done" && (
            <div className="text-center py-10">
              <CheckCircle2 className="h-20 w-20 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-black text-foreground mb-2">مرحباً بك! 🎉</h2>
              <p className="text-muted-foreground text-sm">تم إنشاء حسابك بنجاح، جاري التحويل...</p>
            </div>
          )}

          {step === "verify" && (
            <div>
              <div className="mb-8">
                <h2 className="text-2xl font-black text-foreground mb-1">تحقق من بريدك</h2>
                <p className="text-muted-foreground text-sm">
                  أرسلنا رمزاً من 6 أرقام إلى{" "}
                  <span className="text-foreground font-semibold">{email}</span>
                </p>
              </div>
              <form onSubmit={handleVerify} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-foreground">رمز التحقق</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={code}
                    onChange={e => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="1 2 3 4 5 6"
                    required
                    maxLength={6}
                    dir="ltr"
                    className="w-full h-14 px-4 rounded-xl border border-input bg-card text-foreground text-2xl font-mono text-center outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all tracking-[0.5em]"
                  />
                </div>
                {error && (
                  <div className="rounded-xl bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
                    {error}
                  </div>
                )}
                <button
                  type="submit"
                  disabled={loading || code.length < 6}
                  className="w-full h-11 rounded-xl bg-primary text-primary-foreground font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  {loading ? "جاري التحقق..." : "تأكيد الرمز"}
                </button>
                <button
                  type="button"
                  onClick={() => { setStep("form"); setError(""); setCode(""); }}
                  className="w-full h-10 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  ← تغيير البريد الإلكتروني
                </button>
              </form>
            </div>
          )}

          {step === "form" && (
            <div>
              <div className="mb-7">
                <h2 className="text-2xl font-black text-foreground mb-1">إنشاء حساب</h2>
                <p className="text-muted-foreground text-sm">انضم إلى السوق المحلي الجزائري مجاناً</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-foreground">الاسم الأول</label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={e => setFirstName(e.target.value)}
                      placeholder="أحمد"
                      required
                      className="w-full h-11 px-3 rounded-xl border border-input bg-card text-foreground text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all placeholder:text-muted-foreground"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-foreground">اسم العائلة</label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={e => setLastName(e.target.value)}
                      placeholder="بن علي"
                      required
                      className="w-full h-11 px-3 rounded-xl border border-input bg-card text-foreground text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all placeholder:text-muted-foreground"
                    />
                  </div>
                </div>

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
                      placeholder="8 أحرف على الأقل"
                      required
                      minLength={8}
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
                  {password.length > 0 && password.length < 8 && (
                    <p className="text-xs text-destructive/80">كلمة المرور يجب أن تكون 8 أحرف على الأقل</p>
                  )}
                  {password.length >= 8 && (
                    <p className="text-xs text-[hsl(78_35%_38%)]">✓ كلمة مرور قوية</p>
                  )}
                </div>

                {error && (
                  <div className="rounded-xl bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !isFormComplete}
                  className="w-full h-11 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md disabled:cursor-not-allowed"
                  style={{
                    background: isFormComplete ? "hsl(15 85% 52%)" : "hsl(35 22% 88%)",
                    color: isFormComplete ? "white" : "hsl(25 12% 55%)",
                    opacity: loading ? 0.7 : 1,
                  }}
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  {loading ? "جاري الإنشاء..." : "إنشاء الحساب"}
                </button>
              </form>

              <p className="text-center text-sm text-muted-foreground mt-6">
                لديك حساب بالفعل؟{" "}
                <Link href="/sign-in" className="text-primary font-bold hover:underline">
                  سجّل الدخول
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
