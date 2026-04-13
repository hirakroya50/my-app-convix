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
            className="mt-2 mb-1 flex items-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-white px-3.5 py-2.5 text-xs font-semibold transition-colors no-underline w-fit"
          >
            <CreditCard size={14} />
            Complete Payment
            <ExternalLink size={11} />
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
        <div className="max-w-[80%] rounded-2xl rounded-br-sm bg-amber-500 px-3.5 py-2.5 text-sm text-white leading-relaxed shadow-md">
          {text}
        </div>
      </div>
    );
  }
  return (
    <div className="flex items-start gap-2.5">
      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-zinc-700 shadow-inner">
        <Coffee size={13} className="text-amber-400" />
      </div>
      <div className="max-w-[80%] rounded-2xl rounded-tl-sm bg-zinc-700/80 px-3.5 py-2.5 text-sm text-zinc-100 leading-relaxed shadow-md">
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
        className={`fixed bottom-24 right-5 z-50 flex flex-col w-92.5 max-w-[calc(100vw-2.5rem)] rounded-2xl border border-zinc-700/60 bg-zinc-900 shadow-2xl shadow-black/50 transition-all duration-300 ease-out origin-bottom-right ${
          open
            ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
            : "opacity-0 scale-95 translate-y-4 pointer-events-none"
        }`}
        style={{ height: "620px" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-zinc-950 rounded-t-2xl shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-linear-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/30">
              <Coffee size={15} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-zinc-100 leading-none">
                Brew Haven
              </p>
              <p className="text-[11px] text-zinc-500 mt-0.5 flex items-center gap-1">
                <Sparkles size={9} className="text-amber-500/70" />
                AI Barista
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                if (isAuthenticated) {
                  void clearMessages();
                }
              }}
              title="New chat"
              disabled={!isAuthenticated}
              className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-zinc-500"
            >
              <RotateCcw size={15} />
            </button>
            <button
              onClick={() => onOpenChange(false)}
              className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors"
            >
              <ChevronDown size={15} />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-0">
          {!isAuthenticated ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-3 m-0">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br from-amber-500/20 to-orange-600/10 border border-amber-500/20">
                <LogIn size={24} className="text-amber-400" />
              </div>
              <div>
                <p className="font-medium text-zinc-200 text-sm">
                  Sign in to Chat
                </p>
                <p className="text-xs text-zinc-500 mt-1 max-w-55 leading-relaxed">
                  Log in to chat with our AI barista, browse the menu, and place
                  orders for pickup.
                </p>
              </div>
              <Link
                href="/signin"
                className="mt-2 flex items-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-white px-4 py-2.5 text-xs font-semibold transition-colors"
              >
                <LogIn size={14} />
                Sign In
              </Link>
            </div>
          ) : isEmpty ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-3 m-0">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br from-amber-500/20 to-orange-600/10 border border-amber-500/20">
                <Coffee size={24} className="text-amber-400" />
              </div>
              <div>
                <p className="font-medium text-zinc-200 text-sm">
                  Hey there! ☕
                </p>
                <p className="text-xs text-zinc-500 mt-1 max-w-55 leading-relaxed">
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
                    className="w-full text-left px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-400 hover:text-zinc-200 border border-zinc-700 hover:border-zinc-600 transition-all"
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
                <div className="flex items-start gap-2.5">
                  <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-zinc-700">
                    <Coffee size={13} className="text-amber-400" />
                  </div>
                  <div className="rounded-2xl rounded-tl-sm bg-zinc-700/80 px-3.5 py-3 flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-zinc-400 animate-bounce [animation-delay:-0.3s]" />
                    <span className="h-1.5 w-1.5 rounded-full bg-zinc-400 animate-bounce [animation-delay:-0.15s]" />
                    <span className="h-1.5 w-1.5 rounded-full bg-zinc-400 animate-bounce" />
                  </div>
                </div>
              )}
            </>
          )}

          {/* error banner */}
          {errorMsg && (
            <div className="flex items-start gap-2 rounded-xl border border-red-800 bg-red-950/60 px-3 py-2.5 text-xs text-red-300">
              <span className="shrink-0 mt-0.5">⚠️</span>
              <span className="flex-1">{errorMsg}</span>
              <button
                onClick={() => setErrorMsg(null)}
                className="shrink-0 text-red-500 hover:text-red-300"
              >
                <X size={12} />
              </button>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="px-3 py-3 border-t border-zinc-800 shrink-0">
          <div className="flex items-end gap-2 bg-zinc-800 rounded-xl border border-zinc-700 focus-within:border-amber-500/50 focus-within:ring-1 focus-within:ring-amber-500/20 transition-all px-3 py-2">
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
              className="flex-1 resize-none bg-transparent text-sm text-white placeholder-zinc-500 focus:outline-none disabled:opacity-50 max-h-30"
            />
            <button
              onClick={handleSend}
              disabled={!inputText.trim() || isLoading || !isAuthenticated}
              className="mb-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-500 text-white disabled:opacity-30 hover:bg-amber-400 transition-colors"
            >
              {isLoading ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <Send size={13} />
              )}
            </button>
          </div>
          <p className="text-center text-[10px] text-zinc-600 mt-1.5">
            Powered by OpenAI · Brew Haven AI
          </p>
        </div>
      </div>

      {/* ── FLOATING BUTTON ─────────────────────────────────────── */}
      <button
        onClick={() => onOpenChange(!open)}
        aria-label={open ? "Close chat" : "Open AI chat"}
        className={`fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-2xl shadow-amber-500/30 transition-all duration-300 hover:scale-110 active:scale-95 ${
          open
            ? "bg-zinc-800 border border-zinc-700 rotate-0"
            : "bg-linear-to-br from-amber-500 to-orange-600 border-0"
        }`}
      >
        <span
          className={`transition-all duration-300 ${open ? "rotate-0 scale-100" : "rotate-0 scale-100"}`}
        >
          {open ? (
            <X size={22} className="text-zinc-300" />
          ) : (
            <Coffee size={22} className="text-white" />
          )}
        </span>
        {/* unread dot — shown when panel is closed and there are messages */}
        {!open && !!messages?.length && (
          <span className="absolute -top-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-amber-400 border-2 border-zinc-950" />
        )}
      </button>
    </>
  );
}
