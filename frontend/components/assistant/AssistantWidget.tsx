"use client";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { askAssistant } from "@/lib/api/ai";
import { Button, Card, Input } from "@/components/ui/UIComponents";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export function AssistantWidget() {
  const { user, loading } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const conversationIdRef = useRef<string | undefined>(undefined);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 🔑 Chargement du conversationId existant, une seule fois au montage
  useEffect(() => {
    conversationIdRef.current =
      sessionStorage.getItem("ai-conversation-id") ?? undefined;
  }, []);

  // Auto-scroll vers le dernier message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Caché pendant le chargement initial (évite un flash visible puis caché)
  if (loading) return null;
  // Caché pour les agents et admins — uniquement clients + visiteurs anonymes

  if (user && user.role !== "CLIENT") return null;

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || sending) return;

    setMessages((prev) => [...prev, { role: "user", content: trimmed }]);
    setInput("");
    setSending(true);

    try {
      const { reply, conversationId } = await askAssistant(
        trimmed,
        conversationIdRef.current,
      );
      conversationIdRef.current = conversationId;
      sessionStorage.setItem("ai-conversation-id", conversationId);
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Désolé, une erreur est survenue. Réessayez dans un instant.",
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {isOpen && (
        <Card className="flex h-[480px] w-[360px] flex-col !p-0 shadow-2xl">
          {/* En-tête */}
          <div className="flex items-center justify-between border-b px-4 py-3">
            <span className="font-serif font-bold text-foreground">
              ✨ Assistant FreeForU
            </span>
            <button
              onClick={() => setIsOpen(false)}
              className="text-muted-foreground hover:text-foreground"
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
            {messages.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Bonjour 👋 Posez-moi une question — je peux chercher un
                prestataire, comparer des tarifs, ou répondre sur nos règles
                d'annulation.
              </p>
            )}
            {messages.map((m, i) => (
              <div
                key={i}
                className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${
                  m.role === "user"
                    ? "ml-auto bg-accent text-white"
                    : "bg-muted text-foreground"
                }`}
              >
                {m.content}
              </div>
            ))}
            {sending && (
              <div className="max-w-[85%] rounded-xl bg-muted px-3 py-2 text-sm text-muted-foreground">
                En train d'écrire...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Saisie */}
          <div className="flex items-center gap-2 border-t p-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Écrivez votre message..."
              className="flex-1 rounded-lg border bg-background px-3 py-2 text-sm outline-none"
              disabled={sending}
            />
            <Button
              size="sm"
              variant="primary"
              onClick={handleSend}
              isLoading={sending}
              disabled={!input.trim()}
            >
              Envoyer
            </Button>
          </div>
        </Card>
      )}

      {/* Bouton flottant */}
      <Button
        variant="primary"
        className="!h-14 !w-14 !rounded-full !p-0 text-xl shadow-xl"
        onClick={() => setIsOpen((o) => !o)}
      >
        {isOpen ? "✕" : "💬"}
      </Button>
    </div>
  );
}
