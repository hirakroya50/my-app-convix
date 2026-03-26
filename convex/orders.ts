import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Create a new order with status "pending" (before payment)
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
    // Validate availability (don't decrement stock yet — that happens after payment)
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

    // Create order as "pending"
    return await ctx.db.insert("orders", {
      items: args.items,
      totalPrice: args.totalPrice,
      status: "pending",
      timestamp: Date.now(),
    });
  },
});

// Mark order as paid and decrement stock (called by Stripe webhook or success page)
// Returns true if status was changed, false if already paid (for deduplication)
export const markPaid = mutation({
  args: { id: v.id("orders") },
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.id);
    if (!order) throw new Error("Order not found");
    if (order.status === "paid") return false; // idempotent

    // Decrement stock
    for (const item of order.items) {
      const menuItem = await ctx.db.get(item.menuItemId);
      if (menuItem) {
        await ctx.db.patch(item.menuItemId, {
          quantity: Math.max(0, menuItem.quantity - item.quantity),
        });
      }
    }

    // Update order status
    await ctx.db.patch(args.id, { status: "paid" });
    return true;
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
