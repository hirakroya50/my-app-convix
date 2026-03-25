import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get all messages ordered by timestamp
export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("messages")
      .withIndex("by_timestamp")
      .collect();
  },
});

// Save a new message (user or assistant)
export const send = mutation({
  args: {
    text: v.string(),
    role: v.union(v.literal("user"), v.literal("assistant")),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("messages", {
      text: args.text,
      role: args.role,
      timestamp: Date.now(),
    });
  },
});

// Clear all messages (new chat)
export const clear = mutation({
  args: {},
  handler: async (ctx) => {
    const messages = await ctx.db.query("messages").collect();
    for (const message of messages) {
      await ctx.db.delete(message._id);
    }
  },
});
