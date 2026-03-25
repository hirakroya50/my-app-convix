import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  messages: defineTable({
    text: v.string(),
    role: v.union(v.literal("user"), v.literal("assistant")),
    timestamp: v.number(),
  }).index("by_timestamp", ["timestamp"]),

  // AI Chat – conversations
  aiChatConversations: defineTable({
    title: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_updatedAt", ["updatedAt"]),

  // AI Chat – messages (linked to conversations)
  aiChatMessages: defineTable({
    conversationId: v.id("aiChatConversations"),
    role: v.union(v.literal("user"), v.literal("assistant")),
    text: v.string(),
    timestamp: v.number(),
  }).index("by_conversationId_timestamp", ["conversationId", "timestamp"]),
});
