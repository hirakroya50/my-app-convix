"use client";

import { useRef, useEffect } from "react";
import { Coffee, User, Loader2 } from "lucide-react";

interface Message {
  _id: string;
  text: string;
  role: "user" | "assistant";
  timestamp: number;
}

interface ChatWindowProps {
  messages: Message[];
  streamingText: string;
  isLoading: boolean;
  onSuggest?: (text: string) => void;
}

const SUGGESTIONS = [
  "What's on the menu?",
  "What are your hours?",
  "Do you have WiFi?",
];

export default function ChatWindow({
  messages,
  streamingText,
  isLoading,
  onSuggest,
}: ChatWindowProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingText, isLoading]);

  // Empty state / welcome screen
  if (messages.length === 0 && !streamingText && !isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <Coffee size={64} className="text-amber-500/50 mb-6" />
        <h2 className="text-2xl font-semibold text-zinc-300">
          Welcome to Brew Haven
        </h2>
        <p className="text-zinc-500 mt-2 max-w-md">
          Ask me about our menu, opening hours, services, or anything else about
          our coffee shop!
        </p>
        <div className="flex flex-wrap gap-2 mt-6 justify-center">
          {SUGGESTIONS.map((q) => (
            <button
              key={q}
              onClick={() => onSuggest?.(q)}
              className="px-4 py-2 bg-zinc-800 rounded-full text-sm text-zinc-400 border border-zinc-700 hover:border-amber-500/50 hover:text-amber-400 transition-colors cursor-pointer"
            >
              {q}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((msg) => (
        <MessageBubble key={msg._id} role={msg.role} text={msg.text} />
      ))}

      {/* Streaming assistant message */}
      {streamingText && (
        <MessageBubble role="assistant" text={streamingText} />
      )}

      {/* Typing indicator */}
      {isLoading && !streamingText && (
        <div className="flex items-start gap-3 max-w-3xl mx-auto">
          <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0">
            <Coffee size={16} className="text-amber-500" />
          </div>
          <div className="flex items-center gap-2 py-2 px-3 rounded-2xl bg-zinc-800 text-zinc-400">
            <Loader2 size={16} className="animate-spin" />
            <span className="text-sm">Brewing a response...</span>
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}

function MessageBubble({
  role,
  text,
}: {
  role: "user" | "assistant";
  text: string;
}) {
  const isUser = role === "user";

  return (
    <div
      className={`flex items-start gap-3 max-w-3xl mx-auto ${isUser ? "flex-row-reverse" : ""}`}
    >
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
          isUser ? "bg-blue-500/20" : "bg-amber-500/20"
        }`}
      >
        {isUser ? (
          <User size={16} className="text-blue-400" />
        ) : (
          <Coffee size={16} className="text-amber-500" />
        )}
      </div>
      <div
        className={`rounded-2xl px-4 py-2.5 max-w-[80%] ${
          isUser ? "bg-blue-600 text-white" : "bg-zinc-800 text-zinc-100"
        }`}
      >
        <p className="text-sm whitespace-pre-wrap leading-relaxed">{text}</p>
      </div>
    </div>
  );
}
