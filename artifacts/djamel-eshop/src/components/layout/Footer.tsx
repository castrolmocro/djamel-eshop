import { useI18n } from "@/contexts/I18nContext";
import { Link } from "wouter";

export function Footer() {
  const { t, dir } = useI18n();
  const year = new Date().getFullYear();

  return (
    <footer className="bg-card border-t py-12 mt-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-1">
            <h3 className="font-bold text-xl mb-4">Djamel E Shop</h3>
            <p className="text-muted-foreground text-sm">
              Your trusted local marketplace for buying, selling, and connecting with the community.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/" className="hover:text-primary transition-colors">{t('home')}</Link></li>
              <li><Link href="/listings" className="hover:text-primary transition-colors">{t('listings')}</Link></li>
              <li><Link href="/sign-in" className="hover:text-primary transition-colors">{t('signIn')}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Categories</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/listings?category=electronics" className="hover:text-primary transition-colors">Electronics</Link></li>
              <li><Link href="/listings?category=vehicles" className="hover:text-primary transition-colors">Vehicles</Link></li>
              <li><Link href="/listings?category=real-estate" className="hover:text-primary transition-colors">Real Estate</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Contact Us</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t mt-8 pt-8 flex flex-col md:flex-row items-center justify-between text-sm text-muted-foreground">
          <p>&copy; {year} Djamel E Shop. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
