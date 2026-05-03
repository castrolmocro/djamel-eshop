import { useState } from "react";
import { useI18n } from "@/contexts/I18nContext";
import { Link, useSearch } from "wouter";
import { useListListings, useListCategories } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Search, Star, SlidersHorizontal, X } from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

const WILAYAS = [
  "Alger", "Oran", "Constantine", "Annaba", "Blida", "Batna", "Djelfa",
  "Sétif", "Sidi Bel Abbès", "Biskra", "Tébessa", "El Oued", "Skikda",
  "Tiaret", "Béjaïa", "Tlemcen", "Ouargla", "Mostaganem", "Bordj Bou Arréridj",
  "Chlef", "Souk Ahras", "Médéa", "Guelma", "Jijel", "Msila",
];

export default function ListingsPage() {
  const { language, dir } = useI18n();
  const searchStr = useSearch();
  const params = new URLSearchParams(searchStr);

  const [search, setSearch] = useState(params.get("search") || "");
  const [categoryId, setCategoryId] = useState(params.get("categoryId") || "");
  const [wilaya, setWilaya] = useState("");
  const [listingType, setListingType] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useListListings({
    search: search || undefined,
    categoryId: categoryId ? Number(categoryId) : undefined,
    wilaya: wilaya || undefined,
    listingType: listingType || undefined,
    page,
    limit: 20,
  } as any);

  const { data: categories } = useListCategories();

  const listings = (data as any)?.listings ?? [];
  const total = (data as any)?.total ?? 0;
  const totalPages = (data as any)?.totalPages ?? 1;

  const label = (ar: string, fr: string, en: string) =>
    language === "ar" ? ar : language === "fr" ? fr : en;

  const FiltersContent = () => (
    <div className="space-y-6">
      <div>
        <label className="text-sm font-medium mb-2 block">{label("الفئة", "Catégorie", "Category")}</label>
        <Select value={categoryId} onValueChange={(v) => { setCategoryId(v === "all" ? "" : v); setPage(1); }}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder={label("كل الفئات", "Toutes catégories", "All categories")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{label("كل الفئات", "Toutes catégories", "All categories")}</SelectItem>
            {Array.isArray(categories) && categories.map((cat: any) => (
              <SelectItem key={cat.id} value={String(cat.id)}>
                {language === "ar" ? cat.nameAr : language === "fr" ? cat.nameFr : cat.nameEn}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <label className="text-sm font-medium mb-2 block">{label("الولاية", "Wilaya", "Wilaya")}</label>
        <Select value={wilaya} onValueChange={(v) => { setWilaya(v === "all" ? "" : v); setPage(1); }}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder={label("كل الولايات", "Toutes wilayas", "All wilayas")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{label("كل الولايات", "Toutes wilayas", "All wilayas")}</SelectItem>
            {WILAYAS.map((w) => (
              <SelectItem key={w} value={w}>{w}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <label className="text-sm font-medium mb-2 block">{label("النوع", "Type", "Type")}</label>
        <Select value={listingType} onValueChange={(v) => { setListingType(v === "all" ? "" : v); setPage(1); }}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder={label("الكل", "Tous", "All")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{label("الكل", "Tous", "All")}</SelectItem>
            <SelectItem value="product">{label("منتج", "Produit", "Product")}</SelectItem>
            <SelectItem value="service">{label("خدمة", "Service", "Service")}</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {(categoryId || wilaya || listingType) && (
        <Button variant="outline" className="w-full" onClick={() => { setCategoryId(""); setWilaya(""); setListingType(""); setPage(1); }}>
          <X className="h-4 w-4 me-2" />
          {label("مسح الفلاتر", "Effacer filtres", "Clear filters")}
        </Button>
      )}
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Desktop sidebar */}
        <aside className="hidden md:block w-64 shrink-0">
          <div className="sticky top-24 bg-card border rounded-xl p-5 space-y-6">
            <h2 className="font-semibold text-lg">{label("تصفية النتائج", "Filtres", "Filters")}</h2>
            <FiltersContent />
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1">
          {/* Search bar + mobile filter */}
          <div className="flex gap-3 mb-6">
            <div className={`relative flex-1`}>
              <Search className={`absolute ${dir === "rtl" ? "right-3" : "left-3"} top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground`} />
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder={label("ابحث...", "Rechercher...", "Search...")}
                className={`w-full h-11 bg-muted/50 border rounded-lg ${dir === "rtl" ? "pr-10 pl-4 text-right" : "pl-10 pr-4"} focus:outline-none focus:ring-2 focus:ring-primary/20`}
              />
            </div>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="md:hidden gap-2">
                  <SlidersHorizontal className="h-4 w-4" />
                  {label("فلتر", "Filtrer", "Filter")}
                </Button>
              </SheetTrigger>
              <SheetContent side={dir === "rtl" ? "right" : "left"}>
                <SheetHeader>
                  <SheetTitle>{label("تصفية النتائج", "Filtres", "Filters")}</SheetTitle>
                </SheetHeader>
                <div className="mt-6">
                  <FiltersContent />
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Results count */}
          <p className="text-sm text-muted-foreground mb-4">
            {isLoading ? "" : `${total} ${label("نتيجة", "résultats", "results")}`}
          </p>

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {isLoading
              ? Array(9).fill(0).map((_, i) => <Skeleton key={i} className="h-72 rounded-xl" />)
              : listings.length === 0
              ? (
                <div className="col-span-full text-center py-16 text-muted-foreground">
                  <Search className="h-12 w-12 mx-auto mb-4 opacity-30" />
                  <p className="text-lg">{label("لا توجد نتائج", "Aucun résultat", "No results found")}</p>
                </div>
              )
              : listings.map((listing: any) => (
                <Link key={listing.id} href={`/listings/${listing.id}`}>
                  <Card className="overflow-hidden hover:shadow-lg hover:border-primary/40 transition-all cursor-pointer group h-full">
                    <AspectRatio ratio={4 / 3}>
                      {listing.images?.[0] ? (
                        <img src={listing.images[0]} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center text-4xl">🛍️</div>
                      )}
                    </AspectRatio>
                    <CardContent className="p-4 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-sm leading-tight line-clamp-2 flex-1">
                          {language === "ar" ? listing.titleAr : language === "fr" ? listing.titleFr || listing.titleAr : listing.titleEn || listing.titleAr}
                        </h3>
                        {listing.listingType && (
                          <Badge variant="secondary" className="text-xs shrink-0">
                            {listing.listingType === "service" ? label("خدمة", "Service", "Service") : label("منتج", "Produit", "Product")}
                          </Badge>
                        )}
                      </div>
                      {listing.price && (
                        <p className="text-primary font-bold">
                          {Number(listing.price).toLocaleString()} {label("د.ج", "DZD", "DZD")}
                        </p>
                      )}
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        {listing.wilaya && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {listing.wilaya}
                          </span>
                        )}
                        {listing.averageRating && (
                          <span className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                            {listing.averageRating.toFixed(1)}
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))
            }
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              <Button variant="outline" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                {dir === "rtl" ? "›" : "‹"}
              </Button>
              <span className="text-sm text-muted-foreground">{page} / {totalPages}</span>
              <Button variant="outline" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
                {dir === "rtl" ? "‹" : "›"}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
