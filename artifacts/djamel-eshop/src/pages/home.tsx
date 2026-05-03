import { useState } from "react";
import { useI18n } from "@/contexts/I18nContext";
import { Link, useLocation } from "wouter";
import { useGetFeaturedListings, useGetNearbyListings, useListCategories } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  MapPin, Search, Star, ArrowLeft, ArrowRight, ShoppingBag,
  Smartphone, Shirt, Home as HomeIcon, Car, Building, Wrench,
  Dumbbell, BookOpen, UtensilsCrossed, Hammer, PawPrint, Package,
  TrendingUp, Users, Store, ChevronRight
} from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";

const ICON_MAP: Record<string, React.ElementType> = {
  Smartphone,
  Shirt,
  Home: HomeIcon,
  Car,
  Building,
  Wrench,
  Dumbbell,
  BookOpen,
  UtensilsCrossed,
  Hammer,
  PawPrint,
  Package,
  ShoppingBag,
};

const CATEGORY_COLORS: Record<string, string> = {
  electronics:   "from-blue-500/20 to-blue-400/10 border-blue-500/20 text-blue-600 dark:text-blue-400",
  clothing:      "from-pink-500/20 to-pink-400/10 border-pink-500/20 text-pink-600 dark:text-pink-400",
  "home-decor":  "from-amber-500/20 to-amber-400/10 border-amber-500/20 text-amber-600 dark:text-amber-400",
  vehicles:      "from-gray-500/20 to-gray-400/10 border-gray-500/20 text-gray-600 dark:text-gray-400",
  "real-estate": "from-emerald-500/20 to-emerald-400/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400",
  services:      "from-violet-500/20 to-violet-400/10 border-violet-500/20 text-violet-600 dark:text-violet-400",
  sports:        "from-orange-500/20 to-orange-400/10 border-orange-500/20 text-orange-600 dark:text-orange-400",
  books:         "from-cyan-500/20 to-cyan-400/10 border-cyan-500/20 text-cyan-600 dark:text-cyan-400",
  food:          "from-red-500/20 to-red-400/10 border-red-500/20 text-red-600 dark:text-red-400",
  construction:  "from-yellow-500/20 to-yellow-400/10 border-yellow-500/20 text-yellow-600 dark:text-yellow-400",
  pets:          "from-lime-500/20 to-lime-400/10 border-lime-500/20 text-lime-600 dark:text-lime-400",
  other:         "from-primary/20 to-primary/10 border-primary/20 text-primary",
};

