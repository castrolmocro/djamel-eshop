import { useState } from "react";
import { useI18n } from "@/contexts/I18nContext";
import { useListConversations, useGetMessages, useSendMessage } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, MessageCircle, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function MessagesPage() {
  const { language, dir } = useI18n();
  const { user } = useAuth();
  const [activeConvId, setActiveConvId] = useState<number | null>(null);
  const [newMsg, setNewMsg] = useState("");

  const { data: conversations, isLoading: convsLoading } = useListConversations();
  const { data: messages, isLoading: msgsLoading } = useGetMessages(activeConvId ?? 0, {
    query: { enabled: activeConvId !== null },
  });
  const sendMessage = useSendMessage();

  const label = (ar: string, fr: string, en: string) =>
    language === "ar" ? ar : language === "fr" ? fr : en;

  const convs = (conversations as any[]) ?? [];
  const msgs = (messages as any[]) ?? [];
  const activeConv = convs.find((c: any) => c.id === activeConvId);

  const handleSend = async () => {
    if (!newMsg.trim() || !activeConvId) return;
    try {
      await sendMessage.mutateAsync({ conversationId: activeConvId, content: newMsg.trim() } as any);
      setNewMsg("");
    } catch {}
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-5xl">
      <h1 className="text-2xl font-bold mb-6">{label("الرسائل", "Messages", "Messages")}</h1>

      <div className="flex gap-4 h-[calc(100dvh-12rem)]">
        {/* Conversation list */}
        <div className="w-80 shrink-0 flex flex-col">
          <Card className="flex-1 overflow-hidden flex flex-col">
            <div className="p-3 border-b font-semibold text-sm text-muted-foreground">
              {convs.length} {label("محادثة", "conversation(s)", "conversation(s)")}
            </div>
            <ScrollArea className="flex-1">
              {convsLoading
                ? Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-16 m-3 rounded-lg" />)
                : convs.length === 0
                ? (
                  <div className="p-6 text-center text-muted-foreground text-sm">
                    <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    {label("لا توجد رسائل", "Aucun message", "No messages")}
                  </div>
                )
                : convs.map((conv: any) => (
                  <button
                    key={conv.id}
                    onClick={() => setActiveConvId(conv.id)}
                    className={`w-full p-4 text-start hover:bg-muted/50 transition-colors border-b last:border-0 ${activeConvId === conv.id ? "bg-primary/5 border-r-2 border-primary" : ""}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center shrink-0 overflow-hidden">
                        {conv.otherParty?.avatarUrl
                          ? <img src={conv.otherParty.avatarUrl} alt="" className="w-full h-full object-cover" />
                          : <User className="h-5 w-5 text-muted-foreground" />
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-semibold text-sm truncate">
                            {conv.otherParty?.displayName || label("مستخدم", "Utilisateur", "User")}
                          </p>
                          {conv.unreadCount > 0 && (
                            <Badge className="text-xs h-5 min-w-5 px-1.5">{conv.unreadCount}</Badge>
                          )}
                        </div>
                        {conv.lastMessage && (
                          <p className="text-xs text-muted-foreground truncate mt-0.5">{conv.lastMessage.content}</p>
                        )}
                      </div>
                    </div>
                  </button>
                ))
              }
            </ScrollArea>
          </Card>
        </div>

        {/* Chat window */}
        <Card className="flex-1 flex flex-col overflow-hidden">
          {!activeConvId ? (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-20" />
                <p>{label("اختر محادثة", "Sélectionnez une conversation", "Select a conversation")}</p>
              </div>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="p-4 border-b flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center overflow-hidden shrink-0">
                  {activeConv?.otherParty?.avatarUrl
                    ? <img src={activeConv.otherParty.avatarUrl} alt="" className="w-full h-full object-cover" />
                    : <User className="h-4 w-4 text-muted-foreground" />
                  }
                </div>
                <div>
                  <p className="font-semibold text-sm">{activeConv?.otherParty?.displayName || label("مستخدم", "Utilisateur", "User")}</p>
                  {activeConv?.listing && (
                    <p className="text-xs text-muted-foreground truncate max-w-xs">
                      {activeConv.listing.titleAr}
                    </p>
                  )}
                </div>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                {msgsLoading
                  ? Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-12 mb-3 rounded-xl" />)
                  : msgs.length === 0
                  ? <p className="text-center text-muted-foreground text-sm py-8">{label("لا توجد رسائل بعد", "Aucun message", "No messages yet")}</p>
                  : (
                    <div className="space-y-3">
                      {msgs.map((msg: any) => {
                        const isMine = msg.senderUserId === user?.id;
                        return (
                          <div key={msg.id} className={`flex ${isMine ? (dir === "rtl" ? "justify-start" : "justify-end") : (dir === "rtl" ? "justify-end" : "justify-start")}`}>
                            <div className={`max-w-xs lg:max-w-md px-4 py-2.5 rounded-2xl text-sm ${isMine ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                              {msg.content}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )
                }
              </ScrollArea>

              {/* Input */}
              <div className="p-3 border-t flex gap-2">
                <Input
                  value={newMsg}
                  onChange={e => setNewMsg(e.target.value)}
                  placeholder={label("اكتب رسالة...", "Écrire un message...", "Type a message...")}
                  className={dir === "rtl" ? "text-right" : ""}
                  onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleSend()}
                />
                <Button size="icon" onClick={handleSend} disabled={!newMsg.trim() || sendMessage.isPending}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
