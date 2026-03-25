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

  // Dynamic menu items managed by admin
  menu: defineTable({
    name: v.string(),
    price: v.number(),
    description: v.string(),
    available: v.boolean(),
    quantity: v.number(),
  }),

  // Orders placed via chat
  orders: defineTable({
    items: v.array(
      v.object({
        menuItemId: v.id("menu"),
        name: v.string(),
        price: v.number(),
        quantity: v.number(),
      }),
    ),
    totalPrice: v.number(),
    status: v.union(
      v.literal("pending"),
      v.literal("paid"),
      v.literal("cancelled"),
    ),
    timestamp: v.number(),
  }).index("by_timestamp", ["timestamp"]),
});
