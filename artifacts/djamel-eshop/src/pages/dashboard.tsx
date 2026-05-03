import { useI18n } from "@/contexts/I18nContext";
import { Link } from "wouter";
import { useGetDashboardStats, useGetRecentActivity, useGetMyListings, useListOrders, useUpdateOrderStatus } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useUser } from "@clerk/react";
import {
  ShoppingBag, TrendingUp, MessageCircle, Package,
  Star, Plus, Eye, ArrowRight, ArrowLeft, Clock
} from "lucide-react";

export default function Dashboard() {
  const { language, dir } = useI18n();
  const { user } = useUser();
  const { data: stats, isLoading: statsLoading } = useGetDashboardStats();
  const { data: activity, isLoading: actLoading } = useGetRecentActivity();
  const { data: myListings, isLoading: listingsLoading } = useGetMyListings();
  const { data: orders, isLoading: ordersLoading } = useListOrders({ role: "seller" } as any);

  const label = (ar: string, fr: string, en: string) =>
    language === "ar" ? ar : language === "fr" ? fr : en;

  const s = stats as any;
  const acts = (activity as any[]) ?? [];
  const listings = (myListings as any[]) ?? [];
  const sellerOrders = (orders as any[]) ?? [];

  const StatCard = ({ icon: Icon, label: l, value, color }: any) => (
    <Card>
      <CardContent className="p-6 flex items-center gap-4">
        <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{l}</p>
          {statsLoading ? <Skeleton className="h-7 w-16 mt-1" /> : <p className="text-2xl font-bold">{value}</p>}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">
            {label(`مرحباً، ${user?.firstName || ""}`, `Bienvenue, ${user?.firstName || ""}`, `Welcome, ${user?.firstName || ""}`)}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">{label("هذه لوحة تحكمك", "Votre tableau de bord", "Your dashboard overview")}</p>
        </div>
        <Link href="/listings/create">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            {label("إعلان جديد", "Nouvelle annonce", "New Listing")}
          </Button>
        </Link>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={ShoppingBag} label={label("إعلاناتي", "Mes annonces", "My Listings")} value={s?.totalListings ?? "—"} color="bg-primary/10 text-primary" />
        <StatCard icon={Package} label={label("الطلبات المعلقة", "Commandes en attente", "Pending Orders")} value={s?.pendingOrders ?? "—"} color="bg-amber-100 text-amber-600" />
        <StatCard icon={MessageCircle} label={label("رسائل غير مقروءة", "Messages non lus", "Unread Messages")} value={s?.unreadMessages ?? "—"} color="bg-blue-100 text-blue-600" />
        <StatCard icon={Star} label={label("متوسط التقييم", "Note moyenne", "Avg. Rating")} value={s?.averageRating ? s.averageRating.toFixed(1) + " ★" : "—"} color="bg-green-100 text-green-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* My Listings */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-lg">{label("إعلاناتي الأخيرة", "Mes dernières annonces", "My Recent Listings")}</h2>
            <Link href="/listings?my=true">
              <Button variant="ghost" size="sm" className="gap-1 text-primary">
                {label("عرض الكل", "Voir tout", "View all")}
                {dir === "rtl" ? <ArrowLeft className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
              </Button>
            </Link>
          </div>

          {listingsLoading
            ? Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)
            : listings.length === 0
            ? (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                  <ShoppingBag className="h-10 w-10 mx-auto mb-3 opacity-30" />
                  <p>{label("لا توجد إعلانات بعد", "Aucune annonce", "No listings yet")}</p>
                  <Link href="/listings/create">
                    <Button className="mt-4 gap-2" size="sm">
                      <Plus className="h-4 w-4" />
                      {label("أنشئ أول إعلان", "Créer une annonce", "Create your first listing")}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )
            : listings.slice(0, 5).map((listing: any) => (
              <Link key={listing.id} href={`/listings/${listing.id}`}>
                <Card className="hover:border-primary/40 transition-colors cursor-pointer">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="h-14 w-14 rounded-lg overflow-hidden bg-muted shrink-0">
                      {listing.images?.[0]
                        ? <img src={listing.images[0]} alt="" className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center text-2xl">🛍️</div>
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {language === "ar" ? listing.titleAr : language === "fr" ? listing.titleFr || listing.titleAr : listing.titleEn || listing.titleAr}
                      </p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        {listing.price && <span className="text-primary font-semibold">{Number(listing.price).toLocaleString()} {label("د.ج", "DZD", "DZD")}</span>}
                        <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {listing.viewCount || 0}</span>
                      </div>
                    </div>
                    <Badge variant={listing.isActive ? "default" : "secondary"} className="shrink-0">
                      {listing.isActive ? label("نشط", "Actif", "Active") : label("متوقف", "Inactif", "Inactive")}
                    </Badge>
                  </CardContent>
                </Card>
              </Link>
            ))
          }
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Recent orders */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center justify-between">
                {label("أحدث الطلبات", "Dernières commandes", "Recent Orders")}
                <Link href="/orders">
                  <Button variant="ghost" size="sm" className="h-7 text-xs text-primary">
                    {label("الكل", "Tout", "All")}
                  </Button>
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-3">
              {ordersLoading
                ? Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-12 rounded-lg" />)
                : sellerOrders.length === 0
                ? <p className="text-sm text-muted-foreground text-center py-4">{label("لا توجد طلبات", "Aucune commande", "No orders")}</p>
                : sellerOrders.slice(0, 4).map((order: any) => (
                  <div key={order.id} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">#{order.id}</span>
                    <Badge variant={
                      order.status === "completed" ? "default" :
                      order.status === "pending" ? "secondary" : "outline"
                    } className="text-xs">
                      {order.status === "pending" ? label("معلق", "En attente", "Pending") :
                       order.status === "confirmed" ? label("مؤكد", "Confirmé", "Confirmed") :
                       order.status === "completed" ? label("مكتمل", "Terminé", "Completed") :
                       label("ملغى", "Annulé", "Cancelled")}
                    </Badge>
                  </div>
                ))
              }
            </CardContent>
          </Card>

          {/* Activity */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{label("النشاط الأخير", "Activité récente", "Recent Activity")}</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-3">
              {actLoading
                ? Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-10 rounded-lg" />)
                : acts.length === 0
                ? <p className="text-sm text-muted-foreground text-center py-4">{label("لا يوجد نشاط", "Aucune activité", "No activity")}</p>
                : acts.slice(0, 5).map((act: any) => (
                  <div key={act.id} className="flex items-start gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                    <span className="text-muted-foreground">
                      {language === "ar" ? act.titleAr : act.titleFr}
                    </span>
                  </div>
                ))
              }
            </CardContent>
          </Card>

          {/* Quick links */}
          <div className="grid grid-cols-2 gap-3">
            <Link href="/messages">
              <Card className="hover:border-primary/40 transition-colors cursor-pointer">
                <CardContent className="p-4 text-center">
                  <MessageCircle className="h-6 w-6 mx-auto mb-1 text-primary" />
                  <p className="text-xs font-medium">{label("الرسائل", "Messages", "Messages")}</p>
                  {s?.unreadMessages > 0 && (
                    <Badge className="mt-1 text-xs">{s.unreadMessages}</Badge>
                  )}
                </CardContent>
              </Card>
            </Link>
            <Link href="/orders">
              <Card className="hover:border-primary/40 transition-colors cursor-pointer">
                <CardContent className="p-4 text-center">
                  <Package className="h-6 w-6 mx-auto mb-1 text-primary" />
                  <p className="text-xs font-medium">{label("الطلبات", "Commandes", "Orders")}</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
