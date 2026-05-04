import { useState, useEffect } from "react";
import { useParams, Link } from "wouter";
import { useI18n } from "@/contexts/I18nContext";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from "@/components/ui/dialog";
import {
  User, MapPin, Star, ShoppingBag, UserPlus, UserCheck,
  Users, Package, MessageCircle, ChevronRight, Calendar,
  Globe, CheckCircle2, Phone, Instagram, Facebook, Twitter
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const API_BASE = import.meta.env.VITE_API_URL || "";

async function apiFetch(path: string, options?: RequestInit) {
  const res = await fetch(`${API_BASE}/api${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

type TabKey = "listings" | "about" | "followers" | "following";

export default function PublicProfilePage() {
  const { userId } = useParams<{ userId: string }>();
  const { language, dir } = useI18n();
  const { user: currentUser, isSignedIn } = useAuth();
  const { toast } = useToast();

  const [profile, setProfile] = useState<any>(null);
  const [listings, setListings] = useState<any[]>([]);
  const [stats, setStats] = useState({ followersCount: 0, followingCount: 0, listingsCount: 0 });
  const [isFollowing, setIsFollowing] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingFollow, setLoadingFollow] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>("listings");
  const [followers, setFollowers] = useState<any[]>([]);
  const [following, setFollowing] = useState<any[]>([]);
  const [loadingFollowers, setLoadingFollowers] = useState(false);
  const [loadingFollowing, setLoadingFollowing] = useState(false);

  const t = (ar: string, fr: string, en: string) =>
    language === "ar" ? ar : language === "fr" ? fr : en;

  const isOwnProfile = currentUser?.id === userId;

  useEffect(() => {
    if (!userId) return;
    async function load() {
      setLoadingProfile(true);
      try {
        const [profileRes, listingsRes] = await Promise.allSettled([
          apiFetch(`/profiles/${userId}`),
          apiFetch(`/profiles/${userId}/listings`),
        ]);
        if (profileRes.status === "fulfilled") setProfile(profileRes.value);
        if (listingsRes.status === "fulfilled") setListings(Array.isArray(listingsRes.value) ? listingsRes.value : []);
        try {
          const statsData = await apiFetch(`/profiles/${userId}/follow-stats`);
          setStats(statsData);
        } catch {}
        if (isSignedIn && currentUser?.id !== userId) {
          try {
            const followData = await apiFetch(`/follows/status/${userId}`);
            setIsFollowing(followData.isFollowing ?? false);
          } catch {}
        }
      } catch (err) {
        console.error("Failed to load profile", err);
      } finally {
        setLoadingProfile(false);
      }
    }
    load();
  }, [userId, isSignedIn, currentUser?.id]);

  useEffect(() => {
    if (activeTab === "followers" && followers.length === 0) {
      setLoadingFollowers(true);
      apiFetch(`/profiles/${userId}/followers`)
        .then(setFollowers)
        .catch(() => {})
        .finally(() => setLoadingFollowers(false));
    }
    if (activeTab === "following" && following.length === 0) {
      setLoadingFollowing(true);
      apiFetch(`/profiles/${userId}/following`)
        .then(setFollowing)
        .catch(() => {})
        .finally(() => setLoadingFollowing(false));
    }
  }, [activeTab, userId]);

  const handleFollow = async () => {
    if (!isSignedIn) {
      toast({ title: t("يجب تسجيل الدخول أولاً", "Connectez-vous d'abord", "Please sign in first"), variant: "destructive" });
      return;
    }
    setLoadingFollow(true);
    try {
      if (isFollowing) {
        await apiFetch(`/follows/${userId}`, { method: "DELETE" });
        setIsFollowing(false);
        setStats(s => ({ ...s, followersCount: Math.max(0, s.followersCount - 1) }));
        toast({ title: t("تم إلغاء المتابعة", "Désabonné", "Unfollowed") });
      } else {
        await apiFetch(`/follows/${userId}`, { method: "POST" });
        setIsFollowing(true);
        setStats(s => ({ ...s, followersCount: s.followersCount + 1 }));
        toast({ title: t("تمت المتابعة! سيتلقى إشعاراً", "Abonné! Il sera notifié", "Following! They'll be notified") });
      }
    } catch {
      toast({ title: t("حدث خطأ", "Erreur", "Error"), variant: "destructive" });
    } finally {
      setLoadingFollow(false);
    }
  };

  if (loadingProfile) return (
    <div className="min-h-screen">
      <div className="h-40 bg-gradient-to-r from-primary/20 via-accent/10 to-primary/5" />
      <div className="container mx-auto px-4 max-w-4xl -mt-16 pb-12">
        <Skeleton className="h-32 w-32 rounded-full border-4 border-background mb-4" />
        <Skeleton className="h-7 w-48 mb-2" />
        <Skeleton className="h-4 w-64 mb-4" />
        <div className="grid grid-cols-3 gap-4 mt-6">
          {Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-8">
          {Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-64 rounded-2xl" />)}
        </div>
      </div>
    </div>
  );

  if (!profile) return (
    <div className="container mx-auto px-4 py-20 max-w-4xl text-center">
      <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
        <User className="h-10 w-10 text-muted-foreground/30" />
      </div>
      <h2 className="text-xl font-bold mb-2">{t("المستخدم غير موجود", "Utilisateur introuvable", "User not found")}</h2>
      <p className="text-muted-foreground mb-6">{t("لم يتم العثور على هذا الحساب", "Ce compte n'existe pas", "This account doesn't exist")}</p>
      <Link href="/listings"><Button>{t("تصفح الإعلانات", "Parcourir les annonces", "Browse Listings")}</Button></Link>
    </div>
  );

  const coverBg = profile.coverImageUrl
    ? `url(${profile.coverImageUrl})`
    : undefined;

  const tabs: { key: TabKey; label: string; count?: number; icon: any }[] = [
    { key: "listings", label: t("الإعلانات", "Annonces", "Listings"), count: stats.listingsCount || listings.length, icon: Package },
    { key: "about", label: t("عن الحساب", "À propos", "About"), icon: User },
    { key: "followers", label: t("المتابعون", "Abonnés", "Followers"), count: stats.followersCount, icon: Users },
    { key: "following", label: t("يتابع", "Abonnements", "Following"), count: stats.followingCount, icon: UserCheck },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Cover */}
      <div
        className="h-44 sm:h-56 relative overflow-hidden"
        style={{
          background: coverBg
            ? `${coverBg} center/cover no-repeat`
            : "linear-gradient(135deg, hsl(var(--primary)/20), hsl(var(--accent)/15), hsl(var(--primary)/8))",
        }}
      >
        <div className="absolute inset-0 hero-arabesque opacity-30 pointer-events-none" />
        <div className="absolute -bottom-6 -start-10 w-48 h-48 rounded-full bg-primary/8 blur-3xl" />
        <div className="absolute -top-10 -end-10 w-64 h-64 rounded-full bg-accent/10 blur-3xl" />
      </div>

      {/* Profile card row */}
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-16 mb-6 relative z-10">
          {/* Avatar */}
          <div className="relative animate-scale-in">
            <div className="h-32 w-32 rounded-full border-4 border-background shadow-2xl overflow-hidden bg-muted flex items-center justify-center">
              {profile.avatarUrl
                ? <img src={profile.avatarUrl} alt="" className="w-full h-full object-cover" />
                : <User className="h-16 w-16 text-muted-foreground/40" />
              }
            </div>
            {profile.isStore && (
              <div className="absolute bottom-1 end-1 h-8 w-8 rounded-full bg-primary flex items-center justify-center border-2 border-background shadow">
                <ShoppingBag className="h-4 w-4 text-white" />
              </div>
            )}
            {profile.isVerified && (
              <div className="absolute top-1 end-1 h-7 w-7 rounded-full bg-blue-500 flex items-center justify-center border-2 border-background shadow">
                <CheckCircle2 className="h-3.5 w-3.5 text-white" />
              </div>
            )}
          </div>

          {/* Name + Actions */}
          <div className="flex-1 pb-2 animate-fade-in-up" style={{ animationDelay: "60ms" }}>
            <div className="flex flex-wrap items-center gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-black">{profile.displayName || t("مستخدم", "Utilisateur", "User")}</h1>
                  {profile.isVerified && <CheckCircle2 className="h-5 w-5 text-blue-500 fill-blue-500/20" />}
                </div>
                {profile.isStore && profile.storeName && (
                  <p className="text-sm text-primary font-semibold">{profile.storeName}</p>
                )}
              </div>
              <div className="flex gap-2 ms-auto sm:ms-0">
                {!isOwnProfile && (
                  <>
                    <Button
                      onClick={handleFollow}
                      disabled={loadingFollow}
                      variant={isFollowing ? "outline" : "default"}
                      size="sm"
                      className={`rounded-full gap-2 transition-all duration-300 shadow-sm ${
                        isFollowing
                          ? "border-primary text-primary hover:bg-destructive/10 hover:text-destructive hover:border-destructive"
                          : "bg-violet-600 hover:bg-violet-700 text-white border-0 shadow-violet-500/25"
                      }`}
                    >
                      {isFollowing
                        ? <><UserCheck className="h-4 w-4" />{t("تابع", "Abonné", "Following")}</>
                        : <><UserPlus className="h-4 w-4" />{t("متابعة", "Suivre", "Follow")}</>
                      }
                    </Button>
                    <Link href="/messages">
                      <Button variant="outline" size="sm" className="rounded-full gap-2">
                        <MessageCircle className="h-4 w-4" />
                        {t("رسالة", "Message", "Message")}
                      </Button>
                    </Link>
                  </>
                )}
                {isOwnProfile && (
                  <Link href="/profile">
                    <Button variant="outline" size="sm" className="rounded-full gap-2">
                      <User className="h-4 w-4" />
                      {t("تعديل الملف", "Modifier le profil", "Edit Profile")}
                    </Button>
                  </Link>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-muted-foreground">
              {(profile.wilaya || profile.city) && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-primary/70" />
                  {profile.city ? `${profile.city}, ` : ""}{profile.wilaya}
                </span>
              )}
              {profile.website && (
                <a href={profile.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-primary transition-colors">
                  <Globe className="h-3.5 w-3.5" />
                  <span className="truncate max-w-[120px]">{profile.website.replace(/https?:\/\//, "")}</span>
                </a>
              )}
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                {new Date(profile.createdAt).toLocaleDateString(
                  language === "ar" ? "ar-DZ" : language === "fr" ? "fr-FR" : "en-US",
                  { year: "numeric", month: "long" }
                )}
              </span>
            </div>

            {profile.bio && (
              <p className="text-sm text-muted-foreground mt-2 max-w-xl leading-relaxed">{profile.bio}</p>
            )}
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 mb-6 animate-fade-in-up" style={{ animationDelay: "120ms" }}>
          {[
            { value: stats.listingsCount || listings.length, label: t("إعلان", "Annonces", "Listings"), tab: "listings" as TabKey },
            { value: stats.followersCount, label: t("متابع", "Abonnés", "Followers"), tab: "followers" as TabKey },
            { value: stats.followingCount, label: t("يتابع", "Abonnements", "Following"), tab: "following" as TabKey },
          ].map(stat => (
            <button
              key={stat.tab}
              onClick={() => setActiveTab(stat.tab)}
              className={`p-4 rounded-2xl text-center border transition-all cursor-pointer hover:shadow-md ${
                activeTab === stat.tab
                  ? "bg-primary/8 border-primary/30 shadow-sm"
                  : "bg-card hover:bg-muted/40 border-border"
              }`}
            >
              <p className={`text-2xl font-black ${activeTab === stat.tab ? "text-primary" : "text-foreground"}`}>{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
            </button>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b mb-6 overflow-x-auto no-scrollbar">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-all relative ${
                activeTab === tab.key
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span className={`text-xs rounded-full px-1.5 ${activeTab === tab.key ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"}`}>
                  {tab.count}
                </span>
              )}
              {activeTab === tab.key && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === "listings" && (
          <div className="pb-12">
            {listings.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
                <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                  <ShoppingBag className="h-7 w-7 opacity-30" />
                </div>
                <p className="text-sm">{t("لا توجد إعلانات بعد", "Aucune annonce", "No listings yet")}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {listings.map((listing: any, i: number) => (
                  <ProfileListingCard key={listing.id} listing={listing} index={i} language={language} />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "about" && (
          <div className="pb-12 max-w-2xl space-y-5 animate-fade-in-up">
            {profile.storeDescription && (
              <Card className="border-0 bg-muted/30">
                <CardContent className="p-5">
                  <h3 className="font-bold text-sm mb-2 text-primary">{t("عن المتجر", "À propos du magasin", "About the Store")}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{profile.storeDescription}</p>
                </CardContent>
              </Card>
            )}

            <Card className="border-0 bg-muted/30">
              <CardContent className="p-5 space-y-3">
                <h3 className="font-bold text-sm text-primary">{t("معلومات التواصل", "Coordonnées", "Contact Info")}</h3>
                {profile.phone && (
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                    <a href={`tel:${profile.phone}`} className="hover:text-primary transition-colors">{profile.phone}</a>
                  </div>
                )}
                {profile.website && (
                  <div className="flex items-center gap-3 text-sm">
                    <Globe className="h-4 w-4 text-muted-foreground shrink-0" />
                    <a href={profile.website} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors truncate">{profile.website}</a>
                  </div>
                )}
                {(profile.socialLinks as any)?.instagram && (
                  <div className="flex items-center gap-3 text-sm">
                    <Instagram className="h-4 w-4 text-pink-500 shrink-0" />
                    <a href={`https://instagram.com/${(profile.socialLinks as any).instagram}`} target="_blank" rel="noopener noreferrer" className="hover:text-pink-500 transition-colors">@{(profile.socialLinks as any).instagram}</a>
                  </div>
                )}
                {(profile.socialLinks as any)?.facebook && (
                  <div className="flex items-center gap-3 text-sm">
                    <Facebook className="h-4 w-4 text-blue-600 shrink-0" />
                    <a href={(profile.socialLinks as any).facebook} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 transition-colors">{t("فيسبوك", "Facebook", "Facebook")}</a>
                  </div>
                )}
                {(profile.socialLinks as any)?.twitter && (
                  <div className="flex items-center gap-3 text-sm">
                    <Twitter className="h-4 w-4 text-sky-500 shrink-0" />
                    <a href={`https://twitter.com/${(profile.socialLinks as any).twitter}`} target="_blank" rel="noopener noreferrer" className="hover:text-sky-500 transition-colors">@{(profile.socialLinks as any).twitter}</a>
                  </div>
                )}
                {!profile.phone && !profile.website && !profile.socialLinks && (
                  <p className="text-sm text-muted-foreground">{t("لا توجد معلومات تواصل", "Aucune coordonnée", "No contact info")}</p>
                )}
              </CardContent>
            </Card>

            <Card className="border-0 bg-muted/30">
              <CardContent className="p-5 space-y-3">
                <h3 className="font-bold text-sm text-primary">{t("إحصائيات", "Statistiques", "Statistics")}</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {profile.averageRating && (
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                      <span>{Number(profile.averageRating).toFixed(1)} ({profile.reviewCount} {t("تقييم", "avis", "reviews")})</span>
                    </div>
                  )}
                  {profile.totalSales > 0 && (
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-green-500" />
                      <span>{profile.totalSales} {t("مبيعات", "ventes", "sales")}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "followers" && (
          <div className="pb-12 animate-fade-in-up">
            {loadingFollowers ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-20 rounded-2xl" />)}
              </div>
            ) : followers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
                <Users className="h-12 w-12 opacity-20" />
                <p className="text-sm">{t("لا يوجد متابعون بعد", "Aucun abonné", "No followers yet")}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {followers.map((p: any, i: number) => (
                  <UserCard key={p.clerkUserId} profile={p} index={i} language={language} />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "following" && (
          <div className="pb-12 animate-fade-in-up">
            {loadingFollowing ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-20 rounded-2xl" />)}
              </div>
            ) : following.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
                <UserCheck className="h-12 w-12 opacity-20" />
                <p className="text-sm">{t("لا يتابع أحداً بعد", "Ne suit personne", "Not following anyone yet")}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {following.map((p: any, i: number) => (
                  <UserCard key={p.clerkUserId} profile={p} index={i} language={language} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function UserCard({ profile, index, language }: { profile: any; index: number; language: string }) {
  return (
    <Link href={`/profiles/${profile.clerkUserId}`}>
      <div
        className="flex items-center gap-3 p-4 rounded-2xl border bg-card hover:bg-muted/40 hover:shadow-md transition-all cursor-pointer animate-fade-in-up group"
        style={{ animationDelay: `${index * 50}ms` }}
      >
        <Avatar className="h-12 w-12 border-2 border-background shadow">
          <AvatarImage src={profile.avatarUrl} />
          <AvatarFallback className="bg-primary/10 text-primary font-bold">
            {(profile.displayName || "U").charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm truncate flex items-center gap-1.5">
            {profile.displayName}
            {profile.isVerified && <CheckCircle2 className="h-3.5 w-3.5 text-blue-500 shrink-0" />}
          </p>
          {(profile.wilaya || profile.city) && (
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
              <MapPin className="h-3 w-3" />
              {profile.city || profile.wilaya}
            </p>
          )}
          {profile.isStore && profile.storeName && (
            <p className="text-xs text-primary truncate mt-0.5">{profile.storeName}</p>
          )}
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-primary transition-colors rtl:rotate-180 shrink-0" />
      </div>
    </Link>
  );
}

function ProfileListingCard({ listing, index, language }: { listing: any; index: number; language: string }) {
  const title = language === "ar" ? listing.titleAr : language === "fr" ? listing.titleFr || listing.titleAr : listing.titleEn || listing.titleAr;

  return (
    <Link href={`/listings/${listing.id}`}>
      <Card
        className="card-hover overflow-hidden cursor-pointer group bg-card h-full animate-fade-in-up"
        style={{ animationDelay: `${index * 60}ms` }}
      >
        <div className="relative overflow-hidden">
          <AspectRatio ratio={4 / 3}>
            {listing.images?.[0] ? (
              <img src={listing.images[0]} alt={title} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-muted to-muted/60 flex items-center justify-center">
                <ShoppingBag className="h-12 w-12 text-muted-foreground/20" />
              </div>
            )}
          </AspectRatio>
          <div className="absolute top-2.5 end-2.5">
            <Badge className="text-xs" variant={listing.listingType === "service" ? "secondary" : "default"}>
              {listing.listingType === "service"
                ? (language === "ar" ? "خدمة" : "Service")
                : (language === "ar" ? "منتج" : "Produit")}
            </Badge>
          </div>
        </div>
        <CardContent className="p-4 space-y-2">
          <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors">{title}</h3>
          <div className="flex items-center justify-between">
            {listing.price && (
              <p className="font-bold text-primary text-sm">
                {Number(listing.price).toLocaleString()} <span className="text-xs font-normal opacity-70">{listing.currency || "DZD"}</span>
              </p>
            )}
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3" />{listing.wilaya}
            </span>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
            <span>{listing.averageRating ? Number(listing.averageRating).toFixed(1) : "—"}</span>
            <span className="opacity-60">({listing.reviewCount ?? 0})</span>
            <span className="ms-auto flex items-center gap-1 text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity">
              {language === "ar" ? "عرض" : "View"}
              <ChevronRight className="h-3 w-3" />
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
