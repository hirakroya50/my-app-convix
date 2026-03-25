"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import {
  Plus,
  Send,
  Loader2,
  Sparkles,
  Trash2,
  MessageSquare,
  PanelLeftClose,
  PanelLeft,
  ArrowLeft,
  Bot,
  User,
  ArrowDown,
} from "lucide-react";
import Link from "next/link";
import MarkdownRenderer from "../components/ai-chat/MarkdownRenderer";

/* ─── Types ──────────────────────────────────────────────────────── */
type ConversationId = Id<"aiChatConversations">;

/* ─── Sidebar ────────────────────────────────────────────────────── */
function Sidebar({
  activeId,
  onSelect,
  onNew,
  collapsed,
  onToggle,
}: {
  activeId: ConversationId | null;
  onSelect: (id: ConversationId) => void;
  onNew: () => void;
  collapsed: boolean;
  onToggle: () => void;
}) {
  const conversations = useQuery(api.aiChat.listConversations);
  const deleteConversation = useMutation(api.aiChat.deleteConversation);

  return (
    <aside
      className={`hidden md:flex flex-col bg-zinc-950 border-r border-zinc-800 transition-all duration-300 shrink-0 ${
        collapsed ? "w-0 overflow-hidden border-r-0" : "w-72"
      }`}
    >
      {/* Top */}
      <div className="p-3 border-b border-zinc-800 space-y-2 shrink-0">
        <div className="flex items-center gap-2">
          <button
            onClick={onToggle}
            className="p-2 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
            title="Toggle sidebar"
          >
            <PanelLeftClose size={18} />
          </button>
          <button
            onClick={onNew}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors text-sm text-zinc-200 cursor-pointer border border-zinc-700"
          >
            <Plus size={16} />
            New Chat
          </button>
        </div>
        <Link
          href="/"
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 transition-colors"
        >
          <ArrowLeft size={13} />
          Back to Home
        </Link>
      </div>

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5">
        {conversations === undefined ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 size={18} className="animate-spin text-zinc-600" />
          </div>
        ) : conversations.length === 0 ? (
          <p className="text-xs text-zinc-600 text-center py-8">
            No conversations yet
          </p>
        ) : (
          conversations.map((c) => (
            <div
              key={c._id}
              className={`group flex items-center gap-2 rounded-lg px-3 py-2.5 cursor-pointer transition-colors ${
                activeId === c._id
                  ? "bg-zinc-800 text-zinc-100"
                  : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200"
              }`}
              onClick={() => onSelect(c._id)}
            >
              <MessageSquare size={14} className="shrink-0 opacity-60" />
              <span className="flex-1 text-sm truncate">{c.title}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteConversation({ id: c._id });
                  if (activeId === c._id) onNew();
                }}
                className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-zinc-700 text-zinc-500 hover:text-red-400 transition-all"
                title="Delete"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-zinc-800 text-[10px] text-zinc-600 flex items-center gap-1.5">
        <Sparkles size={10} className="text-violet-500/50" />
        Powered by GPT-4o mini + Convex
      </div>
    </aside>
  );
}

/* ─── Empty state ────────────────────────────────────────────────── */
function EmptyState({ onSuggest }: { onSuggest: (q: string) => void }) {
  const suggestions = [
    "Explain quantum computing in simple terms",
    "Write a Python function to find prime numbers",
    "What are the key differences between React and Vue?",
    "Help me write a professional email",
  ];

  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-4 max-w-2xl mx-auto">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500/20 to-indigo-500/10 border border-violet-500/20 mb-5">
        <Bot size={28} className="text-violet-400" />
      </div>
      <h2 className="text-xl font-semibold text-zinc-100 mb-2">
        How can I help you today?
      </h2>
      <p className="text-sm text-zinc-500 mb-8 max-w-md">
        I&apos;m a general-purpose AI assistant. Ask me anything — coding,
        writing, analysis, math, or just a conversation.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
        {suggestions.map((q) => (
          <button
            key={q}
            onClick={() => onSuggest(q)}
            className="text-left px-4 py-3 rounded-xl bg-zinc-800/60 hover:bg-zinc-800 border border-zinc-700/60 hover:border-zinc-600 text-sm text-zinc-300 hover:text-zinc-100 transition-all leading-snug"
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ─── Message bubble ─────────────────────────────────────────────── */
function MessageBubble({
  role,
  text,
  isStreaming,
}: {
  role: "user" | "assistant";
  text: string;
  isStreaming?: boolean;
}) {
  if (role === "user") {
    return (
      <div className="flex gap-3 justify-end">
        <div className="max-w-[75%] rounded-2xl rounded-br-sm bg-violet-600 px-4 py-3 text-sm text-white leading-relaxed shadow-lg shadow-violet-500/10">
          {text}
        </div>
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-600/20 border border-violet-500/30 mt-0.5">
          <User size={14} className="text-violet-400" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-800 border border-zinc-700 mt-0.5">
        <Bot size={14} className="text-emerald-400" />
      </div>
      <div className="max-w-[85%] min-w-0 rounded-2xl rounded-tl-sm bg-zinc-800/60 border border-zinc-700/40 px-4 py-3 text-sm text-zinc-200 leading-relaxed shadow-lg">
        <MarkdownRenderer content={text} />
        {isStreaming && (
          <span className="inline-block w-2 h-4 ml-0.5 bg-emerald-400/80 animate-pulse rounded-sm" />
        )}
      </div>
    </div>
  );
}

/* ─── Typing indicator ───────────────────────────────────────────── */
function TypingIndicator() {
  return (
    <div className="flex gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-800 border border-zinc-700">
        <Bot size={14} className="text-emerald-400" />
      </div>
      <div className="rounded-2xl rounded-tl-sm bg-zinc-800/60 border border-zinc-700/40 px-4 py-3 flex items-center gap-1.5">
        <span className="h-2 w-2 rounded-full bg-zinc-400 animate-bounce [animation-delay:-0.3s]" />
        <span className="h-2 w-2 rounded-full bg-zinc-400 animate-bounce [animation-delay:-0.15s]" />
        <span className="h-2 w-2 rounded-full bg-zinc-400 animate-bounce" />
      </div>
    </div>
  );
}

/* ─── Chat input ─────────────────────────────────────────────────── */
function AIChatInput({
  onSend,
  disabled,
}: {
  onSend: (text: string) => void;
  disabled: boolean;
}) {
  const [text, setText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = useCallback(() => {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setText("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  }, [text, disabled, onSend]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    const el = e.target;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  };

  useEffect(() => {
    if (!disabled) textareaRef.current?.focus();
  }, [disabled]);

  return (
    <div className="shrink-0 border-t border-zinc-800 bg-zinc-900/80 backdrop-blur-sm px-4 py-3">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-end gap-3 bg-zinc-800/80 rounded-2xl border border-zinc-700 focus-within:border-violet-500/50 focus-within:ring-1 focus-within:ring-violet-500/20 transition-all px-4 py-3">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder="Message AI assistant…"
            disabled={disabled}
            rows={1}
            className="flex-1 resize-none bg-transparent text-sm text-white placeholder-zinc-500 focus:outline-none disabled:opacity-50 max-h-[200px] leading-relaxed"
          />
          <button
            onClick={handleSend}
            disabled={!text.trim() || disabled}
            className="mb-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-violet-600 text-white disabled:opacity-30 hover:bg-violet-500 transition-colors"
          >
            {disabled ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <Send size={15} />
            )}
          </button>
        </div>
        <p className="text-center text-[10px] text-zinc-600 mt-2">
          AI can make mistakes. Verify important information.
        </p>
      </div>
    </div>
  );
}

/* ─── Main page ──────────────────────────────────────────────────── */
export default function AiChatPage() {
  const [activeConversationId, setActiveConversationId] =
    useState<ConversationId | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);

  const messages = useQuery(
    api.aiChat.listMessages,
    activeConversationId ? { conversationId: activeConversationId } : "skip",
  );
  const createConversation = useMutation(api.aiChat.createConversation);
  const sendMessageMutation = useMutation(api.aiChat.sendMessage);

  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingText, isLoading]);

  // Detect if user has scrolled away from bottom
  const handleScroll = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    setShowScrollButton(distFromBottom > 100);
  }, []);

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleNewChat = () => {
    setActiveConversationId(null);
    setStreamingText("");
    setIsLoading(false);
    setErrorMessage(null);
  };

  const handleSend = async (text: string) => {
    setIsLoading(true);
    setStreamingText("");
    setErrorMessage(null);

    try {
      // Create a conversation if we don't have one
      let convId = activeConversationId;
      if (!convId) {
        const title =
          text.length > 50 ? text.substring(0, 50) + "\u2026" : text;
        convId = await createConversation({ title });
        setActiveConversationId(convId);
      }

      // Save user message to Convex
      await sendMessageMutation({
        conversationId: convId,
        text,
        role: "user",
      });

      // Call the AI chat API
      const response = await fetch("/api/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, conversationId: convId }),
      });

      if (!response.ok) {
        const errText = await response.text();
        setErrorMessage(
          errText || "Failed to get a response. Please try again.",
        );
        return;
      }

      // Read the streaming response
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
    } catch (error) {
      console.error("Error sending message:", error);
      setErrorMessage("An unexpected error occurred. Please try again.");
    } finally {
      setStreamingText("");
      setIsLoading(false);
    }
  };

  const hasMessages =
    (messages && messages.length > 0) || streamingText || isLoading;

  return (
    <div className="flex h-screen bg-zinc-900 text-white overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        activeId={activeConversationId}
        onSelect={setActiveConversationId}
        onNew={handleNewChat}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((v) => !v)}
      />

      {/* Main area */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="flex items-center gap-3 px-4 py-3 border-b border-zinc-800 bg-zinc-900/90 backdrop-blur-sm shrink-0">
          {sidebarCollapsed && (
            <button
              onClick={() => setSidebarCollapsed(false)}
              className="p-2 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
              title="Open sidebar"
            >
              <PanelLeft size={18} />
            </button>
          )}
          <div className="flex items-center gap-2">
            <Bot size={18} className="text-violet-400" />
            <span className="text-sm font-medium text-zinc-200">
              AI Assistant
            </span>
          </div>
          <div className="flex-1" />
          <Link
            href="/"
            className="md:hidden flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            <ArrowLeft size={14} />
            Home
          </Link>
          <button
            onClick={handleNewChat}
            className="md:hidden p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            <Plus size={18} />
          </button>
          <div className="flex items-center gap-1.5 text-[11px] text-zinc-500">
            <Sparkles size={11} className="text-violet-400/60" />
            GPT-4o mini
          </div>
        </header>

        {/* Error banner */}
        {errorMessage && (
          <div className="mx-4 mt-3 flex items-start gap-3 rounded-xl border border-red-800 bg-red-950/60 px-4 py-3 text-sm text-red-300 shrink-0">
            <span className="mt-0.5 shrink-0">⚠️</span>
            <span className="flex-1">{errorMessage}</span>
            <button
              onClick={() => setErrorMessage(null)}
              className="shrink-0 text-red-500 hover:text-red-300 transition-colors"
              aria-label="Dismiss"
            >
              ✕
            </button>
          </div>
        )}

        {/* Messages area */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto relative"
        >
          {!hasMessages ? (
            <EmptyState onSuggest={handleSend} />
          ) : (
            <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
              {messages?.map((msg) => (
                <MessageBubble
                  key={msg._id}
                  role={msg.role as "user" | "assistant"}
                  text={msg.text}
                />
              ))}
              {streamingText && (
                <MessageBubble
                  role="assistant"
                  text={streamingText}
                  isStreaming
                />
              )}
              {isLoading && !streamingText && <TypingIndicator />}
              <div ref={bottomRef} />
            </div>
          )}

          {/* Scroll to bottom button */}
          {showScrollButton && hasMessages && (
            <button
              onClick={scrollToBottom}
              className="fixed bottom-24 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-700/90 border border-zinc-600 text-xs text-zinc-300 hover:bg-zinc-600 transition-colors shadow-lg backdrop-blur-sm z-10"
            >
              <ArrowDown size={13} />
              Scroll to bottom
            </button>
          )}
        </div>

        {/* Input */}
        <AIChatInput
          onSend={handleSend}
          disabled={isLoading || streamingText !== ""}
        />
      </main>
    </div>
  );
}
