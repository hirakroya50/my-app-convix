import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireOwner } from "./users";

// Get a shop setting by key
export const get = query({
  args: { key: v.string() },
  handler: async (ctx, args) => {
    const setting = await ctx.db
      .query("shopSettings")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .unique();
    return setting?.value ?? null;
  },
});

// Get all shop settings
export const list = query({
  args: {},
  handler: async (ctx) => {
    const settings = await ctx.db.query("shopSettings").collect();
    const map: Record<string, string> = {};
    for (const s of settings) {
      map[s.key] = s.value;
    }
    return map;
  },
});

// Set a shop setting (owner only)
export const set = mutation({
  args: { key: v.string(), value: v.string() },
  handler: async (ctx, args) => {
    await requireOwner(ctx);
    const existing = await ctx.db
      .query("shopSettings")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .unique();
    if (existing) {
      await ctx.db.patch(existing._id, { value: args.value });
    } else {
      await ctx.db.insert("shopSettings", { key: args.key, value: args.value });
    }
  },
});

// Seed default shop settings (owner only, idempotent)
export const seedDefaults = mutation({
  args: {},
  handler: async (ctx) => {
    await requireOwner(ctx);
    const existing = await ctx.db.query("shopSettings").first();
    if (existing) return "already_seeded";

    const defaults = [
      { key: "shopName", value: "Brew Haven" },
      { key: "hours_weekday", value: "Mon – Fri: 6:00 AM – 11:00 PM" },
      { key: "hours_weekend", value: "Sat – Sun: 7:00 AM – 12:00 AM" },
      { key: "address", value: "42 Roaster Lane, Coffeeville, CA 94102" },
      { key: "phone", value: "+1 (415) 555-0182" },
      {
        key: "services",
        value: JSON.stringify([
          {
            name: "Free WiFi",
            description: "High-speed internet throughout the shop",
          },
          {
            name: "Takeaway",
            description: "Grab your favorite drink on the go",
          },
          {
            name: "Dine-in",
            description: "Cozy seating for a relaxed experience",
          },
          {
            name: "Pickup",
            description: "Order online, pick up at the counter",
          },
        ]),
      },
    ];
    for (const d of defaults) {
      await ctx.db.insert("shopSettings", d);
    }
    return "seeded";
  },
});
