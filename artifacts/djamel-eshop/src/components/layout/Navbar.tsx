import { useI18n } from "@/contexts/I18nContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useUser, useClerk } from "@clerk/react";
import { Menu, Moon, Sun, Languages, Search, Plus, User, LogOut, LayoutDashboard, ShoppingBag, MessageCircle, Package } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function Navbar() {
  const { t, language, setLanguage, dir } = useI18n();
  const { theme, setTheme } = useTheme();
  const { isLoaded, isSignedIn, user } = useUser();
  const { signOut } = useClerk();

  const signedOut = isLoaded && !isSignedIn;
  const signedIn = isLoaded && isSignedIn;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">

        {/* Logo */}
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2">
            <ShoppingBag className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl hidden sm:inline-block">Djamel E Shop</span>
          </Link>
        </div>

        {/* Search bar (desktop) */}
        <div className="flex-1 max-w-xl px-4 hidden md:block">
          <div className="relative">
            <Search className={`absolute ${dir === 'rtl' ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground`} />
            <input
              type="text"
              placeholder={t('searchPlaceholder')}
              className={`w-full h-10 bg-muted/50 border rounded-full ${dir === 'rtl' ? 'pr-10 pl-4' : 'pl-10 pr-4'} focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all`}
            />
          </div>
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-1">

          {/* Language switcher */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Languages className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align={dir === 'rtl' ? "start" : "end"}>
              <DropdownMenuItem onClick={() => setLanguage('ar')} className={language === 'ar' ? 'font-bold bg-muted' : ''}>
                العربية
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLanguage('fr')} className={language === 'fr' ? 'font-bold bg-muted' : ''}>
                Français
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLanguage('en')} className={language === 'en' ? 'font-bold bg-muted' : ''}>
                English
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Dark/light toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="rounded-full"
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>

          {/* ── Signed OUT: sign-in + sign-up buttons ── */}
          {signedOut && (
            <div className="hidden sm:flex items-center gap-2 ms-2">
              <Link href="/sign-in">
                <Button variant="ghost" size="sm">
                  {language === 'ar' ? 'تسجيل الدخول' : language === 'fr' ? 'Connexion' : 'Sign in'}
                </Button>
              </Link>
              <Link href="/sign-up">
                <Button size="sm" className="rounded-full px-5">
                  {language === 'ar' ? 'إنشاء حساب' : language === 'fr' ? 'S\'inscrire' : 'Sign up'}
                </Button>
              </Link>
            </div>
          )}

          {/* ── Signed IN: post listing + user menu ── */}
          {signedIn && (
            <div className="hidden sm:flex items-center gap-2 ms-2">
              <Link href="/listings/create">
                <Button variant="secondary" size="sm" className="gap-2 rounded-full">
                  <Plus className="h-4 w-4" />
                  {t('postListing')}
                </Button>
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full border overflow-hidden">
                    {user?.imageUrl ? (
                      <img src={user.imageUrl} alt="Avatar" className="h-full w-full object-cover" />
                    ) : (
                      <User className="h-5 w-5" />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align={dir === 'rtl' ? "start" : "end"} className="w-56">
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">{user?.fullName ?? user?.firstName}</p>
                      <p className="w-[200px] truncate text-sm text-muted-foreground">
                        {user?.primaryEmailAddress?.emailAddress}
                      </p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <Link href="/dashboard">
                    <DropdownMenuItem className="cursor-pointer">
                      <LayoutDashboard className="mr-2 h-4 w-4 rtl:ml-2 rtl:mr-0" />
                      <span>{t('dashboard')}</span>
                    </DropdownMenuItem>
                  </Link>
                  <Link href="/profile">
                    <DropdownMenuItem className="cursor-pointer">
                      <User className="mr-2 h-4 w-4 rtl:ml-2 rtl:mr-0" />
                      <span>{t('profile')}</span>
                    </DropdownMenuItem>
                  </Link>
                  <Link href="/messages">
                    <DropdownMenuItem className="cursor-pointer">
                      <MessageCircle className="mr-2 h-4 w-4 rtl:ml-2 rtl:mr-0" />
                      <span>{t('messages')}</span>
                    </DropdownMenuItem>
                  </Link>
                  <Link href="/orders">
                    <DropdownMenuItem className="cursor-pointer">
                      <Package className="mr-2 h-4 w-4 rtl:ml-2 rtl:mr-0" />
                      <span>{t('orders')}</span>
                    </DropdownMenuItem>
                  </Link>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="cursor-pointer text-destructive focus:bg-destructive focus:text-destructive-foreground"
                    onClick={() => signOut()}
                  >
                    <LogOut className="mr-2 h-4 w-4 rtl:ml-2 rtl:mr-0" />
                    <span>{t('logout')}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}

          {/* ── Mobile menu ── */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="sm:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side={dir === 'rtl' ? 'right' : 'left'}>
              <div className="flex flex-col gap-3 mt-8">
                <Link href="/">
                  <Button variant="ghost" className="w-full justify-start text-lg">{t('home')}</Button>
                </Link>
                <Link href="/listings">
                  <Button variant="ghost" className="w-full justify-start text-lg">{t('listings')}</Button>
                </Link>

                {signedOut && (
                  <>
                    <div className="border-t my-1" />
                    <Link href="/sign-in">
                      <Button variant="ghost" className="w-full justify-start text-lg">
                        {language === 'ar' ? 'تسجيل الدخول' : language === 'fr' ? 'Connexion' : 'Sign in'}
                      </Button>
                    </Link>
                    <Link href="/sign-up">
                      <Button className="w-full justify-start text-lg">
                        {language === 'ar' ? 'إنشاء حساب' : language === 'fr' ? 'S\'inscrire' : 'Sign up'}
                      </Button>
                    </Link>
                  </>
                )}

                {signedIn && (
                  <>
                    <div className="border-t my-1" />
                    <Link href="/dashboard">
                      <Button variant="ghost" className="w-full justify-start text-lg">{t('dashboard')}</Button>
                    </Link>
                    <Link href="/listings/create">
                      <Button className="w-full justify-start text-lg">{t('postListing')}</Button>
                    </Link>
                    <Link href="/profile">
                      <Button variant="ghost" className="w-full justify-start text-lg">{t('profile')}</Button>
                    </Link>
                    <div className="border-t my-1" />
                    <Button
                      variant="destructive"
                      className="w-full justify-start text-lg"
                      onClick={() => signOut()}
                    >
                      {t('logout')}
                    </Button>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
