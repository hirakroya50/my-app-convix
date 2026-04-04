import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireOwner } from "./users";

// List all menu items (admin view)
export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("menu").collect();
  },
});

// List only available menu items (for customer-facing use)
export const listAvailable = query({
  args: {},
  handler: async (ctx) => {
    const items = await ctx.db.query("menu").collect();
    return items.filter((item) => item.available && item.quantity > 0);
  },
});

// Get a single menu item by id
export const get = query({
  args: { id: v.id("menu") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Add a new menu item (owner only)
export const add = mutation({
  args: {
    name: v.string(),
    price: v.number(),
    description: v.string(),
    category: v.string(),
    available: v.boolean(),
    quantity: v.number(),
    imageEmoji: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireOwner(ctx);
    return await ctx.db.insert("menu", args);
  },
});

// Update an existing menu item (owner only)
export const update = mutation({
  args: {
    id: v.id("menu"),
    name: v.string(),
    price: v.number(),
    description: v.string(),
    category: v.string(),
    available: v.boolean(),
    quantity: v.number(),
    imageEmoji: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireOwner(ctx);
    const { id, ...fields } = args;
    await ctx.db.patch(id, fields);
  },
});

// Delete a menu item (owner only)
export const remove = mutation({
  args: { id: v.id("menu") },
  handler: async (ctx, args) => {
    await requireOwner(ctx);
    await ctx.db.delete(args.id);
  },
});

// Seed default menu items (owner only, idempotent)
export const seed = mutation({
  args: {},
  handler: async (ctx) => {
    await requireOwner(ctx);
    const existing = await ctx.db.query("menu").first();
    if (existing) return "already_seeded";

    const defaults = [
      {
        name: "Espresso",
        price: 3.5,
        description: "Rich and bold single shot",
        category: "Hot Drinks",
        available: true,
        quantity: 50,
        imageEmoji: "☕",
      },
      {
        name: "Cappuccino",
        price: 4.5,
        description: "Espresso with steamed milk foam",
        category: "Hot Drinks",
        available: true,
        quantity: 40,
        imageEmoji: "☕",
      },
      {
        name: "Latte",
        price: 5.0,
        description: "Smooth espresso with steamed milk",
        category: "Hot Drinks",
        available: true,
        quantity: 40,
        imageEmoji: "☕",
      },
      {
        name: "Cold Brew",
        price: 4.0,
        description: "Slow-steeped cold coffee",
        category: "Cold Drinks",
        available: true,
        quantity: 30,
        imageEmoji: "🥤",
      },
      {
        name: "Honey Oat Latte",
        price: 6.0,
        description: "Local wildflower honey, oat milk, double ristretto",
        category: "Specialty",
        available: true,
        quantity: 25,
        imageEmoji: "🍯",
      },
      {
        name: "Espresso Tonic",
        price: 5.0,
        description: "Chilled tonic, orange peel, a bold espresso float",
        category: "Cold Drinks",
        available: true,
        quantity: 20,
        imageEmoji: "🫧",
      },
      {
        name: "Matcha Ceremonial",
        price: 6.5,
        description: "Grade-A Japanese matcha, steamed oat milk, light foam",
        category: "Specialty",
        available: true,
        quantity: 15,
        imageEmoji: "🍵",
      },
      {
        name: "Caramel Flat White",
        price: 5.75,
        description: "Velvety micro-foam, salted caramel drizzle",
        category: "Hot Drinks",
        available: true,
        quantity: 30,
        imageEmoji: "☕",
      },
    ];

    for (const item of defaults) {
      await ctx.db.insert("menu", item);
    }
    return "seeded";
  },
});
