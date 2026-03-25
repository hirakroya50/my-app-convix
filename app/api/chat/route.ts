import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../convex/_generated/api";
import { openai, SYSTEM_PROMPT } from "../../lib/openai";
import { tools, executeTool } from "../../lib/mcp";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    if (!message || typeof message !== "string") {
      return new Response("Message is required", { status: 400 });
    }

    // Get conversation history from Convex
    const history = await convex.query(api.messages.list);
    const chatMessages: Array<{
      role: "user" | "assistant";
      content: string;
    }> = history.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.text,
    }));

    // Ensure the current user message is included
    const lastMsg = chatMessages[chatMessages.length - 1];
    if (!lastMsg || lastMsg.content !== message || lastMsg.role !== "user") {
      chatMessages.push({ role: "user", content: message });
    }

    // Build the initial messages array
    type Msg =
      | { role: "system" | "user" | "assistant"; content: string }
      | { role: "assistant"; content: string | null; tool_calls: unknown[] }
      | { role: "tool"; tool_call_id: string; content: string };

    const allMessages: Msg[] = [
      { role: "system", content: SYSTEM_PROMPT },
      ...chatMessages,
    ];

    // Loop: keep calling OpenAI until we get a text response (no more tool calls)
    const MAX_TOOL_ROUNDS = 5;
    for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: allMessages as Parameters<
          typeof openai.chat.completions.create
        >[0]["messages"],
        tools,
      });

      const choice = response.choices[0];

      // If no tool calls, we have a final text answer — stream it
      if (
        !choice.message.tool_calls ||
        choice.message.tool_calls.length === 0
      ) {
        const text = choice.message.content || "";
        await convex.mutation(api.messages.send, {
          text,
          role: "assistant",
        });
        return new Response(text, {
          headers: { "Content-Type": "text/plain; charset=utf-8" },
        });
      }

      // Execute all tool calls
      const toolResults = await Promise.all(
        choice.message.tool_calls
          .filter(
            (tc): tc is Extract<typeof tc, { type: "function" }> =>
              tc.type === "function",
          )
          .map(async (tc) => {
            console.log(
              `[Tool call] ${tc.function.name}`,
              tc.function.arguments,
            );
            const result = await executeTool(
              convex,
              tc.function.name,
              tc.function.arguments,
            );
            console.log(
              `[Tool result] ${tc.function.name}:`,
              result.slice(0, 200),
            );
            return {
              role: "tool" as const,
              tool_call_id: tc.id,
              content: result,
            };
          }),
      );

      // Append the assistant message (with tool_calls) and tool results
      allMessages.push(choice.message as Msg);
      allMessages.push(...toolResults);
    }

    // If we exhausted rounds, do one final streaming call WITHOUT tools
    const stream = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: allMessages as Parameters<
        typeof openai.chat.completions.create
      >[0]["messages"],
      stream: true,
    });

    const encoder = new TextEncoder();
    let fullText = "";
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content;
            if (content) {
              fullText += content;
              controller.enqueue(encoder.encode(content));
            }
          }
          await convex.mutation(api.messages.send, {
            text: fullText,
            role: "assistant",
          });
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
      },
    });
  } catch (error: unknown) {
    console.error("Chat API error:", error);
    const apiError = error as { status?: number; code?: string };
    if (apiError?.status === 429 || apiError?.code === "insufficient_quota") {
      return new Response(
        "OpenAI quota exceeded. Please check your billing at platform.openai.com/account/billing.",
        { status: 429 },
      );
    }
    if (apiError?.status === 401) {
      return new Response(
        "Invalid OpenAI API key. Please check your OPENAI_API_KEY in .env.local.",
        { status: 401 },
      );
    }
    return new Response("Something went wrong. Please try again.", {
      status: 500,
    });
  }
}
