import { useI18n } from "@/contexts/I18nContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import {
  Menu, Moon, Sun, Languages, Search, Plus, User, LogOut,
  LayoutDashboard, ShoppingBag, MessageCircle, Package, Home,
  ListFilter, Bell, X, ChevronRight, UserCircle2, CheckCheck, MapPin
} from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState, useEffect } from "react";

const API_BASE = import.meta.env.VITE_API_URL || "";

async function apiFetch(path: string, options?: RequestInit, token?: string | null) {
  const authHeaders: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
  const res = await fetch(`${API_BASE}/api${path}`, {
    credentials: "include",
    ...options,
    headers: { ...authHeaders, ...(options?.headers as Record<string, string> || {}) },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

function timeAgo(dateStr: string, lang: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (lang === "ar") {
    if (mins < 1) return "الآن";
    if (mins < 60) return `منذ ${mins} دقيقة`;
    if (hours < 24) return `منذ ${hours} ساعة`;
    return `منذ ${days} يوم`;
  }
  if (lang === "fr") {
    if (mins < 1) return "maintenant";
    if (mins < 60) return `il y a ${mins} min`;
    if (hours < 24) return `il y a ${hours} h`;
    return `il y a ${days} j`;
  }
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

export function Navbar() {
  const { t, language, setLanguage, dir } = useI18n();
  const { theme, setTheme } = useTheme();
  const { isLoaded, isSignedIn, user, session, signOut } = useAuth();
  const [location] = useLocation();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifOpen, setNotifOpen] = useState(false);

  const signedIn = isLoaded && isSignedIn;
  const signedOut = !signedIn;

  useEffect(() => {
    if (!signedIn) return;
    let cancelled = false;
    async function fetchNotifs() {
      try {
        const tok = session?.access_token;
        const [notifs, countRes] = await Promise.all([
          apiFetch("/notifications?limit=10", undefined, tok),
          apiFetch("/notifications/unread-count", undefined, tok),
        ]);
        if (!cancelled) {
          setNotifications(Array.isArray(notifs) ? notifs : []);
          setUnreadCount(Number(countRes?.count ?? 0));
        }
      } catch {}
    }
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 30000);
    return () => { cancelled = true; clearInterval(interval); };
  }, [signedIn]);

  const markAllRead = async () => {
    try {
      await apiFetch("/notifications/mark-all-read", { method: "PUT" }, session?.access_token);
      setNotifications(n => n.map(x => ({ ...x, isRead: true })));
      setUnreadCount(0);
    } catch {}
  };

  const isActive = (path: string) => {
    if (path === "/" && location === "/") return true;
    if (path !== "/" && location.startsWith(path)) return true;
    return false;
  };

  const NavLink = ({ href, label, icon: Icon }: { href: string; label: string; icon?: any }) => {
    const active = isActive(href);
    return (
      <Link href={href}>
        <span className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
          active
            ? "text-primary bg-primary/8"
            : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
        }`}>
          {Icon && <Icon className="h-4 w-4" />}
          {label}
          {active && (
            <span className="absolute -bottom-[1px] left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full bg-primary" />
          )}
        </span>
      </Link>
    );
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/75 shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-3">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <div className="h-8 w-8 rounded-xl bg-primary flex items-center justify-center shadow-sm">
            <ShoppingBag className="h-4 w-4 text-white" />
          </div>
          <span className="font-black text-lg hidden sm:inline-block tracking-tight">
            Djamel <span className="text-primary">E Shop</span>
          </span>
        </Link>

        {/* Search bar (desktop) */}
        <div className="flex-1 max-w-sm px-2 hidden lg:block">
          <div className={`relative bg-muted/50 border rounded-full flex items-center transition-all hover:border-primary/30 focus-within:border-primary/50 focus-within:shadow-sm`}>
            <Search className={`absolute ${dir === 'rtl' ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground`} />
            <input
              type="text"
              placeholder={t('searchPlaceholder')}
              className={`w-full h-9 bg-transparent border-none ${dir === 'rtl' ? 'pr-10 pl-4' : 'pl-10 pr-4'} text-sm focus:outline-none`}
            />
          </div>
        </div>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-0.5">
          <NavLink href="/" label={t('home')} icon={Home} />
          <NavLink href="/listings" label={t('listings')} icon={ListFilter} />
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-1">

          {/* Language */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full h-9 w-9">
                <Languages className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align={dir === 'rtl' ? "start" : "end"} className="min-w-[9rem]">
              <DropdownMenuLabel className="text-xs text-muted-foreground">اللغة / Language</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {[
                { code: 'ar', label: 'العربية', flag: '🇩🇿' },
                { code: 'fr', label: 'Français', flag: '🇫🇷' },
                { code: 'en', label: 'English', flag: '🇬🇧' },
              ].map(lang => (
                <DropdownMenuItem
                  key={lang.code}
                  onClick={() => setLanguage(lang.code as any)}
                  className={`gap-2 cursor-pointer ${language === lang.code ? 'font-bold text-primary bg-primary/5' : ''}`}
                >
                  <span>{lang.flag}</span>
                  {lang.label}
                  {language === lang.code && <span className="ms-auto text-primary">✓</span>}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Theme toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="rounded-full h-9 w-9"
          >
            {theme === 'dark'
              ? <Sun className="h-4 w-4 text-amber-500" />
              : <Moon className="h-4 w-4" />
            }
          </Button>

          {/* Notifications bell (signed in only) */}
          {signedIn && (
            <DropdownMenu open={notifOpen} onOpenChange={setNotifOpen}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full h-9 w-9 relative">
                  <Bell className="h-4 w-4" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 end-1 h-4 w-4 rounded-full bg-destructive text-[10px] font-bold text-white flex items-center justify-center animate-scale-in">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align={dir === 'rtl' ? "start" : "end"} className="w-80 p-0" sideOffset={8}>
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b">
                  <span className="font-bold text-sm">
                    {language === 'ar' ? 'الإشعارات' : language === 'fr' ? 'Notifications' : 'Notifications'}
                  </span>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      className="text-xs text-primary flex items-center gap-1 hover:opacity-70 transition-opacity"
                    >
                      <CheckCheck className="h-3.5 w-3.5" />
                      {language === 'ar' ? 'قراءة الكل' : language === 'fr' ? 'Tout lire' : 'Mark all read'}
                    </button>
                  )}
                </div>

                {/* List */}
                <div className="max-h-[320px] overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 text-muted-foreground gap-2">
                      <Bell className="h-8 w-8 opacity-20" />
                      <p className="text-sm">{language === 'ar' ? 'لا توجد إشعارات' : language === 'fr' ? 'Aucune notification' : 'No notifications'}</p>
                    </div>
                  ) : (
                    notifications.map((notif: any) => (
                      <a
                        key={notif.id}
                        href={notif.linkUrl || "#"}
                        className={`flex items-start gap-3 px-4 py-3 hover:bg-muted/50 transition-colors border-b last:border-0 ${!notif.isRead ? 'bg-primary/3' : ''}`}
                        onClick={async () => {
                          if (!notif.isRead) {
                            try {
                              await apiFetch(`/notifications/${notif.id}/read`, { method: "PUT" }, session?.access_token);
                              setNotifications(n => n.map(x => x.id === notif.id ? { ...x, isRead: true } : x));
                              setUnreadCount(c => Math.max(0, c - 1));
                            } catch {}
                          }
                          setNotifOpen(false);
                        }}
                      >
                        <Avatar className="h-9 w-9 shrink-0 border">
                          <AvatarImage src={notif.fromUserAvatar} />
                          <AvatarFallback className="text-xs bg-primary/10 text-primary font-bold">
                            {(notif.fromUserName || "?").charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm leading-snug ${!notif.isRead ? 'font-semibold' : ''}`}>
                            {language === 'ar' ? notif.titleAr : language === 'fr' ? notif.titleFr || notif.titleAr : notif.titleEn || notif.titleAr}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">{timeAgo(notif.createdAt, language)}</p>
                        </div>
                        {!notif.isRead && (
                          <span className="h-2 w-2 rounded-full bg-primary mt-1 shrink-0" />
                        )}
                      </a>
                    ))
                  )}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Signed OUT buttons */}
          {signedOut && (
            <div className="hidden sm:flex items-center gap-2 ms-1">
              <Link href="/sign-in">
                <Button variant="ghost" size="sm" className="rounded-full text-sm">
                  {language === 'ar' ? 'دخول' : language === 'fr' ? 'Connexion' : 'Sign in'}
                </Button>
              </Link>
              <Link href="/sign-up">
                <Button size="sm" className="rounded-full px-4 bg-violet-600 hover:bg-violet-700 text-white border-0 shadow-md shadow-violet-500/20 transition-all">
                  {language === 'ar' ? 'إنشاء حساب' : language === 'fr' ? "S'inscrire" : 'Sign up'}
                </Button>
              </Link>
            </div>
          )}

          {/* Signed IN: messages + post + user menu */}
          {signedIn && (
            <div className="hidden sm:flex items-center gap-2 ms-1">
              <Link href="/messages">
                <Button variant="ghost" size="icon" className="rounded-full h-9 w-9 relative">
                  <MessageCircle className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/listings/create">
                <Button size="sm" className="rounded-full px-4 gap-1.5 shadow-sm">
                  <Plus className="h-3.5 w-3.5" />
                  {t('postListing')}
                </Button>
              </Link>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full h-9 w-9 border-2 border-primary/20 hover:border-primary/50 overflow-hidden transition-all p-0"
                  >
                    {user?.user_metadata?.avatar_url
                      ? <img src={user.user_metadata.avatar_url} alt="Avatar" className="h-full w-full object-cover" />
                      : <User className="h-4 w-4 m-auto" />
                    }
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align={dir === 'rtl' ? "start" : "end"} className="w-56">
                  <div className="flex items-center gap-3 p-3 border-b bg-muted/30 rounded-t-lg">
                    <div className="h-9 w-9 rounded-full overflow-hidden bg-muted flex items-center justify-center shrink-0 border">
                      {user?.user_metadata?.avatar_url
                        ? <img src={user.user_metadata.avatar_url} alt="" className="h-full w-full object-cover" />
                        : <User className="h-4 w-4 text-muted-foreground" />
                      }
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm truncate">{user?.user_metadata?.full_name ?? user?.user_metadata?.first_name}</p>
                      <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                    </div>
                  </div>

                  {[
                    { href: "/dashboard", icon: LayoutDashboard, label: t('dashboard') },
                    { href: `/profiles/${user?.id}`, icon: UserCircle2, label: language === 'ar' ? 'ملفي العام' : language === 'fr' ? 'Mon profil public' : 'My Public Profile' },
                    { href: "/profile", icon: User, label: t('profile') },
                    { href: "/messages", icon: MessageCircle, label: t('messages') },
                    { href: "/orders", icon: Package, label: t('orders') },
                  ].map(item => (
                    <Link key={item.href} href={item.href}>
                      <DropdownMenuItem className="cursor-pointer gap-2">
                        <item.icon className="h-4 w-4 text-muted-foreground" />
                        {item.label}
                        <ChevronRight className="ms-auto h-3.5 w-3.5 text-muted-foreground/40 rtl:rotate-180" />
                      </DropdownMenuItem>
                    </Link>
                  ))}

                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive gap-2"
                    onClick={() => signOut()}
                  >
                    <LogOut className="h-4 w-4" />
                    {t('logout')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}

          {/* Mobile hamburger */}
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="sm:hidden h-9 w-9 rounded-full relative">
                <Menu className="h-5 w-5" />
                {unreadCount > 0 && signedIn && (
                  <span className="absolute top-1 end-1 h-3.5 w-3.5 rounded-full bg-destructive text-[9px] font-bold text-white flex items-center justify-center">
                    {unreadCount > 9 ? "+" : unreadCount}
                  </span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side={dir === 'rtl' ? 'right' : 'left'} className="w-72 p-0">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-primary/5 to-accent/5">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-xl bg-primary flex items-center justify-center">
                    <ShoppingBag className="h-4 w-4 text-white" />
                  </div>
                  <span className="font-black text-base">Djamel E Shop</span>
                </div>
                <SheetClose asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                    <X className="h-4 w-4" />
                  </Button>
                </SheetClose>
              </div>

              {/* User info */}
              {signedIn && (
                <div className="flex items-center gap-3 p-4 border-b bg-muted/30">
                  <div className="h-10 w-10 rounded-full overflow-hidden bg-muted border flex items-center justify-center shrink-0">
                    {user?.user_metadata?.avatar_url
                      ? <img src={user.user_metadata.avatar_url} alt="" className="h-full w-full object-cover" />
                      : <User className="h-5 w-5 text-muted-foreground" />
                    }
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-sm truncate">{user?.user_metadata?.full_name ?? user?.user_metadata?.first_name}</p>
                    <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                  </div>
                  {unreadCount > 0 && (
                    <Badge variant="destructive" className="text-xs shrink-0">{unreadCount}</Badge>
                  )}
                </div>
              )}

              {/* Navigation */}
              <nav className="p-3 space-y-1 overflow-y-auto">
                {[
                  { href: "/", icon: Home, label: t('home') },
                  { href: "/listings", icon: ListFilter, label: t('listings') },
                ].map(item => (
                  <SheetClose key={item.href} asChild>
                    <Link href={item.href}>
                      <div className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                        isActive(item.href)
                          ? "bg-primary/10 text-primary"
                          : "hover:bg-muted text-foreground"
                      }`}>
                        <item.icon className="h-5 w-5 shrink-0" />
                        {item.label}
                        {isActive(item.href) && <ChevronRight className="ms-auto h-4 w-4 rtl:rotate-180" />}
                      </div>
                    </Link>
                  </SheetClose>
                ))}

                {signedIn && (
                  <>
                    <div className="pt-2 pb-1">
                      <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        {language === 'ar' ? 'حسابي' : language === 'fr' ? 'Mon compte' : 'My Account'}
                      </p>
                    </div>
                    {[
                      { href: "/dashboard", icon: LayoutDashboard, label: t('dashboard') },
                      { href: `/profiles/${user?.id}`, icon: UserCircle2, label: language === 'ar' ? 'ملفي العام' : 'Mon profil public' },
                      { href: "/profile", icon: User, label: t('profile') },
                      { href: "/messages", icon: MessageCircle, label: t('messages') },
                      { href: "/orders", icon: Package, label: t('orders') },
                      { href: "/listings/create", icon: Plus, label: t('postListing'), highlight: true },
                    ].map(item => (
                      <SheetClose key={item.href} asChild>
                        <Link href={item.href}>
                          <div className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                            (item as any).highlight
                              ? "bg-primary text-primary-foreground hover:bg-primary/90"
                              : isActive(item.href)
                              ? "bg-primary/10 text-primary"
                              : "hover:bg-muted text-foreground"
                          }`}>
                            <item.icon className="h-5 w-5 shrink-0" />
                            {item.label}
                            <ChevronRight className="ms-auto h-4 w-4 rtl:rotate-180" />
                          </div>
                        </Link>
                      </SheetClose>
                    ))}

                    <div className="pt-2">
                      <button
                        onClick={() => { signOut(); setSheetOpen(false); }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                      >
                        <LogOut className="h-5 w-5 shrink-0" />
                        {t('logout')}
                      </button>
                    </div>
                  </>
                )}

                {signedOut && (
                  <div className="pt-2 border-t space-y-2">
                    <SheetClose asChild>
                      <Link href="/sign-in">
                        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium hover:bg-muted text-foreground transition-all cursor-pointer">
                          <User className="h-5 w-5 shrink-0" />
                          {language === 'ar' ? 'تسجيل الدخول' : language === 'fr' ? 'Connexion' : 'Sign in'}
                        </div>
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link href="/sign-up">
                        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold bg-violet-600 text-white hover:bg-violet-700 transition-all cursor-pointer">
                          <Plus className="h-5 w-5 shrink-0" />
                          {language === 'ar' ? 'إنشاء حساب' : language === 'fr' ? "S'inscrire" : 'Sign up'}
                        </div>
                      </Link>
                    </SheetClose>
                  </div>
                )}
              </nav>

              {/* Bottom: Language + Theme */}
              <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-muted/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    {['ar', 'fr', 'en'].map(lang => (
                      <button
                        key={lang}
                        onClick={() => setLanguage(lang as any)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                          language === lang ? "bg-primary text-primary-foreground" : "hover:bg-muted text-muted-foreground"
                        }`}
                      >
                        {lang === 'ar' ? 'ع' : lang === 'fr' ? 'Fr' : 'En'}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    className="h-8 w-8 rounded-full border flex items-center justify-center hover:bg-muted transition-colors"
                  >
                    {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-500" /> : <Moon className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
