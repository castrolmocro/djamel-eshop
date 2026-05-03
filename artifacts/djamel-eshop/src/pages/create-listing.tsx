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
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, ArrowRight, Plus, X, ImageIcon, MapPin, Tag, DollarSign, FileText } from "lucide-react";

const WILAYAS = [
  "Adrar", "Chlef", "Laghouat", "Oum El Bouaghi", "Batna", "Béjaïa", "Biskra",
  "Béchar", "Blida", "Bouira", "Tamanrasset", "Tébessa", "Tlemcen", "Tiaret",
  "Tizi Ouzou", "Alger", "Djelfa", "Jijel", "Sétif", "Saïda", "Skikda",
  "Sidi Bel Abbès", "Annaba", "Guelma", "Constantine", "Médéa", "Mostaganem",
  "Msila", "Mascara", "Ouargla", "Oran", "El Bayadh", "Illizi",
  "Bordj Bou Arréridj", "Boumerdès", "El Tarf", "Tindouf", "Tissemsilt",
  "El Oued", "Khenchela", "Souk Ahras", "Tipaza", "Mila", "Aïn Defla",
  "Naâma", "Aïn Témouchent", "Ghardaïa", "Relizane", "Timimoun",
  "Bordj Badji Mokhtar", "Ouled Djellal", "Béni Abbès", "In Salah",
  "In Guezzam", "Touggourt", "Djanet", "El M'Ghair", "El Meniaa",
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
    condition: "new",
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
    const url = form.imageUrl.trim();
    if (url && !form.images.includes(url)) {
      setForm(f => ({ ...f, images: [...f.images, url], imageUrl: "" }));
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
    if (!form.wilaya) {
      toast({ title: label("الولاية مطلوبة", "La wilaya est requise", "Wilaya is required"), variant: "destructive" });
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
        condition: form.condition || undefined,
        categoryId: form.categoryId ? Number(form.categoryId) : undefined,
        wilaya: form.wilaya,
        city: form.city || undefined,
        images: form.images,
      } as any);
      toast({ title: label("🎉 تم نشر إعلانك بنجاح!", "Annonce publiée avec succès!", "Listing published!") });
      navigate(`/listings/${(listing as any).id}`);
    } catch {
      toast({ title: label("خطأ في النشر، حاول مجدداً", "Erreur de publication", "Publishing error"), variant: "destructive" });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="flex items-center gap-3 mb-8">
        <Button variant="ghost" size="icon" className="rounded-full" onClick={() => navigate("/listings")}>
          {dir === "rtl" ? <ArrowRight className="h-5 w-5" /> : <ArrowLeft className="h-5 w-5" />}
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{label("نشر إعلان جديد", "Publier une annonce", "Post a Listing")}</h1>
          <p className="text-sm text-muted-foreground">{label("أضف تفاصيل منتجك أو خدمتك", "Décrivez votre produit ou service", "Add your product or service details")}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Listing info */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              {label("معلومات الإعلان", "Informations de l'annonce", "Listing Info")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="required">{label("العنوان بالعربية *", "Titre en arabe *", "Arabic Title *")}</Label>
              <Input
                value={form.titleAr}
                onChange={e => set("titleAr", e.target.value)}
                placeholder={label("أدخل عنوان إعلانك...", "Titre en arabe...", "Title in Arabic...")}
                className="mt-1 text-right"
                dir="rtl"
                required
              />
            </div>
            <div>
              <Label>{label("العنوان بالفرنسية", "Titre en français", "French Title")}</Label>
              <Input
                value={form.titleFr}
                onChange={e => set("titleFr", e.target.value)}
                placeholder="Titre en français..."
                className="mt-1"
              />
            </div>
            <div>
              <Label>{label("الوصف بالعربية", "Description en arabe", "Arabic Description")}</Label>
              <Textarea
                value={form.descriptionAr}
                onChange={e => set("descriptionAr", e.target.value)}
                placeholder={label("اوصف ما تقدمه بالتفصيل...", "Description détaillée en arabe...", "Describe your listing in detail...")}
                rows={4}
                className="mt-1 text-right"
                dir="rtl"
              />
            </div>
            <div>
              <Label>{label("الوصف بالفرنسية", "Description en français", "French Description")}</Label>
              <Textarea
                value={form.descriptionFr}
                onChange={e => set("descriptionFr", e.target.value)}
                placeholder="Description en français..."
                rows={3}
                className="mt-1"
              />
            </div>
          </CardContent>
        </Card>

        {/* Details */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Tag className="h-4 w-4 text-primary" />
              {label("التفاصيل", "Détails", "Details")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
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
              <div>
                <Label>{label("الحالة", "État", "Condition")}</Label>
                <Select value={form.condition} onValueChange={v => set("condition", v)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">{label("جديد", "Neuf", "New")}</SelectItem>
                    <SelectItem value="used">{label("مستعمل", "Occasion", "Used")}</SelectItem>
                    <SelectItem value="refurbished">{label("مجدد", "Reconditionné", "Refurbished")}</SelectItem>
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
                  {(categories as any[])?.map((cat: any) => (
                    <SelectItem key={cat.id} value={String(cat.id)}>
                      {language === "ar" ? cat.nameAr : language === "fr" ? cat.nameFr : cat.nameEn}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Price */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-primary" />
              {label("السعر", "Prix", "Price")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Input
                type="number"
                value={form.price}
                onChange={e => set("price", e.target.value)}
                placeholder="0"
                className="pe-16"
                min="0"
              />
              <span className="absolute end-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium pointer-events-none">
                {label("د.ج", "DZD", "DZD")}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1.5">
              {label("اتركه فارغاً إذا كان السعر قابل للتفاوض", "Laissez vide si prix négociable", "Leave empty if price is negotiable")}
            </p>
          </CardContent>
        </Card>

        {/* Location */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              {label("الموقع", "Localisation", "Location")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>{label("الولاية *", "Wilaya *", "Wilaya *")}</Label>
              <Select value={form.wilaya} onValueChange={v => set("wilaya", v)} required>
                <SelectTrigger className={`mt-1 ${!form.wilaya ? "border-muted-foreground/30" : ""}`}>
                  <SelectValue placeholder={label("اختر الولاية *", "Choisir la wilaya *", "Choose wilaya *")} />
                </SelectTrigger>
                <SelectContent>
                  {WILAYAS.map(w => <SelectItem key={w} value={w}>{w}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>{label("المدينة / البلدية", "Commune / Ville", "City / Municipality")}</Label>
              <Input
                value={form.city}
                onChange={e => set("city", e.target.value)}
                placeholder={label("المدينة أو البلدية...", "Commune ou ville...", "City...")}
                className="mt-1"
              />
            </div>
          </CardContent>
        </Card>

        {/* Images */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-primary" />
              {label("الصور", "Images", "Images")}
              {form.images.length > 0 && (
                <Badge variant="secondary" className="text-xs">{form.images.length}</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <Input
                value={form.imageUrl}
                onChange={e => set("imageUrl", e.target.value)}
                placeholder={label("رابط الصورة (URL)...", "URL de l'image...", "Image URL...")}
                className="flex-1"
                onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addImage(); } }}
              />
              <Button type="button" variant="outline" onClick={addImage} className="shrink-0">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {form.images.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {form.images.map((img, i) => (
                  <div key={i} className="relative group w-24 h-16 rounded-lg overflow-hidden border bg-muted">
                    <img src={img} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute inset-0 bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              {label("أضف روابط صور المنتج أو الخدمة من الإنترنت", "Ajoutez des URLs d'images depuis internet", "Add image URLs from the internet")}
            </p>
          </CardContent>
        </Card>

        <Button
          type="submit"
          className="w-full"
          size="lg"
          disabled={createListing.isPending}
        >
          {createListing.isPending
            ? label("جارٍ النشر...", "Publication en cours...", "Publishing...")
            : label("نشر الإعلان", "Publier l'annonce", "Publish Listing")}
        </Button>
      </form>
    </div>
  );
}
