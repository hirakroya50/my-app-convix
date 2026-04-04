import { query, mutation, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { requireAuth, requireOwner } from "./users";

// Create a new order with status "pending" (before payment)
// Prices are verified server-side from the menu table to prevent tampering.
export const create = mutation({
  args: {
    items: v.array(
      v.object({
        menuItemId: v.id("menu"),
        quantity: v.number(),
      }),
    ),
    pickupName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireAuth(ctx);

    // Build order items with server-verified prices
    const orderItems = [];
    let totalPrice = 0;

    for (const item of args.items) {
      const menuItem = await ctx.db.get(item.menuItemId);
      if (!menuItem) {
        throw new Error(`Menu item not found`);
      }
      if (!menuItem.available) {
        throw new Error(`${menuItem.name} is currently unavailable`);
      }
      if (menuItem.quantity < item.quantity) {
        throw new Error(
          `Not enough stock for ${menuItem.name}. Available: ${menuItem.quantity}`,
        );
      }
      if (item.quantity < 1) {
        throw new Error(`Invalid quantity for ${menuItem.name}`);
      }

      orderItems.push({
        menuItemId: item.menuItemId,
        name: menuItem.name,
        price: menuItem.price, // server-verified price
        quantity: item.quantity,
      });
      totalPrice += menuItem.price * item.quantity;
    }

    return await ctx.db.insert("orders", {
      userId: user._id,
      items: orderItems,
      totalPrice: Math.round(totalPrice * 100) / 100,
      status: "pending",
      pickupName: args.pickupName || user.name || "Customer",
      timestamp: Date.now(),
    });
  },
});

// Create order from AI chat — no user auth required. Order stays "pending"
// until the Stripe webhook confirms payment. Returns full order data for Stripe.
export const createFromChat = mutation({
  args: {
    items: v.array(
      v.object({
        menuItemId: v.id("menu"),
        quantity: v.number(),
      }),
    ),
    pickupName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const orderItems = [];
    let totalPrice = 0;

    for (const item of args.items) {
      const menuItem = await ctx.db.get(item.menuItemId);
      if (!menuItem) throw new Error("Menu item not found");
      if (!menuItem.available) throw new Error(`${menuItem.name} is currently unavailable`);
      if (menuItem.quantity < item.quantity) {
        throw new Error(`Not enough stock for ${menuItem.name}. Available: ${menuItem.quantity}`);
      }
      if (item.quantity < 1) throw new Error(`Invalid quantity for ${menuItem.name}`);

      orderItems.push({
        menuItemId: item.menuItemId,
        name: menuItem.name,
        price: menuItem.price,
        quantity: item.quantity,
      });
      totalPrice += menuItem.price * item.quantity;
    }

    const computedTotal = Math.round(totalPrice * 100) / 100;

    const orderId = await ctx.db.insert("orders", {
      items: orderItems,
      totalPrice: computedTotal,
      status: "pending",
      pickupName: args.pickupName || "Customer",
      timestamp: Date.now(),
    });

    return { orderId, items: orderItems, totalPrice: computedTotal };
  },
});

// Internal-only: mark order as paid (called only from Stripe webhook).
// NOT exposed as a public mutation — prevents client-side payment bypass.
export const markPaid = internalMutation({
  args: {
    id: v.id("orders"),
    stripeSessionId: v.string(),
  },
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.id);
    if (!order) throw new Error("Order not found");
    if (order.status === "paid") return; // idempotent

    // Decrement stock for each item
    for (const item of order.items) {
      const menuItem = await ctx.db.get(item.menuItemId);
      if (menuItem) {
        await ctx.db.patch(item.menuItemId, {
          quantity: Math.max(0, menuItem.quantity - item.quantity),
        });
      }
    }

    // Update order status and store Stripe session reference
    await ctx.db.patch(args.id, {
      status: "paid",
      stripeSessionId: args.stripeSessionId,
    });

    // Send confirmation message to customer's chat (if user was authenticated)
    if (order.userId) {
      const itemList = order.items
        .map((i) => `${i.quantity}× ${i.name}`)
        .join(", ");
      await ctx.db.insert("messages", {
        userId: order.userId,
        text: `✅ Payment confirmed! Your order (${itemList}) for $${order.totalPrice.toFixed(2)} has been paid. Please pick up at the counter. ☕`,
        role: "assistant",
        timestamp: Date.now(),
      });
    }
  },
});

// Owner: update order pickup status (preparing → ready → picked_up)
export const updateStatus = mutation({
  args: {
    id: v.id("orders"),
    status: v.union(
      v.literal("preparing"),
      v.literal("ready"),
      v.literal("picked_up"),
      v.literal("cancelled"),
    ),
  },
  handler: async (ctx, args) => {
    await requireOwner(ctx);
    const order = await ctx.db.get(args.id);
    if (!order) throw new Error("Order not found");

    await ctx.db.patch(args.id, { status: args.status });

    // Notify customer via chat when order is ready (if user was authenticated)
    if (args.status === "ready" && order.userId) {
      await ctx.db.insert("messages", {
        userId: order.userId,
        text: `🔔 Your order is ready for pickup! Please come to the counter.`,
        role: "assistant",
        timestamp: Date.now(),
      });
    }
  },
});

// List all orders (owner view — all orders)
export const list = query({
  args: {},
  handler: async (ctx) => {
    await requireOwner(ctx);
    return await ctx.db
      .query("orders")
      .withIndex("by_timestamp")
      .order("desc")
      .take(100);
  },
});

// List orders for the logged-in customer
export const myOrders = query({
  args: {},
  handler: async (ctx) => {
    const user = await requireAuth(ctx);
    return await ctx.db
      .query("orders")
      .withIndex("by_userId_timestamp", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(20);
  },
});

// Get a single order (owner, order owner, or orders without userId by orderId)
export const get = query({
  args: { id: v.id("orders") },
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.id);
    if (!order) return null;

    // Orders without userId (chat-initiated) are accessible by orderId
    if (!order.userId) return order;

    // Check if the caller is authenticated
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    const user = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", identity.email))
      .first();
    if (!user) return null;

    // Only the order owner or shop owner can see
    if (order.userId !== user._id && user.role !== "owner") return null;
    return order;
  },
});
