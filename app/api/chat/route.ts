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
    const chatMessages: {
      role: "user" | "assistant";
      content: string;
    }[] = history.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.text,
    }));

    // Ensure the current user message is included
    // (it was saved by the client via useMutation before calling this route)
    const lastMsg = chatMessages[chatMessages.length - 1];
    if (!lastMsg || lastMsg.content !== message || lastMsg.role !== "user") {
      chatMessages.push({ role: "user", content: message });
    }

    // First OpenAI call — detect if tools are needed (non-streaming)
    const initialResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...chatMessages,
      ],
      tools,
    });

    const choice = initialResponse.choices[0];
    const encoder = new TextEncoder();

    // If OpenAI wants to call tools
    if (choice.message.tool_calls && choice.message.tool_calls.length > 0) {
      // Execute all tool calls via Convex
      const toolResults = await Promise.all(
        choice.message.tool_calls
          .filter((tc): tc is Extract<typeof tc, { type: "function" }> => tc.type === "function")
          .map(async (tc) => ({
            role: "tool" as const,
            tool_call_id: tc.id,
            content: await executeTool(convex, tc.function.name),
          })),
      );

      // Second call with tool results — streaming
      const stream = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...chatMessages,
          choice.message,
          ...toolResults,
        ],
        stream: true,
      });

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
            // Save the complete assistant response to Convex
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
    }

    // No tool calls — return the text directly
    const text = choice.message.content || "";
    await convex.mutation(api.messages.send, {
      text,
      role: "assistant",
    });
    return new Response(text, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (error: unknown) {
    console.error("Chat API error:", error);
    const apiError = error as { status?: number; code?: string };
    if (apiError?.status === 429 || apiError?.code === "insufficient_quota") {
      return new Response(
        "OpenAI quota exceeded. Please check your billing at platform.openai.com/account/billing.",
        { status: 429 }
      );
    }
    if (apiError?.status === 401) {
      return new Response(
        "Invalid OpenAI API key. Please check your OPENAI_API_KEY in .env.local.",
        { status: 401 }
      );
    }
    return new Response("Something went wrong. Please try again.", {
      status: 500,
    });
  }
}
