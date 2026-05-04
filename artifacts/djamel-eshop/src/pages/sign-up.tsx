import { useState } from "react";
import { useSignUp } from "@clerk/react";
import { Link, useLocation } from "wouter";
import { Eye, EyeOff, Loader2, ShoppingBag, CheckCircle2 } from "lucide-react";

const basePath = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";

type OAuthProvider = "oauth_google" | "oauth_facebook" | "oauth_twitter" | "oauth_tiktok";

const oauthProviders: { id: OAuthProvider; label: string; bg: string; icon: string }[] = [
  {
    id: "oauth_google",
    label: "Google",
    bg: "hover:bg-red-50 border-gray-200 hover:border-red-200",
    icon: `<svg viewBox="0 0 24 24" width="18" height="18"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>`,
  },
  {
    id: "oauth_facebook",
    label: "Facebook",
    bg: "hover:bg-blue-50 border-gray-200 hover:border-blue-200",
    icon: `<svg viewBox="0 0 24 24" width="18" height="18" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>`,
  },
  {
    id: "oauth_twitter",
    label: "Twitter / X",
    bg: "hover:bg-gray-50 border-gray-200 hover:border-gray-400",
    icon: `<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.74l7.73-8.835L1.254 2.25H8.08l4.259 5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`,
  },
  {
    id: "oauth_tiktok",
    label: "TikTok",
    bg: "hover:bg-gray-50 border-gray-200 hover:border-gray-400",
    icon: `<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.22 8.22 0 004.79 1.52V6.76a4.85 4.85 0 01-1.02-.07z"/></svg>`,
  },
];

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
  const [oauthLoading, setOauthLoading] = useState<OAuthProvider | null>(null);
  const [error, setError] = useState("");

  const isFormReady = firstName.trim() && lastName.trim() && email.trim() && password.length >= 8;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isLoaded || !signUp) return;
    setLoading(true);
    setError("");
    try {
      await signUp.create({ firstName, lastName, emailAddress: email, password });
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setStep("verify");
    } catch (err: any) {
      setError(err?.errors?.[0]?.longMessage ?? err?.errors?.[0]?.message ?? "حدث خطأ، حاول مجدداً");
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
      setError(err?.errors?.[0]?.longMessage ?? err?.errors?.[0]?.message ?? "رمز غير صحيح");
    } finally {
      setLoading(false);
    }
  }

  async function handleOAuth(provider: OAuthProvider) {
    if (!isLoaded || !signUp) return;
    setOauthLoading(provider);
    setError("");
    try {
      await signUp.authenticateWithRedirect({
        strategy: provider,
        redirectUrl: `${basePath}/sign-up`,
        redirectUrlComplete: `${basePath}/`,
      });
    } catch (err: any) {
      setError(err?.errors?.[0]?.message ?? "فشل إنشاء الحساب بهذه الطريقة");
      setOauthLoading(null);
    }
  }

  const stepTitle = step === "verify" ? "تحقق من بريدك" : step === "done" ? "مرحباً بك! 🎉" : "إنشاء حساب";
  const stepSubtitle = step === "verify"
    ? `أرسلنا رمزاً إلى ${email}`
    : step === "done"
    ? "تم التسجيل بنجاح، جاري التحويل..."
    : "انضم إلى السوق المحلي الجزائري";

  return (
    <div className="min-h-[calc(100dvh-4rem)] flex items-center justify-center bg-gradient-to-br from-orange-50/60 via-amber-50/30 to-white px-4 py-10" dir="rtl">
      <div className="w-full max-w-md">

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">

          {/* Header */}
          <div className="relative px-8 pt-10 pb-7 text-center overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/8 via-amber-400/5 to-transparent" />
            <div className="relative">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br from-orange-400 to-amber-500 shadow-lg shadow-orange-200 mb-4 mx-auto">
                <ShoppingBag className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-2xl font-black text-gray-900 mb-1">{stepTitle}</h1>
              <p className="text-sm text-gray-500">{stepSubtitle}</p>
            </div>
          </div>

          <div className="px-8 pb-8">

            {/* Done */}
            {step === "done" && (
              <div className="flex flex-col items-center gap-4 py-6 text-center">
                <CheckCircle2 className="h-20 w-20 text-green-500" />
                <p className="text-gray-500 text-sm">جاري تحويلك للصفحة الرئيسية...</p>
              </div>
            )}

            {/* Verify */}
            {step === "verify" && (
              <form onSubmit={handleVerify} className="space-y-4">
                <p className="text-sm text-gray-500 text-center mb-2">
                  أدخل الرمز المكون من 6 أرقام الذي أرسلناه إلى بريدك الإلكتروني
                </p>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">رمز التحقق</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={code}
                    onChange={e => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="123456"
                    required
                    maxLength={6}
                    dir="ltr"
                    className="w-full h-14 px-4 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 text-2xl font-mono text-center outline-none focus:ring-2 focus:ring-orange-400/40 focus:border-orange-400 focus:bg-white transition-all tracking-widest"
                  />
                </div>

                {error && (
                  <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || code.length < 6}
                  className="w-full h-12 rounded-xl bg-gradient-to-l from-orange-500 to-amber-500 text-white font-bold text-sm flex items-center justify-center gap-2 hover:from-orange-600 hover:to-amber-600 transition-all shadow-lg shadow-orange-200 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  {loading ? "جاري التحقق..." : "تأكيد الرمز"}
                </button>
                <button
                  type="button"
                  onClick={() => { setStep("form"); setError(""); setCode(""); }}
                  className="w-full h-10 text-sm text-gray-400 hover:text-gray-600 transition-colors"
                >
                  ← تغيير البريد الإلكتروني
                </button>
              </form>
            )}

            {/* Registration Form */}
            {step === "form" && (
              <div className="space-y-5">
                {/* OAuth */}
                <div className="grid grid-cols-2 gap-3">
                  {oauthProviders.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleOAuth(p.id)}
                      disabled={!!oauthLoading}
                      className={`flex items-center justify-center gap-2 h-11 rounded-xl border bg-white text-gray-700 text-sm font-medium transition-all duration-200 ${p.bg} disabled:opacity-60 disabled:cursor-not-allowed shadow-sm hover:shadow-md`}
                    >
                      {oauthLoading === p.id
                        ? <Loader2 className="h-4 w-4 animate-spin" />
                        : <span dangerouslySetInnerHTML={{ __html: p.icon }} />
                      }
                      <span>{p.label}</span>
                    </button>
                  ))}
                </div>

                {/* Divider */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-gray-100" />
                  <span className="text-xs text-gray-400 font-medium">أو بالبريد الإلكتروني</span>
                  <div className="flex-1 h-px bg-gray-100" />
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-gray-700">الاسم الأول</label>
                      <input
                        type="text"
                        value={firstName}
                        onChange={e => setFirstName(e.target.value)}
                        placeholder="أحمد"
                        required
                        className="w-full h-11 px-4 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 text-sm outline-none focus:ring-2 focus:ring-orange-400/40 focus:border-orange-400 focus:bg-white transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-gray-700">اسم العائلة</label>
                      <input
                        type="text"
                        value={lastName}
                        onChange={e => setLastName(e.target.value)}
                        placeholder="بن علي"
                        required
                        className="w-full h-11 px-4 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 text-sm outline-none focus:ring-2 focus:ring-orange-400/40 focus:border-orange-400 focus:bg-white transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-700">البريد الإلكتروني</label>
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="example@email.com"
                      required
                      dir="ltr"
                      className="w-full h-11 px-4 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 text-sm outline-none focus:ring-2 focus:ring-orange-400/40 focus:border-orange-400 focus:bg-white transition-all text-left"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-700">كلمة المرور</label>
                    <div className="relative">
                      <input
                        type={showPass ? "text" : "password"}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="8 أحرف على الأقل"
                        required
                        minLength={8}
                        dir="ltr"
                        className="w-full h-11 px-4 pr-11 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 text-sm outline-none focus:ring-2 focus:ring-orange-400/40 focus:border-orange-400 focus:bg-white transition-all text-left"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPass(!showPass)}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {password.length > 0 && password.length < 8 && (
                      <p className="text-xs text-amber-500 mt-1">كلمة المرور يجب أن تكون 8 أحرف على الأقل</p>
                    )}
                  </div>

                  {error && (
                    <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading || !isFormReady}
                    className={`w-full h-12 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg disabled:cursor-not-allowed ${
                      isFormReady
                        ? "bg-gradient-to-l from-violet-600 to-violet-500 text-white hover:from-violet-700 hover:to-violet-600 shadow-violet-200"
                        : "bg-gray-100 text-gray-400 shadow-none"
                    }`}
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    {loading ? "جاري الإنشاء..." : "إنشاء الحساب"}
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* Footer */}
          {step === "form" && (
            <div className="px-8 py-5 border-t border-gray-50 bg-gray-50/50 text-center">
              <p className="text-sm text-gray-500">
                لديك حساب بالفعل؟{" "}
                <Link href="/sign-in" className="text-orange-500 font-bold hover:text-orange-600 transition-colors">
                  سجّل الدخول
                </Link>
              </p>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-gray-400 mt-4">
          بإنشاء حساب، أنت توافق على شروط الاستخدام وسياسة الخصوصية
        </p>
      </div>
    </div>
  );
}
