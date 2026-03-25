import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Create a new order (called after payment succeeds)
export const create = mutation({
  args: {
    items: v.array(
      v.object({
        menuItemId: v.id("menu"),
        name: v.string(),
        price: v.number(),
        quantity: v.number(),
      }),
    ),
    totalPrice: v.number(),
  },
  handler: async (ctx, args) => {
    // Validate stock and decrement quantities
    for (const item of args.items) {
      const menuItem = await ctx.db.get(item.menuItemId);
      if (!menuItem) {
        throw new Error(`Menu item not found: ${item.name}`);
      }
      if (!menuItem.available) {
        throw new Error(`${item.name} is currently unavailable`);
      }
      if (menuItem.quantity < item.quantity) {
        throw new Error(
          `Not enough stock for ${item.name}. Available: ${menuItem.quantity}`,
        );
      }
    }

    // Decrement stock
    for (const item of args.items) {
      const menuItem = await ctx.db.get(item.menuItemId);
      if (menuItem) {
        await ctx.db.patch(item.menuItemId, {
          quantity: menuItem.quantity - item.quantity,
        });
      }
    }

    // Create the order
    return await ctx.db.insert("orders", {
      items: args.items,
      totalPrice: args.totalPrice,
      status: "paid",
      timestamp: Date.now(),
    });
  },
});

// List all orders (for admin)
export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("orders")
      .withIndex("by_timestamp")
      .order("desc")
      .collect();
  },
});

// Get a single order
export const get = query({
  args: { id: v.id("orders") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});
