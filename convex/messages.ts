import { query, mutation, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { requireAuth } from "./users";

// Get messages for the logged-in user
export const list = query({
  args: {},
  handler: async (ctx) => {
    const user = await requireAuth(ctx);
    return await ctx.db
      .query("messages")
      .withIndex("by_userId_timestamp", (q) => q.eq("userId", user._id))
      .take(100);
  },
});

// Save a new message from the authenticated user
export const send = mutation({
  args: {
    text: v.string(),
    role: v.union(v.literal("user"), v.literal("assistant")),
  },
  handler: async (ctx, args) => {
    const user = await requireAuth(ctx);
    await ctx.db.insert("messages", {
      userId: user._id,
      text: args.text,
      role: args.role,
      timestamp: Date.now(),
    });
  },
});

// Internal: send a message to a specific user (used by system/webhook)
export const sendToUser = internalMutation({
  args: {
    userId: v.id("users"),
    text: v.string(),
    role: v.union(v.literal("user"), v.literal("assistant")),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("messages", {
      userId: args.userId,
      text: args.text,
      role: args.role,
      timestamp: Date.now(),
    });
  },
});

// Clear messages for the logged-in user only
export const clear = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await requireAuth(ctx);
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_userId_timestamp", (q) => q.eq("userId", user._id))
      .take(500);
    for (const message of messages) {
      await ctx.db.delete(message._id);
    }
  },
});
