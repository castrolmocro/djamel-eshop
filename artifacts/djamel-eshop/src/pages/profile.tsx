import { useState, useEffect } from "react";
import { useI18n } from "@/contexts/I18nContext";
import { useGetMyProfile, useUpdateMyProfile } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useUser } from "@clerk/react";
import { User, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const WILAYAS = [
  "Alger", "Oran", "Constantine", "Annaba", "Blida", "Batna", "Djelfa",
  "Sétif", "Sidi Bel Abbès", "Biskra", "Tébessa", "El Oued", "Skikda",
  "Tiaret", "Béjaïa", "Tlemcen", "Ouargla", "Mostaganem", "Bordj Bou Arréridj",
  "Chlef", "Souk Ahras", "Médéa", "Guelma", "Jijel", "Msila",
];

export default function ProfilePage() {
  const { language, dir } = useI18n();
  const { user } = useUser();
  const { toast } = useToast();
  const { data: profile, isLoading } = useGetMyProfile();
  const updateProfile = useUpdateMyProfile();

  const [form, setForm] = useState({
    displayName: "",
    bio: "",
    phone: "",
    wilaya: "",
    city: "",
    avatarUrl: "",
  });

  const p = profile as any;

  useEffect(() => {
    if (p) {
      setForm({
        displayName: p.displayName || user?.fullName || "",
        bio: p.bio || "",
        phone: p.phone || "",
        wilaya: p.wilaya || "",
        city: p.city || "",
        avatarUrl: p.avatarUrl || "",
      });
    } else if (user) {
      setForm(f => ({ ...f, displayName: user.fullName || "", avatarUrl: user.imageUrl || "" }));
    }
  }, [p, user]);

  const label = (ar: string, fr: string, en: string) =>
    language === "ar" ? ar : language === "fr" ? fr : en;

  const set = (key: string, value: string) => setForm(f => ({ ...f, [key]: value }));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile.mutateAsync(form as any);
      toast({ title: label("تم حفظ الملف الشخصي", "Profil mis à jour", "Profile saved") });
    } catch {
      toast({ title: label("خطأ في الحفظ", "Erreur", "Save error"), variant: "destructive" });
    }
  };

  if (isLoading) return (
    <div className="container mx-auto px-4 py-8 max-w-2xl space-y-4">
      <Skeleton className="h-8 w-40" />
      <Skeleton className="h-64 rounded-xl" />
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">{label("الملف الشخصي", "Mon Profil", "My Profile")}</h1>

      {/* Avatar preview */}
      <div className="flex items-center gap-4 mb-8">
        <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center overflow-hidden border-2 border-primary/20">
          {form.avatarUrl
            ? <img src={form.avatarUrl} alt="" className="w-full h-full object-cover" />
            : user?.imageUrl
            ? <img src={user.imageUrl} alt="" className="w-full h-full object-cover" />
            : <User className="h-10 w-10 text-muted-foreground" />
          }
        </div>
        <div>
          <p className="font-semibold text-lg">{form.displayName || user?.fullName}</p>
          <p className="text-sm text-muted-foreground">{user?.primaryEmailAddress?.emailAddress}</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <Card>
          <CardHeader><CardTitle className="text-base">{label("المعلومات الشخصية", "Informations personnelles", "Personal Info")}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>{label("الاسم المعروض", "Nom affiché", "Display Name")}</Label>
              <Input value={form.displayName} onChange={e => set("displayName", e.target.value)} className={`mt-1 ${dir === "rtl" ? "text-right" : ""}`} />
            </div>
            <div>
              <Label>{label("نبذة عني", "À propos", "About me")}</Label>
              <Textarea value={form.bio} onChange={e => set("bio", e.target.value)} rows={3} className={`mt-1 ${dir === "rtl" ? "text-right" : ""}`} placeholder={label("اكتب نبذة قصيرة عنك...", "Écrivez quelques mots...", "Write a short bio...")} />
            </div>
            <div>
              <Label>{label("رقم الهاتف", "Téléphone", "Phone Number")}</Label>
              <Input value={form.phone} onChange={e => set("phone", e.target.value)} type="tel" className="mt-1" placeholder="+213..." />
            </div>
            <div>
              <Label>{label("رابط الصورة الشخصية", "URL photo de profil", "Avatar URL")}</Label>
              <Input value={form.avatarUrl} onChange={e => set("avatarUrl", e.target.value)} className="mt-1" placeholder="https://..." />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">{label("الموقع", "Localisation", "Location")}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>{label("الولاية", "Wilaya", "Wilaya")}</Label>
              <Select value={form.wilaya} onValueChange={v => set("wilaya", v)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder={label("اختر الولاية", "Choisir une wilaya", "Choose wilaya")} />
                </SelectTrigger>
                <SelectContent>
                  {WILAYAS.map(w => <SelectItem key={w} value={w}>{w}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>{label("المدينة", "Ville", "City")}</Label>
              <Input value={form.city} onChange={e => set("city", e.target.value)} placeholder={label("المدينة...", "Ville...", "City...")} className="mt-1" />
            </div>
          </CardContent>
        </Card>

        <Button type="submit" className="w-full gap-2" size="lg" disabled={updateProfile.isPending}>
          <Save className="h-4 w-4" />
          {updateProfile.isPending
            ? label("جارٍ الحفظ...", "Enregistrement...", "Saving...")
            : label("حفظ التغييرات", "Enregistrer", "Save Changes")}
        </Button>
      </form>
    </div>
  );
}
