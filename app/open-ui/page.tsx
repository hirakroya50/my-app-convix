"use client";
import { useEffect, useRef, useState } from "react";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export default function Home() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const sendMessage = async () => {
    const trimmedInput = input.trim();
    if (!trimmedInput || isLoading) return;

    setError("");

    const userMessage: ChatMessage = { role: "user", content: trimmedInput };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messages: newMessages }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error ?? "Something went wrong.");
      }

      if (typeof data?.reply !== "string") {
        throw new Error("Invalid response from server.");
      }

      setMessages([...newMessages, { role: "assistant", content: data.reply }]);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to send message.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const onInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      void sendMessage();
    }
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-3xl flex-col p-4">
      <h1 className="mb-4 text-2xl font-semibold">OpenAI Chat</h1>

      <div className="h-[65vh] flex-1 overflow-y-auto rounded-md border bg-white p-4">
        {messages.length === 0 ? (
          <p className="text-sm text-gray-500">Start chatting below.</p>
        ) : (
          messages.map((message, index) => (
            <div
              key={`${message.role}-${index}`}
              className={`mb-3 flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${
                  message.role === "user"
                    ? "bg-black text-white"
                    : "border bg-gray-100 text-gray-900"
                }`}
              >
                {message.content}
              </div>
            </div>
          ))
        )}

        {isLoading ? (
          <p className="text-sm text-gray-500">Assistant is typing...</p>
        ) : null}

        <div ref={endOfMessagesRef} />
      </div>

      {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}

      <div className="mt-3 flex gap-2">
        <input
          className="w-full rounded-md border p-2"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onInputKeyDown}
          placeholder="Type your message..."
          disabled={isLoading}
        />

        <button
          onClick={() => void sendMessage()}
          className="rounded-md bg-black px-4 py-2 text-white disabled:opacity-50"
          disabled={isLoading || input.trim().length === 0}
        >
          Send
        </button>
      </div>
    </div>
  );
}
