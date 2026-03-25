type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

const OPENAI_CHAT_URL = "https://api.openai.com/v1/chat/completions";
const MAX_MESSAGES = 12;
const MAX_MESSAGE_CHARS = 4000;
const MAX_OUTPUT_TOKENS = 300;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isValidMessage(message: unknown): message is ChatMessage {
  if (!message || typeof message !== "object") return false;
  const maybeMessage = message as { role?: unknown; content?: unknown };
  const validRole =
    maybeMessage.role === "system" ||
    maybeMessage.role === "user" ||
    maybeMessage.role === "assistant";

  return validRole && typeof maybeMessage.content === "string";
}

function normalizeMessages(messages: ChatMessage[]) {
  return messages.slice(-MAX_MESSAGES).map((message) => ({
    role: message.role,
    content: message.content.slice(0, MAX_MESSAGE_CHARS),
  }));
}

async function parseApiResponse(response: Response) {
  const text = await response.text();
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return { raw: text } as unknown;
  }
}

async function callOpenAIWithRetry(options: {
  apiKey: string;
  model: string;
  messages: ChatMessage[];
}) {
  const maxAttempts = 3;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const response = await fetch(OPENAI_CHAT_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${options.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: options.model,
        messages: options.messages,
        max_tokens: MAX_OUTPUT_TOKENS,
      }),
    });

    const data = await parseApiResponse(response);

    if (response.ok) {
      return { response, data };
    }

    const shouldRetry = response.status === 429 || response.status >= 500;
    if (!shouldRetry || attempt === maxAttempts) {
      return { response, data };
    }

    const retryAfterHeader = response.headers.get("retry-after");
    const retryAfterMs = retryAfterHeader
      ? Number.parseInt(retryAfterHeader, 10) * 1000
      : 600 * attempt;

    await sleep(Number.isFinite(retryAfterMs) ? retryAfterMs : 600 * attempt);
  }

  return null;
}

export async function POST(req: Request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

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

    const requestMessages = normalizeMessages(messages);

    const result = await callOpenAIWithRetry({
      apiKey,
      model,
      messages: requestMessages,
    });

    if (!result) {
      return Response.json(
        { error: "Failed to call OpenAI. Please try again." },
        { status: 502 },
      );
    }

    const { response, data } = result;

    if (!response.ok) {
      const apiError = data as {
        error?: { message?: string; code?: string; type?: string };
      };

      if (
        response.status === 429 &&
        (apiError.error?.code === "insufficient_quota" ||
          apiError.error?.type === "insufficient_quota")
      ) {
        return Response.json(
          {
            error:
              "OpenAI API quota is exceeded. Add billing/credits to continue.",
          },
          { status: 429 },
        );
      }

      return Response.json(
        {
          error:
            apiError.error?.message ??
            "OpenAI request failed. Please try again.",
        },
        { status: response.status },
      );
    }

    const successData = data as {
      choices?: Array<{ message?: { content?: unknown } }>;
    };
    const reply = successData?.choices?.[0]?.message?.content;

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
