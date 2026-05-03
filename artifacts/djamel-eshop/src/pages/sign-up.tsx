import { useState } from "react";
import { useSignUp } from "@clerk/react";
import { Link, useLocation } from "wouter";
import { ShoppingBag, Eye, EyeOff, Loader2, CheckCircle2, ArrowRight } from "lucide-react";

type Step = "form" | "verify" | "done";

export default function SignUpPage() {
  const { isLoaded, signUp, setActive } = useSignUp();
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isLoaded || !signUp) return;
    setLoading(true);
    setError("");
    try {
      await signUp.create({
        firstName,
        lastName,
        emailAddress: email,
        password,
      });
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setStep("verify");
    } catch (err: any) {
      const msg = err?.errors?.[0]?.longMessage ?? err?.errors?.[0]?.message ?? err?.message ?? "حدث خطأ، حاول مجدداً";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    if (!isLoaded || !signUp) return;
    setLoading(true);
    setError("");
    try {
      const result = await signUp.attemptEmailAddressVerification({ code });
      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        setStep("done");
        setTimeout(() => navigate("/"), 1500);
      } else {
        setError("رمز غير صحيح، حاول مجدداً");
      }
    } catch (err: any) {
      const msg = err?.errors?.[0]?.longMessage ?? err?.errors?.[0]?.message ?? err?.message ?? "رمز غير صحيح";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100dvh-4rem)] items-center justify-center bg-muted/30 px-4 py-12">
      <div className="w-full max-w-md">

        {/* Card */}
        <div className="bg-card border rounded-2xl shadow-lg overflow-hidden">

          {/* Header */}
          <div className="bg-gradient-to-br from-primary/10 to-primary/5 px-8 pt-8 pb-6 text-center border-b">
            <div className="flex justify-center mb-4">
              <div className="h-14 w-14 rounded-2xl bg-primary/15 flex items-center justify-center">
                <ShoppingBag className="h-7 w-7 text-primary" />
              </div>
            </div>
            <h1 className="text-2xl font-black text-foreground mb-1">
              {step === "verify" ? "تحقق من بريدك" : step === "done" ? "مرحباً بك! 🎉" : "إنشاء حساب"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {step === "verify"
                ? `أرسلنا رمزاً إلى ${email}`
                : step === "done"
                ? "تم التسجيل بنجاح"
                : "انضم إلى السوق المحلي الجزائري"}
            </p>
          </div>

          <div className="px-8 py-6">

            {/* Done state */}
            {step === "done" && (
              <div className="flex flex-col items-center gap-4 py-4 text-center">
                <CheckCircle2 className="h-16 w-16 text-green-500" />
                <p className="text-muted-foreground text-sm">جاري تحويلك للصفحة الرئيسية...</p>
              </div>
            )}

            {/* Registration Form */}
            {step === "form" && (
              <form onSubmit={handleSubmit} className="space-y-4" dir="rtl">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground">الاسم الأول</label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={e => setFirstName(e.target.value)}
                      placeholder="أحمد"
                      required
                      className="w-full h-10 px-3 rounded-xl border border-input bg-background text-foreground text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground">اسم العائلة</label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={e => setLastName(e.target.value)}
                      placeholder="بن علي"
                      required
                      className="w-full h-10 px-3 rounded-xl border border-input bg-background text-foreground text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">البريد الإلكتروني</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="example@email.com"
                    required
                    dir="ltr"
                    className="w-full h-10 px-3 rounded-xl border border-input bg-background text-foreground text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition text-left"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">كلمة المرور</label>
                  <div className="relative">
                    <input
                      type={showPass ? "text" : "password"}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="8 أحرف على الأقل"
                      required
                      minLength={8}
                      dir="ltr"
                      className="w-full h-10 px-3 pr-10 rounded-xl border border-input bg-background text-foreground text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition text-left"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
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
                  disabled={loading || !isLoaded}
                  className="w-full h-11 rounded-xl bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 hover:bg-primary/90 transition disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  {loading ? "جاري الإنشاء..." : "إنشاء الحساب"}
                </button>
              </form>
            )}

            {/* Verification Form */}
            {step === "verify" && (
              <form onSubmit={handleVerify} className="space-y-4" dir="rtl">
                <p className="text-sm text-muted-foreground text-center">
                  أدخل الرمز المكون من 6 أرقام الذي أرسلناه إلى بريدك الإلكتروني
                </p>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">رمز التحقق</label>
                  <input
                    type="text"
                    value={code}
                    onChange={e => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="123456"
                    required
                    maxLength={6}
                    dir="ltr"
                    className="w-full h-12 px-3 rounded-xl border border-input bg-background text-foreground text-xl font-mono text-center outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition tracking-widest"
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
                  className="w-full h-11 rounded-xl bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 hover:bg-primary/90 transition disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  {loading ? "جاري التحقق..." : "تأكيد الرمز"}
                </button>

                <button
                  type="button"
                  onClick={() => { setStep("form"); setError(""); setCode(""); }}
                  className="w-full h-9 text-sm text-muted-foreground hover:text-foreground transition"
                >
                  ← تغيير البريد الإلكتروني
                </button>
              </form>
            )}
          </div>

          {/* Footer */}
          {step === "form" && (
            <div className="px-8 pb-6 text-center border-t pt-4">
              <p className="text-sm text-muted-foreground">
                لديك حساب بالفعل؟{" "}
                <Link href="/sign-in" className="text-primary font-semibold hover:underline">
                  سجّل الدخول
                </Link>
              </p>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-muted-foreground mt-4">
          بإنشاء حساب، أنت توافق على شروط الاستخدام وسياسة الخصوصية
        </p>
      </div>
    </div>
  );
}