export default function Home() {
  const { t, language, dir } = useI18n();
  const [searchQuery, setSearchQuery] = useState("");
  const [, navigate] = useLocation();

  const { data: featuredListings, isLoading: isLoadingFeatured } = useGetFeaturedListings({ limit: 6 });
  const { data: nearbyListings, isLoading: isLoadingNearby } = useGetNearbyListings({ wilaya: "Alger", limit: 6 });
  const { data: categories, isLoading: isLoadingCategories } = useListCategories();

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/listings?search=${encodeURIComponent(searchQuery)}`);
    } else {
      navigate("/listings");
    }
  };

  const ArrowIcon = dir === "rtl" ? ArrowLeft : ArrowRight;

  const categoriesContent = (() => {
    if (isLoadingCategories) return Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />);
    if (!Array.isArray(categories) || categories.length === 0) return null;
    return categories.map((category, i) => {
      const IconComp = ICON_MAP[category.icon] ?? ShoppingBag;
      const colorClass = CATEGORY_COLORS[category.slug] ?? CATEGORY_COLORS.other;
      return (
        <Link key={category.id} href={`/listings?categoryId=${category.id}`}>
          <Card
            className={`card-hover cursor-pointer group bg-gradient-to-br ${colorClass} border h-full`}
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <CardContent className="p-4 flex flex-col items-center justify-center text-center gap-3 h-full min-h-[7rem]">
              <div className="h-11 w-11 rounded-xl category-icon-ring flex items-center justify-center">
                <IconComp className="h-5 w-5" />
              </div>
              <span className="font-semibold text-xs leading-tight">
                {language === "ar" ? category.nameAr : language === "fr" ? category.nameFr : category.nameEn}
              </span>
            </CardContent>
          </Card>
        </Link>
      );
    });
  })();

  const featuredContent = (() => {
    if (isLoadingFeatured) return Array(3).fill(0).map((_, i) => <ListingCardSkeleton key={i} />);
    if (Array.isArray(featuredListings) && featuredListings.length > 0) {
      return featuredListings.map((listing, i) => (
        <ListingCard key={listing.id} listing={listing} index={i} language={language} />
      ));
    }
    return <EmptyState label={language === "ar" ? "لا توجد إعلانات مميزة" : language === "fr" ? "Aucune annonce en vedette" : "No featured listings yet"} />;
  })();

  const nearbyContent = (() => {
    if (isLoadingNearby) return Array(3).fill(0).map((_, i) => <ListingCardSkeleton key={i} />);
    if (Array.isArray(nearbyListings) && nearbyListings.length > 0) {
      return nearbyListings.map((listing, i) => (
        <ListingCard key={listing.id} listing={listing} index={i} language={language} />
      ));
    }
    return <EmptyState label={language === "ar" ? "لا توجد إعلانات قريبة" : language === "fr" ? "Aucune annonce à proximité" : "No nearby listings"} />;
  })();

  return (
    <div className="flex flex-col min-h-screen">

      {/* ══════════════════════════════════════════════════
          HERO SECTION
      ══════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/8 via-background to-accent/5 hero-pattern">
        <div className="absolute inset-0 hero-arabesque opacity-60 pointer-events-none" />

        {/* Decorative blobs */}
        <div className="absolute -top-24 -start-24 w-96 h-96 rounded-full bg-primary/6 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -end-16 w-72 h-72 rounded-full bg-accent/8 blur-3xl pointer-events-none" />

        <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-6">

            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary rounded-full px-4 py-1.5 text-sm font-medium pulse-badge">
              <Store className="h-3.5 w-3.5" />
              {language === "ar" ? "السوق المحلي الجزائري رقم 1"
               : language === "fr" ? "Le marché local n°1 en Algérie"
               : "Algeria's #1 Local Marketplace"}
            </div>

            {/* Headline */}
            <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight">
              <span className="gradient-text">
                {language === "ar" ? "سوقك المحلي" : language === "fr" ? "Votre marché" : "Your Local Market"}
              </span>
              <br />
              <span className="text-foreground">
                {language === "ar" ? "بين يديك" : language === "fr" ? "à portée de main" : "at Your Fingertips"}
              </span>
            </h1>

            {/* Sub */}
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-xl mx-auto">
              {language === "ar"
                ? "اكتشف أفضل العروض، المنتجات، والخدمات في مدينتك. تواصل مباشرة مع البائعين."
                : language === "fr"
                ? "Découvrez les meilleures offres dans votre ville. Connectez-vous directement avec les vendeurs."
                : "Discover the best deals in your city. Connect directly with local sellers."}
            </p>

            {/* Search bar */}
            <div className="relative max-w-2xl mx-auto search-bar bg-card border-2 border-border rounded-2xl flex items-center gap-2 p-2 transition-all">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder={t("searchPlaceholder")}
                className={`flex-1 bg-transparent border-none outline-none px-3 text-base ${dir === "rtl" ? "text-right" : "text-left"}`}
              />
              <Button onClick={handleSearch} className="rounded-xl px-6 shrink-0 gap-2" size="lg">
                <Search className="h-4 w-4" />
                {language === "ar" ? "بحث" : language === "fr" ? "Chercher" : "Search"}
              </Button>
            </div>

            {/* Quick stats */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <div className="stat-chip">
                <TrendingUp className="h-4 w-4 text-primary" />
                <span>{language === "ar" ? "+٥٠٠ إعلان" : "+500 annonces"}</span>
              </div>
              <div className="stat-chip">
                <Users className="h-4 w-4 text-secondary" />
                <span>{language === "ar" ? "بائعون موثوقون" : "Vendeurs fiables"}</span>
              </div>
              <div className="stat-chip">
                <MapPin className="h-4 w-4 text-accent" />
                <span>{language === "ar" ? "٥٨ ولاية" : "58 wilayas"}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          CATEGORIES
      ══════════════════════════════════════════════════ */}
      <section className="py-14 container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold">{t("categories")}</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              {language === "ar" ? "تصفح حسب الفئة" : language === "fr" ? "Parcourir par catégorie" : "Browse by category"}
            </p>
          </div>
          <Link href="/listings">
            <Button variant="ghost" className="text-primary group gap-1">
              {t("viewAll")}
              <ArrowIcon className="h-4 w-4 group-hover:translate-x-0.5 group-hover:-translate-x-0.5 transition-transform" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 md:gap-4">
          {categoriesContent}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          FEATURED LISTINGS
      ══════════════════════════════════════════════════ */}
      <section className="py-14 bg-muted/40">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Star className="h-6 w-6 text-accent fill-accent" />
                {t("featured")}
              </h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                {language === "ar" ? "إعلانات مختارة بعناية" : language === "fr" ? "Annonces sélectionnées" : "Hand-picked listings"}
              </p>
            </div>
            <Link href="/listings">
              <Button variant="ghost" className="text-primary group gap-1">
                {t("viewAll")}
                <ArrowIcon className="h-4 w-4 group-hover:translate-x-0.5 group-hover:-translate-x-0.5 transition-transform" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {featuredContent}
          </div>
        </div>
      </section>

      {/* Wave divider */}
      <div className="wave-divider -mt-1">
        <svg viewBox="0 0 1440 40" xmlns="http://www.w3.org/2000/svg" className="fill-muted/40 w-full">
          <path d="M0,20 C360,40 1080,0 1440,20 L1440,40 L0,40 Z" />
        </svg>
      </div>

      {/* ══════════════════════════════════════════════════
          NEARBY LISTINGS
      ══════════════════════════════════════════════════ */}
      <section className="py-14 container mx-auto px-4 pb-20">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <MapPin className="h-6 w-6 text-primary" />
              {t("nearby")}
              <Badge variant="outline" className="text-xs font-normal">Alger</Badge>
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              {language === "ar" ? "إعلانات قريبة من موقعك" : language === "fr" ? "Annonces proches de vous" : "Listings near your location"}
            </p>
          </div>
          <Link href="/listings?wilaya=Alger">
            <Button variant="ghost" className="text-primary group gap-1">
              {t("viewAll")}
              <ArrowIcon className="h-4 w-4 group-hover:translate-x-0.5 group-hover:-translate-x-0.5 transition-transform" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {nearbyContent}
        </div>
      </section>
    </div>
  );
}

/* ─── Listing Card ─────────────────────────────────── */
function ListingCard({ listing, index, language }: { listing: any; index: number; language: string }) {
  const title =
    language === "ar" ? listing.titleAr
    : language === "fr" ? listing.titleFr || listing.titleAr
    : listing.titleEn || listing.titleAr;

  const typeLabel =
    listing.listingType === "service"
      ? (language === "ar" ? "خدمة" : language === "fr" ? "Service" : "Service")
      : (language === "ar" ? "منتج" : language === "fr" ? "Produit" : "Product");

  return (
    <Link href={`/listings/${listing.id}`}>
      <Card
        className="card-hover overflow-hidden cursor-pointer group bg-card h-full"
        style={{ animationDelay: `${index * 80}ms` }}
      >
        <div className="relative overflow-hidden">
          <AspectRatio ratio={4 / 3}>
            {listing.images?.[0] ? (
              <img
                src={listing.images[0]}
                alt={title}
                className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-muted to-muted/60 flex items-center justify-center">
                <ShoppingBag className="h-14 w-14 text-muted-foreground/20" />
              </div>
            )}
          </AspectRatio>

          {/* Badges */}
          <div className="absolute top-2.5 end-2.5 flex flex-col gap-1.5">
            <Badge className="text-xs font-medium shadow-sm" variant={listing.listingType === "service" ? "secondary" : "default"}>
              {typeLabel}
            </Badge>
            {listing.condition && (
              <Badge className="text-xs bg-background/85 backdrop-blur text-foreground border-none shadow-sm">
                {listing.condition}
              </Badge>
            )}
          </div>

          {listing.isFeatured && (
            <div className="absolute top-2.5 start-2.5">
              <Badge className="text-xs gap-1 bg-accent text-accent-foreground border-none shadow-sm">
                <Star className="h-2.5 w-2.5 fill-current" />
                {language === "ar" ? "مميز" : "Top"}
              </Badge>
            </div>
          )}
        </div>

        <CardContent className="p-4 space-y-3">
          <div className="flex justify-between items-start gap-2">
            <h3 className="font-semibold text-sm leading-snug line-clamp-2 group-hover:text-primary transition-colors flex-1" title={title}>
              {title}
            </h3>
            {listing.price && (
              <p className="font-bold text-primary text-sm whitespace-nowrap shrink-0">
                {Number(listing.price).toLocaleString()}{" "}
                <span className="text-xs font-medium opacity-70">{listing.currency || "DZD"}</span>
              </p>
            )}
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1 truncate">
              <MapPin className="h-3 w-3 shrink-0 text-primary/70" />
              <span className="truncate">{listing.city ? `${listing.city}, ` : ""}{listing.wilaya}</span>
            </span>
            <span className="flex items-center gap-1 shrink-0">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              <span>{listing.averageRating ? listing.averageRating.toFixed(1) : "—"}</span>
              <span className="text-muted-foreground/60">({listing.reviewCount ?? 0})</span>
            </span>
          </div>

          <div className="pt-2 border-t flex items-center justify-between text-xs text-muted-foreground">
            <span>{new Date(listing.createdAt).toLocaleDateString(
              language === "ar" ? "ar-DZ" : language === "fr" ? "fr-FR" : "en-US"
            )}</span>
            <span className="flex items-center gap-1 text-primary text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
              {language === "ar" ? "عرض التفاصيل" : language === "fr" ? "Voir plus" : "View"}
              <ChevronRight className="h-3 w-3" />
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

/* ─── Skeleton ─────────────────────────────────────── */
function ListingCardSkeleton() {
  return (
    <div className="rounded-2xl overflow-hidden border bg-card space-y-0">
      <Skeleton className="h-52 w-full rounded-none" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-3 w-full" />
      </div>
    </div>
  );
}

/* ─── Empty state ──────────────────────────────────── */
function EmptyState({ label }: { label: string }) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-16 text-muted-foreground gap-3">
      <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
        <ShoppingBag className="h-7 w-7 opacity-30" />
      </div>
      <p className="text-sm">{label}</p>
    </div>
  );
}
