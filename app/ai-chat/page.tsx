"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { Coffee, Plus } from "lucide-react";
import ChatWindow from "../components/ChatWindow";
import ChatInput from "../components/ChatInput";
import { api } from "@/convex/_generated/api";

export default function AiChat() {
  const messages = useQuery(api.messages.list);
  const clearMessages = useMutation(api.messages.clear);
  const sendMessage = useMutation(api.messages.send);

  const [streamingText, setStreamingText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSend = async (text: string) => {
    setIsLoading(true);
    setStreamingText("");
    setErrorMessage(null);

    try {
      // Save user message to Convex (instant reactive update)
      await sendMessage({ text, role: "user" });

      // Call the AI chat API
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
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
        setIsLoading(false); // Hide typing indicator once text starts arriving
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setErrorMessage("An unexpected error occurred. Please try again.");
    } finally {
      setStreamingText("");
      setIsLoading(false);
    }
  };

  const handleNewChat = async () => {
    await clearMessages();
  };

  return (
    <div className="flex h-screen bg-zinc-900 text-white">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 flex-col bg-zinc-950 border-r border-zinc-800">
        <div className="p-4 border-b border-zinc-800">
          <button
            onClick={handleNewChat}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors text-sm cursor-pointer"
          >
            <Plus size={16} />
            New Chat
          </button>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <Coffee size={48} className="text-amber-500 mb-4" />
          <h1 className="text-xl font-bold text-amber-500">Brew Haven</h1>
          <p className="text-sm text-zinc-500 mt-2">Your AI Coffee Assistant</p>
        </div>
        <div className="p-4 border-t border-zinc-800 text-xs text-zinc-600">
          Powered by OpenAI + Convex
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <header className="md:hidden flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-950">
          <div className="flex items-center gap-2">
            <Coffee size={24} className="text-amber-500" />
            <h1 className="font-bold text-amber-500">Brew Haven</h1>
          </div>
          <button
            onClick={handleNewChat}
            className="p-2 rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <Plus size={20} />
          </button>
        </header>

        {errorMessage && (
          <div className="mx-4 mt-3 flex items-start gap-3 rounded-lg border border-red-800 bg-red-950/60 px-4 py-3 text-sm text-red-300">
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
        <ChatWindow
          messages={messages ?? []}
          streamingText={streamingText}
          isLoading={isLoading}
          onSuggest={handleSend}
        />
        <ChatInput
          onSend={handleSend}
          disabled={isLoading || streamingText !== ""}
        />
      </main>
    </div>
  );
}
