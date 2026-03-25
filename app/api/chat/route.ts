type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

function isValidMessage(message: unknown): message is ChatMessage {
  if (!message || typeof message !== "object") return false;
  const maybeMessage = message as { role?: unknown; content?: unknown };
  const validRole =
    maybeMessage.role === "system" ||
    maybeMessage.role === "user" ||
    maybeMessage.role === "assistant";

  return validRole && typeof maybeMessage.content === "string";
}

export async function POST(req: Request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return Response.json(
        { error: "Missing OPENAI_API_KEY on server." },
        { status: 500 },
      );
    }

    const body = await req.json();
    const messages = body?.messages;

    if (!Array.isArray(messages) || !messages.every(isValidMessage)) {
      return Response.json(
        { error: "Invalid payload. Expected { messages: ChatMessage[] }" },
        { status: 400 },
      );
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return Response.json(
        {
          error:
            data?.error?.message ?? "OpenAI request failed. Please try again.",
        },
        { status: response.status },
      );
    }

    const reply = data?.choices?.[0]?.message?.content;
    if (typeof reply !== "string") {
      return Response.json(
        { error: "OpenAI returned an unexpected response shape." },
        { status: 502 },
      );
    }

    return Response.json({ reply });
  } catch {
    return Response.json(
      { error: "Failed to process chat request." },
      { status: 500 },
    );
  }
}
