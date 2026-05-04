import { useState, useEffect } from "react";
import { useI18n } from "@/contexts/I18nContext";
import { useGetMyProfile, useUpdateMyProfile } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { useUser } from "@clerk/react";
import { Link } from "wouter";
import {
  User, Save, MapPin, Store, Globe, Phone, Instagram, Facebook,
  Twitter, ExternalLink, MessageCircle, Image, CheckCircle2, ChevronRight
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const WILAYAS = [
  "Adrar","Chlef","Laghouat","Oum El Bouaghi","Batna","Béjaïa","Biskra","Béchar",
  "Blida","Bouira","Tamanrasset","Tébessa","Tlemcen","Tiaret","Tizi Ouzou","Alger",
  "Djelfa","Jijel","Sétif","Saïda","Skikda","Sidi Bel Abbès","Annaba","Guelma",
  "Constantine","Médéa","Mostaganem","Msila","Mascara","Ouargla","Oran","El Bayadh",
  "Illizi","Bordj Bou Arréridj","Boumerdès","El Tarf","Tindouf","Tissemsilt","El Oued",
  "Khenchela","Souk Ahras","Tipaza","Mila","Aïn Defla","Naâma","Aïn Témouchent",
  "Ghardaïa","Relizane",
];

type TabKey = "personal" | "location" | "store" | "social";

export default function ProfilePage() {
  const { language, dir } = useI18n();
  const { user } = useUser();
  const { toast } = useToast();
  const { data: profile, isLoading } = useGetMyProfile();
  const updateProfile = useUpdateMyProfile();
  const p = profile as any;

  const [activeTab, setActiveTab] = useState<TabKey>("personal");
  const [form, setForm] = useState({
    displayName: "",
    bio: "",
    phone: "",
    wilaya: "",
    city: "",
    avatarUrl: "",
    coverImageUrl: "",
    website: "",
    isStore: false,
    storeName: "",
    storeDescription: "",
    instagramHandle: "",
    facebookUrl: "",
    twitterHandle: "",
    whatsapp: "",
  });

  const t = (ar: string, fr: string, en: string) =>
    language === "ar" ? ar : language === "fr" ? fr : en;

  useEffect(() => {
    if (p) {
      const social = (p.socialLinks as any) || {};
      setForm({
        displayName: p.displayName || user?.fullName || "",
        bio: p.bio || "",
        phone: p.phone || "",
        wilaya: p.wilaya || "",
        city: p.city || "",
        avatarUrl: p.avatarUrl || "",
        coverImageUrl: p.coverImageUrl || "",
        website: p.website || "",
        isStore: p.isStore || false,
        storeName: p.storeName || "",
        storeDescription: p.storeDescription || "",
        instagramHandle: social.instagram || "",
        facebookUrl: social.facebook || "",
        twitterHandle: social.twitter || "",
        whatsapp: social.whatsapp || "",
      });
    } else if (user) {
      setForm(f => ({
        ...f,
        displayName: user.fullName || "",
        avatarUrl: user.imageUrl || "",
      }));
    }
  }, [p, user]);

  const set = (key: string, value: any) => setForm(f => ({ ...f, [key]: value }));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: any = {
        displayName: form.displayName,
        bio: form.bio,
        phone: form.phone,
        wilaya: form.wilaya,
        city: form.city,
        avatarUrl: form.avatarUrl,
        coverImageUrl: form.coverImageUrl,
        website: form.website,
        isStore: form.isStore,
        storeName: form.storeName,
        storeDescription: form.storeDescription,
        socialLinks: {
          ...(form.instagramHandle ? { instagram: form.instagramHandle } : {}),
          ...(form.facebookUrl ? { facebook: form.facebookUrl } : {}),
          ...(form.twitterHandle ? { twitter: form.twitterHandle } : {}),
          ...(form.whatsapp ? { whatsapp: form.whatsapp } : {}),
        },
      };
      await updateProfile.mutateAsync(payload);
      toast({
        title: t("✓ تم حفظ الملف الشخصي", "✓ Profil mis à jour", "✓ Profile saved"),
        description: t("تم تحديث معلوماتك بنجاح", "Vos informations ont été mises à jour", "Your info has been updated"),
      });
    } catch {
      toast({
        title: t("خطأ في الحفظ", "Erreur", "Save error"),
        variant: "destructive",
      });
    }
  };

  if (isLoading) return (
    <div className="container mx-auto px-4 py-8 max-w-2xl space-y-4">
      <Skeleton className="h-8 w-40" />
      <Skeleton className="h-32 w-full rounded-xl" />
      <Skeleton className="h-64 rounded-xl" />
    </div>
  );

  const tabs: { key: TabKey; label: string; icon: any }[] = [
    { key: "personal", label: t("شخصي", "Personnel", "Personal"), icon: User },
    { key: "location", label: t("الموقع", "Localisation", "Location"), icon: MapPin },
    { key: "store", label: t("المتجر", "Boutique", "Store"), icon: Store },
    { key: "social", label: t("التواصل", "Réseaux", "Social"), icon: Globe },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black">{t("إعدادات الملف", "Paramètres du profil", "Profile Settings")}</h1>
        <Link href={user?.id ? `/profiles/${user.id}` : "#"}>
          <Button variant="outline" size="sm" className="rounded-full gap-2 text-xs">
            <ExternalLink className="h-3.5 w-3.5" />
            {t("عرض ملفي", "Voir mon profil", "View my profile")}
          </Button>
        </Link>
      </div>

      {/* Avatar + Cover preview */}
      <div className="relative mb-8 rounded-2xl overflow-hidden border bg-muted/20">
        <div
          className="h-28 w-full"
          style={{
            background: form.coverImageUrl
              ? `url(${form.coverImageUrl}) center/cover no-repeat`
              : "linear-gradient(135deg, hsl(var(--primary)/20), hsl(var(--accent)/15))",
          }}
        />
        <div className="px-5 pb-5">
          <div className="flex items-end gap-4 -mt-10">
            <div className="h-20 w-20 rounded-full border-4 border-background shadow-lg overflow-hidden bg-muted flex items-center justify-center shrink-0">
              {form.avatarUrl || user?.imageUrl
                ? <img src={form.avatarUrl || user?.imageUrl} alt="" className="w-full h-full object-cover" />
                : <User className="h-10 w-10 text-muted-foreground/40" />
              }
            </div>
            <div className="pb-1">
              <p className="font-bold text-base">{form.displayName || user?.fullName}</p>
              <p className="text-xs text-muted-foreground">{user?.primaryEmailAddress?.emailAddress}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tab nav */}
      <div className="flex gap-1 border-b mb-6 overflow-x-auto no-scrollbar">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-all relative ${
              activeTab === tab.key ? "text-primary" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
            {activeTab === tab.key && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
            )}
          </button>
        ))}
      </div>

      <form onSubmit={handleSave}>
        {/* Personal tab */}
        {activeTab === "personal" && (
          <Card className="border-0 bg-muted/20 animate-fade-in-up">
            <CardContent className="p-5 space-y-4">
              <div>
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  {t("الاسم المعروض", "Nom affiché", "Display Name")}
                </Label>
                <Input
                  value={form.displayName}
                  onChange={e => set("displayName", e.target.value)}
                  className={`mt-1.5 ${dir === "rtl" ? "text-right" : ""}`}
                  placeholder={t("اسمك...", "Votre nom...", "Your name...")}
                />
              </div>
              <div>
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  {t("نبذة عني", "À propos", "Bio")}
                </Label>
                <Textarea
                  value={form.bio}
                  onChange={e => set("bio", e.target.value)}
                  rows={3}
                  className={`mt-1.5 resize-none ${dir === "rtl" ? "text-right" : ""}`}
                  placeholder={t("اكتب نبذة قصيرة عنك...", "Décrivez-vous en quelques mots...", "Write a short bio...")}
                />
              </div>
              <div>
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  {t("رقم الهاتف", "Téléphone", "Phone")}
                </Label>
                <div className="relative mt-1.5">
                  <Phone className={`absolute ${dir === "rtl" ? "right-3" : "left-3"} top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground`} />
                  <Input
                    value={form.phone}
                    onChange={e => set("phone", e.target.value)}
                    type="tel"
                    className={dir === "rtl" ? "pr-10" : "pl-10"}
                    placeholder="+213..."
                  />
                </div>
              </div>
              <Separator />
              <div>
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                  <Image className="h-3.5 w-3.5" />
                  {t("رابط الصورة الشخصية", "URL de photo de profil", "Avatar URL")}
                </Label>
                <Input
                  value={form.avatarUrl}
                  onChange={e => set("avatarUrl", e.target.value)}
                  className="mt-1.5"
                  placeholder="https://..."
                />
              </div>
              <div>
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                  <Image className="h-3.5 w-3.5" />
                  {t("رابط صورة الغلاف", "URL de couverture", "Cover Image URL")}
                </Label>
                <Input
                  value={form.coverImageUrl}
                  onChange={e => set("coverImageUrl", e.target.value)}
                  className="mt-1.5"
                  placeholder="https://..."
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Location tab */}
        {activeTab === "location" && (
          <Card className="border-0 bg-muted/20 animate-fade-in-up">
            <CardContent className="p-5 space-y-4">
              <div>
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  {t("الولاية", "Wilaya", "Wilaya")}
                </Label>
                <Select value={form.wilaya} onValueChange={v => set("wilaya", v)}>
                  <SelectTrigger className="mt-1.5">
                    <MapPin className="h-4 w-4 text-muted-foreground me-2" />
                    <SelectValue placeholder={t("اختر الولاية", "Choisir une wilaya", "Choose wilaya")} />
                  </SelectTrigger>
                  <SelectContent>
                    {WILAYAS.map(w => <SelectItem key={w} value={w}>{w}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  {t("المدينة / البلدية", "Commune / Ville", "City / Town")}
                </Label>
                <Input
                  value={form.city}
                  onChange={e => set("city", e.target.value)}
                  placeholder={t("المدينة...", "Ville...", "City...")}
                  className="mt-1.5"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Store tab */}
        {activeTab === "store" && (
          <Card className="border-0 bg-muted/20 animate-fade-in-up">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-card border">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Store className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{t("حساب تاجر", "Compte marchand", "Merchant Account")}</p>
                    <p className="text-xs text-muted-foreground">{t("فعّل للحصول على ميزات المتجر", "Activez pour les fonctionnalités boutique", "Enable for store features")}</p>
                  </div>
                </div>
                <Switch checked={form.isStore} onCheckedChange={v => set("isStore", v)} />
              </div>

              {form.isStore && (
                <>
                  <div>
                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      {t("اسم المتجر", "Nom de la boutique", "Store Name")}
                    </Label>
                    <Input
                      value={form.storeName}
                      onChange={e => set("storeName", e.target.value)}
                      className="mt-1.5"
                      placeholder={t("اسم متجرك...", "Nom de votre boutique...", "Your store name...")}
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      {t("وصف المتجر", "Description de la boutique", "Store Description")}
                    </Label>
                    <Textarea
                      value={form.storeDescription}
                      onChange={e => set("storeDescription", e.target.value)}
                      rows={4}
                      className={`mt-1.5 resize-none ${dir === "rtl" ? "text-right" : ""}`}
                      placeholder={t("صف نشاطك التجاري...", "Décrivez votre activité...", "Describe your business...")}
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* Social tab */}
        {activeTab === "social" && (
          <Card className="border-0 bg-muted/20 animate-fade-in-up">
            <CardContent className="p-5 space-y-4">
              <div>
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                  <Globe className="h-3.5 w-3.5" />
                  {t("الموقع الإلكتروني", "Site web", "Website")}
                </Label>
                <Input
                  value={form.website}
                  onChange={e => set("website", e.target.value)}
                  className="mt-1.5"
                  placeholder="https://monsite.com"
                />
              </div>
              <Separator />
              <div>
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                  <Instagram className="h-3.5 w-3.5 text-pink-500" />
                  Instagram
                </Label>
                <div className="relative mt-1.5">
                  <span className={`absolute ${dir === "rtl" ? "right-3" : "left-3"} top-1/2 -translate-y-1/2 text-muted-foreground text-sm`}>@</span>
                  <Input
                    value={form.instagramHandle}
                    onChange={e => set("instagramHandle", e.target.value)}
                    className={dir === "rtl" ? "pr-8" : "pl-8"}
                    placeholder="username"
                  />
                </div>
              </div>
              <div>
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                  <Facebook className="h-3.5 w-3.5 text-blue-600" />
                  Facebook
                </Label>
                <Input
                  value={form.facebookUrl}
                  onChange={e => set("facebookUrl", e.target.value)}
                  className="mt-1.5"
                  placeholder="https://facebook.com/..."
                />
              </div>
              <div>
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                  <Twitter className="h-3.5 w-3.5 text-sky-500" />
                  Twitter / X
                </Label>
                <div className="relative mt-1.5">
                  <span className={`absolute ${dir === "rtl" ? "right-3" : "left-3"} top-1/2 -translate-y-1/2 text-muted-foreground text-sm`}>@</span>
                  <Input
                    value={form.twitterHandle}
                    onChange={e => set("twitterHandle", e.target.value)}
                    className={dir === "rtl" ? "pr-8" : "pl-8"}
                    placeholder="username"
                  />
                </div>
              </div>
              <div>
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                  <MessageCircle className="h-3.5 w-3.5 text-green-500" />
                  WhatsApp
                </Label>
                <div className="relative mt-1.5">
                  <Phone className={`absolute ${dir === "rtl" ? "right-3" : "left-3"} top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground`} />
                  <Input
                    value={form.whatsapp}
                    onChange={e => set("whatsapp", e.target.value)}
                    className={dir === "rtl" ? "pr-10" : "pl-10"}
                    placeholder="+213..."
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Button
          type="submit"
          className="w-full gap-2 mt-5 rounded-xl h-12 text-base font-bold shadow-lg shadow-primary/20"
          size="lg"
          disabled={updateProfile.isPending}
        >
          {updateProfile.isPending ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              {t("جارٍ الحفظ...", "Enregistrement...", "Saving...")}
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              {t("حفظ التغييرات", "Enregistrer les modifications", "Save Changes")}
            </span>
          )}
        </Button>
      </form>
    </div>
  );
}
