import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// ── Conversations ────────────────────────────────────────────────

export const listConversations = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("aiChatConversations")
      .withIndex("by_updatedAt")
      .order("desc")
      .take(50);
  },
});

export const getConversation = query({
  args: { id: v.id("aiChatConversations") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const createConversation = mutation({
  args: { title: v.string() },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("aiChatConversations", {
      title: args.title,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const updateConversationTitle = mutation({
  args: { id: v.id("aiChatConversations"), title: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { title: args.title });
  },
});

export const deleteConversation = mutation({
  args: { id: v.id("aiChatConversations") },
  handler: async (ctx, args) => {
    // Delete all messages in this conversation (batched)
    const messages = await ctx.db
      .query("aiChatMessages")
      .withIndex("by_conversationId_timestamp", (q) =>
        q.eq("conversationId", args.id),
      )
      .take(500);
    for (const msg of messages) {
      await ctx.db.delete(msg._id);
    }
    await ctx.db.delete(args.id);
  },
});

// ── Messages ─────────────────────────────────────────────────────

export const listMessages = query({
  args: { conversationId: v.id("aiChatConversations") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("aiChatMessages")
      .withIndex("by_conversationId_timestamp", (q) =>
        q.eq("conversationId", args.conversationId),
      )
      .take(200);
  },
});

export const sendMessage = mutation({
  args: {
    conversationId: v.id("aiChatConversations"),
    role: v.union(v.literal("user"), v.literal("assistant")),
    text: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("aiChatMessages", {
      conversationId: args.conversationId,
      role: args.role,
      text: args.text,
      timestamp: Date.now(),
    });
    // Bump conversation updatedAt
    await ctx.db.patch(args.conversationId, { updatedAt: Date.now() });
  },
});

export const clearConversation = mutation({
  args: { conversationId: v.id("aiChatConversations") },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("aiChatMessages")
      .withIndex("by_conversationId_timestamp", (q) =>
        q.eq("conversationId", args.conversationId),
      )
      .take(500);
    for (const msg of messages) {
      await ctx.db.delete(msg._id);
    }
  },
});
