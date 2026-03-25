import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// List all menu items
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

// Add a new menu item
export const add = mutation({
  args: {
    name: v.string(),
    price: v.number(),
    description: v.string(),
    available: v.boolean(),
    quantity: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("menu", args);
  },
});

// Update an existing menu item
export const update = mutation({
  args: {
    id: v.id("menu"),
    name: v.string(),
    price: v.number(),
    description: v.string(),
    available: v.boolean(),
    quantity: v.number(),
  },
  handler: async (ctx, args) => {
    const { id, ...fields } = args;
    await ctx.db.patch(id, fields);
  },
});

// Delete a menu item
export const remove = mutation({
  args: { id: v.id("menu") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

// Seed default menu items (idempotent — skips if menu already has data)
export const seed = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("menu").first();
    if (existing) return "already_seeded";

    const defaults = [
      { name: "Espresso", price: 3.5, description: "Rich and bold single shot", available: true, quantity: 50 },
      { name: "Cappuccino", price: 4.5, description: "Espresso with steamed milk foam", available: true, quantity: 40 },
      { name: "Latte", price: 5.0, description: "Smooth espresso with steamed milk", available: true, quantity: 40 },
      { name: "Cold Brew", price: 4.0, description: "Slow-steeped cold coffee", available: true, quantity: 30 },
      { name: "Honey Oat Latte", price: 6.0, description: "Local wildflower honey, oat milk, double ristretto", available: true, quantity: 25 },
      { name: "Espresso Tonic", price: 5.0, description: "Chilled tonic, orange peel, a bold espresso float", available: true, quantity: 20 },
      { name: "Matcha Ceremonial", price: 6.5, description: "Grade-A Japanese matcha, steamed oat milk, light foam", available: true, quantity: 15 },
      { name: "Caramel Flat White", price: 5.75, description: "Velvety micro-foam, salted caramel drizzle", available: true, quantity: 30 },
    ];

    for (const item of defaults) {
      await ctx.db.insert("menu", item);
    }
    return "seeded";
  },
});
