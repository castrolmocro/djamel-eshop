import { Link } from "wouter";
import { useI18n } from "@/contexts/I18nContext";
import { ShoppingBag, MapPin, Phone } from "lucide-react";

export function Footer() {
  const { language, t } = useI18n();
  const label = (ar: string, fr: string, en: string) =>
    language === "ar" ? ar : language === "fr" ? fr : en;

  return (
    <footer className="border-t bg-muted/30 mt-auto">
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-primary" />
              <span className="font-bold text-lg">Djamel E Shop</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {label(
                "السوق المحلي الجزائري الأول — بع واشترِ في منطقتك بسهولة",
                "Le premier marché local algérien — Achetez et vendez dans votre région",
                "Algeria's local marketplace — Buy and sell in your area easily"
              )}
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-sm">{label("روابط مهمة", "Liens importants", "Quick Links")}</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/" className="hover:text-primary transition-colors">{t("home")}</Link></li>
              <li><Link href="/listings" className="hover:text-primary transition-colors">{t("listings")}</Link></li>
              <li><Link href="/listings/create" className="hover:text-primary transition-colors">{t("postListing")}</Link></li>
              <li><Link href="/sign-up" className="hover:text-primary transition-colors">{t("signUp")}</Link></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-sm">{label("معلومات", "Informations", "Info")}</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                {label("الجزائر — 58 ولاية", "Algérie — 58 wilayas", "Algeria — 58 wilayas")}
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-primary shrink-0" />
                <span dir="ltr">+213 XXX XXX XXX</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Djamel E Shop. {label("جميع الحقوق محفوظة", "Tous droits réservés", "All rights reserved")}</p>
          <p className="flex items-center gap-1">
            {label("صُنع بـ", "Fait avec", "Made with")} ❤️ {label("في الجزائر", "en Algérie", "in Algeria")}
          </p>
        </div>
      </div>
    </footer>
  );
}
