"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { useConvexAuth } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuthToken } from "@convex-dev/auth/react";
import {
  Coffee,
  X,
  Send,
  Loader2,
  Sparkles,
  ChevronDown,
  RotateCcw,
  CreditCard,
  ExternalLink,
  LogIn,
} from "lucide-react";
import Link from "next/link";

/* ─── detect Stripe payment links in text ────────────────────────── */
function renderWithPaymentLinks(text: string) {
  // First, strip markdown link syntax around Stripe URLs:
  // [Any text](https://checkout.stripe.com/...) → just the URL
  const cleaned = text.replace(
    /\[([^\]]*?)\]\((https:\/\/checkout\.stripe\.com\/[^)]+)\)/g,
    "$2",
  );

  // Match Stripe checkout URLs
  const urlPattern = /https:\/\/checkout\.stripe\.com\/[^\s)]+/;
  const parts = cleaned.split(new RegExp(`(${urlPattern.source})`, "g"));

  if (parts.length === 1) {
    return <span className="whitespace-pre-wrap">{text}</span>;
  }

  return (
    <span className="whitespace-pre-wrap">
      {parts.map((part, i) =>
        urlPattern.test(part) ? (
          <a
            key={i}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => {
              e.preventDefault();
              window.open(part, "_blank", "noopener,noreferrer");
            }}
            className="mt-2 mb-1 flex items-center gap-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white px-2 sm:px-3.5 py-1.5 sm:py-2.5 text-[11px] sm:text-xs font-semibold transition-colors no-underline w-fit"
          >
            <CreditCard size={12} className="shrink-0" />
            <span className="truncate">Complete Payment</span>
            <ExternalLink size={10} className="shrink-0" />
          </a>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </span>
  );
}

/* ─── tiny inline message bubble ─────────────────────────────────── */
function Bubble({ role, text }: { role: "user" | "assistant"; text: string }) {
  if (role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] sm:max-w-[80%] rounded-2xl rounded-br-sm bg-cyan-500 px-2.5 sm:px-3.5 py-2 sm:py-2.5 text-xs sm:text-sm text-white leading-relaxed shadow-md">
          {text}
        </div>
      </div>
    );
  }
  return (
    <div className="flex items-start gap-2">
      <div className="mt-0.5 flex h-6 sm:h-7 w-6 sm:w-7 shrink-0 items-center justify-center rounded-full bg-zinc-700 shadow-inner">
        <Coffee size={12} className="text-cyan-400" />
      </div>
      <div className="max-w-[85%] sm:max-w-[80%] rounded-2xl rounded-tl-sm bg-zinc-700/80 px-2.5 sm:px-3.5 py-2 sm:py-2.5 text-xs sm:text-sm text-zinc-100 leading-relaxed shadow-md">
        {renderWithPaymentLinks(text)}
      </div>
    </div>
  );
}

