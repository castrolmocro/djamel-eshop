import { useState } from "react";
import { useI18n } from "@/contexts/I18nContext";
import { useParams, Link } from "wouter";
import { useGetListing, useGetListingReviews, useCreateConversation } from "@workspace/api-client-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, Star, Eye, MessageCircle, ChevronLeft, ChevronRight, User } from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

export default function ListingDetail() {
  const { listingId } = useParams<{ listingId: string }>();
  const { language, dir } = useI18n();
  const { isSignedIn } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [imageIdx, setImageIdx] = useState(0);
  const [messageText, setMessageText] = useState("");
  const [msgOpen, setMsgOpen] = useState(false);

  const { data: listing, isLoading } = useGetListing(Number(listingId));
  const { data: reviews } = useGetListingReviews(Number(listingId));
  const createConv = useCreateConversation();

  const label = (ar: string, fr: string, en: string) =>
    language === "ar" ? ar : language === "fr" ? fr : en;

  const handleContact = async () => {
    if (!isSignedIn) {
      navigate("/sign-in");
      return;
    }
    try {
      const conv = await createConv.mutateAsync({
        sellerUserId: (listing as any).sellerUserId,
        listingId: Number(listingId),
        initialMessage: messageText,
      });
      toast({ title: label("تم إرسال رسالتك", "Message envoyé", "Message sent") });
      setMsgOpen(false);
      navigate(`/messages`);
    } catch {
      toast({ title: label("خطأ", "Erreur", "Error"), variant: "destructive" });
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <Skeleton className="h-96 rounded-xl mb-6" />
        <Skeleton className="h-8 w-2/3 mb-4" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-muted-foreground text-lg">{label("الإعلان غير موجود", "Annonce introuvable", "Listing not found")}</p>
      </div>
    );
  }

  const l = listing as any;
  const title = language === "ar" ? l.titleAr : language === "fr" ? l.titleFr || l.titleAr : l.titleEn || l.titleAr;
  const description = language === "ar" ? l.descriptionAr : language === "fr" ? l.descriptionFr || l.descriptionAr : l.descriptionEn || l.descriptionAr;
  const images: string[] = l.images || [];

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Images */}
        <div className="lg:col-span-3 space-y-3">
          <div className="relative rounded-xl overflow-hidden bg-muted">
            <AspectRatio ratio={4 / 3}>
              {images[imageIdx] ? (
                <img src={images[imageIdx]} alt={title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-6xl">🛍️</div>
              )}
            </AspectRatio>
            {images.length > 1 && (
              <>
                <button
                  onClick={() => setImageIdx(i => Math.max(0, i - 1))}
                  className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/40 text-white rounded-full p-2 hover:bg-black/60"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setImageIdx(i => Math.min(images.length - 1, i + 1))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/40 text-white rounded-full p-2 hover:bg-black/60"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setImageIdx(i)}
                  className={`shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 transition-colors ${i === imageIdx ? "border-primary" : "border-transparent"}`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="lg:col-span-2 space-y-5">
          <div>
            <div className="flex items-center gap-2 mb-2">
              {l.listingType && (
                <Badge variant="secondary">
                  {l.listingType === "service" ? label("خدمة", "Service", "Service") : label("منتج", "Produit", "Product")}
                </Badge>
              )}
              {l.isFeatured && (
                <Badge className="bg-amber-500 text-white">⭐ {label("مميز", "En vedette", "Featured")}</Badge>
              )}
            </div>
            <h1 className="text-2xl font-bold">{title}</h1>
          </div>

          {l.price && (
            <p className="text-3xl font-bold text-primary">
              {Number(l.price).toLocaleString()} {label("د.ج", "DZD", "DZD")}
            </p>
          )}

          <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
            {l.wilaya && (
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {l.wilaya}{l.city ? `, ${l.city}` : ""}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              {l.viewCount || 0} {label("مشاهدة", "vues", "views")}
            </span>
            {l.reviewCount > 0 && (
              <span className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                {l.averageRating?.toFixed(1)} ({l.reviewCount})
              </span>
            )}
          </div>

          {/* Seller */}
          {l.sellerProfile && (
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center overflow-hidden shrink-0">
                  {l.sellerProfile.avatarUrl ? (
                    <img src={l.sellerProfile.avatarUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <User className="h-6 w-6 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">{l.sellerProfile.displayName || label("بائع", "Vendeur", "Seller")}</p>
                  {l.sellerProfile.wilaya && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> {l.sellerProfile.wilaya}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* CTA */}
          <Dialog open={msgOpen} onOpenChange={setMsgOpen}>
            <DialogTrigger asChild>
              <Button className="w-full gap-2" size="lg">
                <MessageCircle className="h-5 w-5" />
                {label("تواصل مع البائع", "Contacter le vendeur", "Contact Seller")}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{label("أرسل رسالة", "Envoyer un message", "Send a message")}</DialogTitle>
              </DialogHeader>
              <Textarea
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder={label("اكتب رسالتك هنا...", "Écrivez votre message...", "Write your message...")}
                rows={4}
                className={dir === "rtl" ? "text-right" : ""}
              />
              <Button onClick={handleContact} disabled={!messageText.trim() || createConv.isPending} className="w-full">
                {createConv.isPending ? label("جارٍ الإرسال...", "Envoi...", "Sending...") : label("إرسال", "Envoyer", "Send")}
              </Button>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Description */}
      {description && (
        <div className="mt-10">
          <h2 className="text-xl font-bold mb-4">{label("الوصف", "Description", "Description")}</h2>
          <p className="text-muted-foreground whitespace-pre-line leading-relaxed">{description}</p>
        </div>
      )}

      {/* Reviews */}
      {(reviews as any[])?.length > 0 && (
        <div className="mt-10">
          <h2 className="text-xl font-bold mb-6">{label("التقييمات", "Avis", "Reviews")}</h2>
          <div className="space-y-4">
            {(reviews as any[]).map((review) => (
              <Card key={review.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                        {review.reviewerProfile?.avatarUrl ? (
                          <img src={review.reviewerProfile.avatarUrl} alt="" className="w-full h-full rounded-full object-cover" />
                        ) : (
                          <User className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                      <span className="text-sm font-medium">{review.reviewerProfile?.displayName || label("مستخدم", "Utilisateur", "User")}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`h-4 w-4 ${i < review.rating ? "fill-amber-400 text-amber-400" : "text-muted"}`} />
                      ))}
                    </div>
                  </div>
                  {review.comment && <p className="text-sm text-muted-foreground">{review.comment}</p>}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
