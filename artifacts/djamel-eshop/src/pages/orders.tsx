import { useState } from "react";
import { useI18n } from "@/contexts/I18nContext";
import { Link } from "wouter";
import { useListOrders, useUpdateOrderStatus } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

function statusBadge(status: string, label: (ar: string, fr: string, en: string) => string) {
  const map: Record<string, { ar: string; fr: string; en: string; variant: any }> = {
    pending: { ar: "معلق", fr: "En attente", en: "Pending", variant: "secondary" },
    confirmed: { ar: "مؤكد", fr: "Confirmé", en: "Confirmed", variant: "outline" },
    completed: { ar: "مكتمل", fr: "Terminé", en: "Completed", variant: "default" },
    cancelled: { ar: "ملغى", fr: "Annulé", en: "Cancelled", variant: "destructive" },
  };
  const s = map[status] || map.pending;
  return <Badge variant={s.variant}>{label(s.ar, s.fr, s.en)}</Badge>;
}

export default function OrdersPage() {
  const { language } = useI18n();
  const { toast } = useToast();
  const [tab, setTab] = useState("buyer");

  const { data: buyerOrders, isLoading: buyerLoading, refetch: refetchBuyer } = useListOrders({ role: "buyer" } as any);
  const { data: sellerOrders, isLoading: sellerLoading, refetch: refetchSeller } = useListOrders({ role: "seller" } as any);
  const updateStatus = useUpdateOrderStatus();

  const label = (ar: string, fr: string, en: string) =>
    language === "ar" ? ar : language === "fr" ? fr : en;

  const handleAction = async (orderId: number, status: string) => {
    try {
      await updateStatus.mutateAsync({ orderId, status } as any);
      refetchBuyer();
      refetchSeller();
      toast({ title: label("تم تحديث الطلب", "Commande mise à jour", "Order updated") });
    } catch {
      toast({ title: label("خطأ", "Erreur", "Error"), variant: "destructive" });
    }
  };

  const OrderCard = ({ order, role }: { order: any; role: string }) => (
    <Card className="hover:border-primary/30 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className="h-14 w-14 rounded-lg overflow-hidden bg-muted shrink-0">
            {order.listing?.images?.[0]
              ? <img src={order.listing.images[0]} alt="" className="w-full h-full object-cover" />
              : <div className="w-full h-full flex items-center justify-center text-2xl">🛍️</div>
            }
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-semibold text-sm truncate">
                  {order.listing
                    ? (language === "ar" ? order.listing.titleAr : language === "fr" ? order.listing.titleFr || order.listing.titleAr : order.listing.titleEn || order.listing.titleAr)
                    : label("إعلان محذوف", "Annonce supprimée", "Deleted listing")}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {label("طلب", "Commande", "Order")} #{order.id} · {label("الكمية:", "Qté:", "Qty:")} {order.quantity}
                </p>
                {order.totalPrice && (
                  <p className="text-primary font-bold text-sm mt-1">{Number(order.totalPrice).toLocaleString()} {label("د.ج", "DZD", "DZD")}</p>
                )}
              </div>
              <div className="shrink-0">{statusBadge(order.status, label)}</div>
            </div>

            {/* Seller/Buyer info */}
            <div className="mt-2 text-xs text-muted-foreground flex items-center gap-1">
              {role === "buyer"
                ? `${label("البائع:", "Vendeur:", "Seller:")} ${order.sellerProfile?.displayName || "—"}`
                : `${label("المشتري:", "Acheteur:", "Buyer:")} ${order.buyerProfile?.displayName || "—"}`
              }
              {order.listing?.wilaya && (
                <span className="flex items-center gap-0.5 ms-2">
                  <MapPin className="h-3 w-3" />
                  {order.listing.wilaya}
                </span>
              )}
            </div>

            {order.notes && (
              <p className="mt-2 text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-2 italic">{order.notes}</p>
            )}

            {/* Actions */}
            {role === "seller" && order.status === "pending" && (
              <div className="mt-3 flex gap-2">
                <Button size="sm" onClick={() => handleAction(order.id, "confirmed")} disabled={updateStatus.isPending}>
                  {label("تأكيد", "Confirmer", "Confirm")}
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleAction(order.id, "cancelled")} disabled={updateStatus.isPending}>
                  {label("إلغاء", "Annuler", "Cancel")}
                </Button>
              </div>
            )}
            {role === "seller" && order.status === "confirmed" && (
              <div className="mt-3">
                <Button size="sm" onClick={() => handleAction(order.id, "completed")} disabled={updateStatus.isPending}>
                  {label("إتمام الطلب", "Terminer", "Complete")}
                </Button>
              </div>
            )}
            {role === "buyer" && order.status === "pending" && (
              <div className="mt-3">
                <Button size="sm" variant="outline" onClick={() => handleAction(order.id, "cancelled")} disabled={updateStatus.isPending}>
                  {label("إلغاء الطلب", "Annuler", "Cancel Order")}
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderOrders = (orders: any[], isLoading: boolean, role: string) => {
    if (isLoading) return Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />);
    if (!orders?.length) return (
      <div className="text-center py-12 text-muted-foreground">
        <Package className="h-10 w-10 mx-auto mb-3 opacity-30" />
        <p>{label("لا توجد طلبات", "Aucune commande", "No orders")}</p>
      </div>
    );
    return orders.map((o: any) => <OrderCard key={o.id} order={o} role={role} />);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">{label("الطلبات", "Commandes", "Orders")}</h1>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="buyer">{label("مشترياتي", "Mes achats", "My Purchases")}</TabsTrigger>
          <TabsTrigger value="seller">{label("طلبات متجري", "Mes ventes", "My Sales")}</TabsTrigger>
        </TabsList>

        <TabsContent value="buyer">
          <div className="space-y-4">
            {renderOrders((buyerOrders as any[]) ?? [], buyerLoading, "buyer")}
          </div>
        </TabsContent>

        <TabsContent value="seller">
          <div className="space-y-4">
            {renderOrders((sellerOrders as any[]) ?? [], sellerLoading, "seller")}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