/* ─── main widget ─────────────────────────────────────────────────── */
type ChatWidgetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function ChatWidget({ open, onOpenChange }: ChatWidgetProps) {
  const { isAuthenticated } = useConvexAuth();
  const authToken = useAuthToken();
  const [inputText, setInputText] = useState("");
  const [streamingText, setStreamingText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const messages = useQuery(
    api.messages.list,
    !isAuthenticated ? "skip" : undefined,
  );
  const currentUser = useQuery(
    api.users.currentUser,
    !isAuthenticated ? "skip" : {},
  );
  const clearMessages = useMutation(api.messages.clear);
  const sendMessage = useMutation(api.messages.send);

  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  /* auto-scroll */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingText, isLoading]);

  /* focus input when panel opens */
  useEffect(() => {
    if (open && !isLoading) {
      setTimeout(() => textareaRef.current?.focus(), 120);
    }
  }, [open, isLoading]);

  /* close panel when clicking outside of it */
  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node | null;
      if (!target) return;
      if (panelRef.current?.contains(target)) return;
      onOpenChange(false);
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
    };
  }, [open, onOpenChange]);

  const handleSend = async () => {
    const text = inputText.trim();
    if (!text || isLoading) return;
    setInputText("");
    resetTextareaHeight();
    setIsLoading(true);
    setStreamingText("");
    setErrorMsg(null);

    try {
      await sendMessage({ text, role: "user" });
      if (!authToken) {
        setErrorMsg("Your session has expired. Please sign in again.");
        return;
      }

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ message: text }),
      });

      if (!response.ok) {
        const errText = await response.text();
        setErrorMsg(errText || "Failed to get a response. Please try again.");
        return;
      }

      const reader = response.body?.getReader();
      if (!reader) return;
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        setStreamingText(accumulated);
        setIsLoading(false);
      }

      // Save assistant response via authenticated mutation
      if (accumulated.trim()) {
        await sendMessage({ text: accumulated, role: "assistant" });
      }
    } catch {
      setErrorMsg("An unexpected error occurred. Please try again.");
    } finally {
      setStreamingText("");
      setIsLoading(false);
    }
  };

  const resetTextareaHeight = () => {
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
    const el = e.target;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  };

  const isEmpty = !messages?.length && !streamingText && !isLoading;
  const isOwner = currentUser?.role === "owner";

  if (isOwner) {
    return null;
  }

  return (
    <>
      {/* ── CHAT PANEL ──────────────────────────────────────────── */}
      <div
        ref={panelRef}
        className={`fixed bottom-24 right-4 z-50 flex flex-col w-full sm:w-96 md:w-[28rem] max-w-[calc(100vw-2rem)] rounded-2xl border border-zinc-700/60 bg-zinc-900 shadow-2xl shadow-black/50 transition-all duration-300 ease-out origin-bottom-right ${
          open
            ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
            : "opacity-0 scale-95 translate-y-4 pointer-events-none"
        }`}
        style={{ height: "clamp(400px, 80vh, 620px)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-3 sm:px-4 py-3 border-b border-zinc-800 bg-zinc-950 rounded-t-2xl shrink-0">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-linear-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/25 shrink-0">
              <Coffee size={15} className="text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-semibold text-zinc-100 leading-none truncate">
                Brew Haven
              </p>
              <p className="text-[10px] sm:text-[11px] text-zinc-500 mt-0.5 flex items-center gap-1 truncate">
                <Sparkles size={9} className="text-cyan-500/70 shrink-0" />
                <span className="truncate">AI Barista</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-0.5">
            <button
              onClick={() => {
                if (isAuthenticated) {
                  void clearMessages();
                }
              }}
              title="New chat"
              disabled={!isAuthenticated}
              className="p-2 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-zinc-500"
            >
              <RotateCcw size={15} />
            </button>
            <button
              onClick={() => onOpenChange(false)}
              className="p-2 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors"
              title="Close chat"
            >
              <ChevronDown size={15} />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-3 space-y-3 min-h-0">
          {!isAuthenticated ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-3 m-0">
              <div className="flex h-12 sm:h-14 w-12 sm:w-14 items-center justify-center rounded-2xl bg-linear-to-br from-cyan-500/20 to-blue-600/10 border border-cyan-500/20 shrink-0">
                <LogIn size={20} className="text-cyan-400" />
              </div>
              <div className="px-2">
                <p className="font-medium text-zinc-200 text-xs sm:text-sm">
                  Sign in to Chat
                </p>
                <p className="text-[11px] sm:text-xs text-zinc-500 mt-1 max-w-xs leading-relaxed">
                  Log in to chat with our AI barista, browse the menu, and place
                  orders for pickup.
                </p>
              </div>
              <Link
                href="/signin"
                className="mt-2 flex items-center gap-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white px-3 sm:px-4 py-2 sm:py-2.5 text-[11px] sm:text-xs font-semibold transition-colors"
              >
                <LogIn size={13} className="shrink-0" />
                Sign In
              </Link>
            </div>
          ) : isEmpty ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-3 m-0 px-2">
              <div className="flex h-12 sm:h-14 w-12 sm:w-14 items-center justify-center rounded-2xl bg-linear-to-br from-cyan-500/20 to-blue-600/10 border border-cyan-500/20 shrink-0">
                <Coffee size={20} className="text-cyan-400" />
              </div>
              <div>
                <p className="font-medium text-zinc-200 text-xs sm:text-sm">
                  Hey there! ☕
                </p>
                <p className="text-[11px] sm:text-xs text-zinc-500 mt-1 max-w-xs leading-relaxed">
                  Ask me about our menu, hours, Wi-Fi, or anything about Brew
                  Haven!
                </p>
              </div>
              <div className="flex flex-col gap-1.5 w-full mt-1">
                {[
                  "What's on the menu?",
                  "What are your hours?",
                  "Do you have WiFi?",
                ].map((q) => (
                  <button
                    key={q}
                    onClick={() => {
                      setInputText(q);
                      setTimeout(() => textareaRef.current?.focus(), 0);
                    }}
                    className="w-full text-left px-2 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-[11px] sm:text-xs text-zinc-400 hover:text-zinc-200 border border-zinc-700 hover:border-zinc-600 transition-all"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages?.map((msg) => (
                <Bubble
                  key={msg._id}
                  role={msg.role as "user" | "assistant"}
                  text={msg.text}
                />
              ))}
              {streamingText && (
                <Bubble role="assistant" text={streamingText} />
              )}
              {isLoading && !streamingText && (
                <div className="flex items-start gap-2">
                  <div className="mt-0.5 flex h-6 sm:h-7 w-6 sm:w-7 shrink-0 items-center justify-center rounded-full bg-zinc-700">
                    <Coffee size={12} className="text-cyan-400" />
                  </div>
                  <div className="rounded-2xl rounded-tl-sm bg-zinc-700/80 px-2.5 sm:px-3.5 py-2 sm:py-3 flex items-center gap-1.5">
                    <span className="h-1 sm:h-1.5 w-1 sm:w-1.5 rounded-full bg-zinc-400 animate-bounce [animation-delay:-0.3s]" />
                    <span className="h-1 sm:h-1.5 w-1 sm:w-1.5 rounded-full bg-zinc-400 animate-bounce [animation-delay:-0.15s]" />
                    <span className="h-1 sm:h-1.5 w-1 sm:w-1.5 rounded-full bg-zinc-400 animate-bounce" />
                  </div>
                </div>
              )}
            </>
          )}

          {/* error banner */}
          {errorMsg && (
            <div className="flex items-start gap-2 rounded-xl border border-red-800 bg-red-950/60 px-2 sm:px-3 py-2 sm:py-2.5 text-[11px] sm:text-xs text-red-300">
              <span className="shrink-0 mt-0.5 text-sm">⚠️</span>
              <span className="flex-1 text-[10px] sm:text-[11px]">{errorMsg}</span>
              <button
                onClick={() => setErrorMsg(null)}
                className="shrink-0 text-red-500 hover:text-red-300 p-1"
              >
                <X size={12} />
              </button>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="px-3 sm:px-4 py-3 border-t border-zinc-800 shrink-0">
          <div className="flex items-end gap-2 bg-zinc-800 rounded-xl border border-zinc-700 focus-within:border-cyan-500/50 focus-within:ring-1 focus-within:ring-cyan-500/20 transition-all px-2.5 sm:px-3 py-2">
            <textarea
              ref={textareaRef}
              value={inputText}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              placeholder={
                isAuthenticated ? "Ask me anything…" : "Sign in to chat"
              }
              disabled={isLoading || !isAuthenticated}
              rows={1}
              className="flex-1 resize-none bg-transparent text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none disabled:opacity-50 max-h-30"
            />
            <button
              onClick={handleSend}
              disabled={!inputText.trim() || isLoading || !isAuthenticated}
              className="mb-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-cyan-500 text-white disabled:opacity-30 hover:bg-cyan-400 transition-colors"
              title="Send message"
            >
              {isLoading ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <Send size={13} />
              )}
            </button>
          </div>
          <p className="text-center text-[9px] sm:text-[10px] text-zinc-600 mt-1.5">
            Powered by OpenAI · Brew Haven AI
          </p>
        </div>
      </div>

      {/* ── FLOATING BUTTON ─────────────────────────────────────── */}
      <button
        onClick={() => onOpenChange(!open)}
        aria-label={open ? "Close chat" : "Open AI chat"}
        className={`fixed bottom-4 right-4 z-50 flex h-12 sm:h-14 w-12 sm:w-14 items-center justify-center rounded-full shadow-2xl shadow-cyan-500/25 transition-all duration-300 hover:scale-110 active:scale-95 ${
          open
            ? "bg-zinc-800 border border-zinc-700 rotate-0"
            : "bg-linear-to-br from-cyan-500 to-blue-600 border-0"
        }`}
      >
        <span
          className={`transition-all duration-300 ${open ? "rotate-0 scale-100" : "rotate-0 scale-100"}`}
        >
          {open ? (
            <X size={18} className="text-zinc-300 sm:w-[22px] sm:h-[22px]" />
          ) : (
            <Coffee size={18} className="text-white sm:w-[22px] sm:h-[22px]" />
          )}
        </span>
        {/* unread dot — shown when panel is closed and there are messages */}
        {!open && !!messages?.length && (
          <span className="absolute -top-0.5 -right-0.5 h-3 w-3 sm:h-3.5 sm:w-3.5 rounded-full bg-cyan-400 border-2 border-zinc-950" />
        )}
      </button>
    </>
  );
}
