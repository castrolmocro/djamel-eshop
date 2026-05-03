import { useState } from "react";
import { useI18n } from "@/contexts/I18nContext";
import { useLocation } from "wouter";
import { useListCategories, useCreateListing } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, ArrowRight, Plus } from "lucide-react";

const WILAYAS = [
  "Alger", "Oran", "Constantine", "Annaba", "Blida", "Batna", "Djelfa",
  "Sétif", "Sidi Bel Abbès", "Biskra", "Tébessa", "El Oued", "Skikda",
  "Tiaret", "Béjaïa", "Tlemcen", "Ouargla", "Mostaganem", "Bordj Bou Arréridj",
  "Chlef", "Souk Ahras", "Médéa", "Guelma", "Jijel", "Msila",
];

export default function CreateListingPage() {
  const { language, dir } = useI18n();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const { data: categories } = useListCategories();
  const createListing = useCreateListing();

  const [form, setForm] = useState({
    titleAr: "",
    titleFr: "",
    descriptionAr: "",
    descriptionFr: "",
    price: "",
    listingType: "product",
    categoryId: "",
    wilaya: "",
    city: "",
    images: [] as string[],
    imageUrl: "",
  });

  const label = (ar: string, fr: string, en: string) =>
    language === "ar" ? ar : language === "fr" ? fr : en;

  const set = (key: string, value: string) => setForm(f => ({ ...f, [key]: value }));

  const addImage = () => {
    if (form.imageUrl.trim()) {
      setForm(f => ({ ...f, images: [...f.images, f.imageUrl.trim()], imageUrl: "" }));
    }
  };

  const removeImage = (i: number) => {
    setForm(f => ({ ...f, images: f.images.filter((_, j) => j !== i) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.titleAr.trim()) {
      toast({ title: label("العنوان بالعربية مطلوب", "Titre en arabe requis", "Arabic title required"), variant: "destructive" });
      return;
    }
    try {
      const listing = await createListing.mutateAsync({
        titleAr: form.titleAr,
        titleFr: form.titleFr || undefined,
        descriptionAr: form.descriptionAr || undefined,
        descriptionFr: form.descriptionFr || undefined,
        price: form.price ? form.price : undefined,
        listingType: form.listingType as any,
        categoryId: form.categoryId ? Number(form.categoryId) : undefined,
        wilaya: form.wilaya || undefined,
        city: form.city || undefined,
        images: form.images,
      } as any);
      toast({ title: label("تم نشر إعلانك!", "Annonce publiée!", "Listing published!") });
      navigate(`/listings/${(listing as any).id}`);
    } catch {
      toast({ title: label("خطأ في النشر", "Erreur publication", "Publishing error"), variant: "destructive" });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate("/listings")}>
          {dir === "rtl" ? <ArrowRight className="h-5 w-5" /> : <ArrowLeft className="h-5 w-5" />}
        </Button>
        <h1 className="text-2xl font-bold">{label("نشر إعلان جديد", "Publier une annonce", "Post a Listing")}</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader><CardTitle className="text-base">{label("معلومات الإعلان", "Informations", "Listing Info")}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>{label("العنوان بالعربية *", "Titre en arabe *", "Title in Arabic *")}</Label>
              <Input value={form.titleAr} onChange={e => set("titleAr", e.target.value)} placeholder={label("أدخل عنوان إعلانك...", "Titre en arabe...", "Title in Arabic...")} className="mt-1 text-right" dir="rtl" required />
            </div>
            <div>
              <Label>{label("العنوان بالفرنسية", "Titre en français", "Title in French")}</Label>
              <Input value={form.titleFr} onChange={e => set("titleFr", e.target.value)} placeholder="Titre en français..." className="mt-1" />
            </div>
            <div>
              <Label>{label("الوصف بالعربية", "Description en arabe", "Description in Arabic")}</Label>
              <Textarea value={form.descriptionAr} onChange={e => set("descriptionAr", e.target.value)} placeholder={label("اوصف ما تقدمه...", "Description en arabe...", "Describe your listing...")} rows={4} className="mt-1 text-right" dir="rtl" />
            </div>
            <div>
              <Label>{label("الوصف بالفرنسية", "Description en français", "Description in French")}</Label>
              <Textarea value={form.descriptionFr} onChange={e => set("descriptionFr", e.target.value)} placeholder="Description en français..." rows={3} className="mt-1" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">{label("التفاصيل", "Détails", "Details")}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{label("السعر (د.ج)", "Prix (DZD)", "Price (DZD)")}</Label>
                <Input type="number" value={form.price} onChange={e => set("price", e.target.value)} placeholder="0" className="mt-1" min="0" />
              </div>
              <div>
                <Label>{label("النوع", "Type", "Type")}</Label>
                <Select value={form.listingType} onValueChange={v => set("listingType", v)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="product">{label("منتج", "Produit", "Product")}</SelectItem>
                    <SelectItem value="service">{label("خدمة", "Service", "Service")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>{label("الفئة", "Catégorie", "Category")}</Label>
              <Select value={form.categoryId} onValueChange={v => set("categoryId", v)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder={label("اختر فئة", "Choisir catégorie", "Choose category")} />
                </SelectTrigger>
                <SelectContent>
                  {categories?.map((cat: any) => (
                    <SelectItem key={cat.id} value={String(cat.id)}>
                      {language === "ar" ? cat.nameAr : language === "fr" ? cat.nameFr : cat.nameEn}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{label("الولاية", "Wilaya", "Wilaya")}</Label>
                <Select value={form.wilaya} onValueChange={v => set("wilaya", v)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder={label("اختر الولاية", "Wilaya", "Wilaya")} />
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
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">{label("الصور", "Images", "Images")}</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <Input value={form.imageUrl} onChange={e => set("imageUrl", e.target.value)} placeholder={label("رابط الصورة...", "URL de l'image...", "Image URL...")} className="flex-1" onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addImage())} />
              <Button type="button" variant="outline" onClick={addImage}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {form.images.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {form.images.map((img, i) => (
                  <div key={i} className="relative group w-24 h-16 rounded-lg overflow-hidden border">
                    <img src={img} alt="" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => removeImage(i)} className="absolute inset-0 bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs">✕</button>
                  </div>
                ))}
              </div>
            )}
            <p className="text-xs text-muted-foreground">{label("أضف روابط صور المنتج/الخدمة", "Ajoutez des URLs d'images", "Add product/service image URLs")}</p>
          </CardContent>
        </Card>

        <Button type="submit" className="w-full" size="lg" disabled={createListing.isPending}>
          {createListing.isPending
            ? label("جارٍ النشر...", "Publication...", "Publishing...")
            : label("نشر الإعلان", "Publier l'annonce", "Publish Listing")}
        </Button>
      </form>
    </div>
  );
}
