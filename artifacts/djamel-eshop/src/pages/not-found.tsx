import { Link } from "wouter";
import { useI18n } from "@/contexts/I18nContext";
import { Button } from "@/components/ui/button";
import { Home, Search } from "lucide-react";

export default function NotFound() {
  const { language } = useI18n();
  const label = (ar: string, fr: string, en: string) =>
    language === "ar" ? ar : language === "fr" ? fr : en;

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100dvh-8rem)] gap-6 text-center px-4">
      <div className="text-8xl font-black text-muted-foreground/20 select-none">404</div>
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-foreground">
          {label("الصفحة غير موجودة", "Page introuvable", "Page Not Found")}
        </h1>
        <p className="text-muted-foreground text-sm max-w-sm mx-auto">
          {label(
            "عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها.",
            "Désolé, la page que vous cherchez n'existe pas ou a été déplacée.",
            "Sorry, the page you're looking for doesn't exist or has been moved."
          )}
        </p>
      </div>
      <div className="flex gap-3 flex-wrap justify-center">
        <Link href="/">
          <Button className="gap-2">
            <Home className="h-4 w-4" />
            {label("الرئيسية", "Accueil", "Home")}
          </Button>
        </Link>
        <Link href="/listings">
          <Button variant="outline" className="gap-2">
            <Search className="h-4 w-4" />
            {label("تصفح الإعلانات", "Parcourir les annonces", "Browse Listings")}
          </Button>
        </Link>
      </div>
    </div>
  );
}
