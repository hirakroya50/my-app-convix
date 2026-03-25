import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import OpenAI from "openai";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `You are a helpful, knowledgeable, and friendly AI assistant. You can help with a wide range of topics including coding, writing, analysis, math, science, and general knowledge.

Guidelines:
- Be concise but thorough
- Use markdown formatting when helpful (headers, lists, bold, code blocks, etc.)
- For code, always specify the language in fenced code blocks
- If you're unsure about something, say so honestly
- Be conversational and helpful`;

export async function POST(req: Request) {
  try {
    const { message, conversationId } = await req.json();
    if (
      !message ||
      typeof message !== "string" ||
      !conversationId ||
      typeof conversationId !== "string"
    ) {
      return new Response("Message and conversationId are required", {
        status: 400,
      });
    }

    // Get conversation history from Convex
    const typedConversationId = conversationId as Id<"aiChatConversations">;
    const history = await convex.query(api.aiChat.listMessages, {
      conversationId: typedConversationId,
    });
    const chatMessages: { role: "user" | "assistant"; content: string }[] =
      history.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.text,
      }));

    // Ensure the current user message is included
    const lastMsg = chatMessages[chatMessages.length - 1];
    if (!lastMsg || lastMsg.content !== message || lastMsg.role !== "user") {
      chatMessages.push({ role: "user", content: message });
    }

    // Stream the response from OpenAI
    const stream = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "system", content: SYSTEM_PROMPT }, ...chatMessages],
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
          // Save the complete assistant response to Convex
          await convex.mutation(api.aiChat.sendMessage, {
            conversationId: typedConversationId,
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
    console.error("AI Chat API error:", error);
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
